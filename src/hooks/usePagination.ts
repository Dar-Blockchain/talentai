import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  page: number;
  rowsPerPage: number;
}

export interface PaginationHandlers {
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetPagination: () => void;
}

export interface UsePaginationReturn extends PaginationState, PaginationHandlers {
  /**
   * Get paginated data from an array
   * @param data - Array of data to paginate
   * @returns Paginated slice of data
   */
  getPaginatedData: <T>(data: T[]) => T[];

  /**
   * Total number of pages
   */
  totalPages: (totalItems: number) => number;

  /**
   * Check if there are more pages
   */
  hasMore: (totalItems: number) => boolean;
}

export interface UsePaginationOptions {
  /**
   * Initial page number (0-indexed)
   * @default 0
   */
  initialPage?: number;

  /**
   * Initial rows per page
   * @default 10
   */
  initialRowsPerPage?: number;

  /**
   * Callback when page changes
   */
  onPageChange?: (page: number) => void;

  /**
   * Callback when rows per page changes
   */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Custom hook for managing pagination state
 * Replaces duplicate pagination state management in admin dashboard
 *
 * @example
 * ```tsx
 * const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, getPaginatedData } = usePagination();
 *
 * const paginatedUsers = getPaginatedData(users);
 *
 * <TablePagination
 *   page={page}
 *   rowsPerPage={rowsPerPage}
 *   onPageChange={handleChangePage}
 *   onRowsPerPageChange={handleChangeRowsPerPage}
 * />
 * ```
 */
export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 0,
    initialRowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
  } = options;

  const [page, setPage] = useState<number>(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      setRowsPerPage(newRowsPerPage);
      setPage(0); // Reset to first page when changing rows per page
      onRowsPerPageChange?.(newRowsPerPage);
    },
    [onRowsPerPageChange]
  );

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setRowsPerPage(initialRowsPerPage);
  }, [initialPage, initialRowsPerPage]);

  const getPaginatedData = useCallback(
    <T,>(data: T[]): T[] => {
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return data.slice(startIndex, endIndex);
    },
    [page, rowsPerPage]
  );

  const totalPages = useCallback(
    (totalItems: number): number => {
      return Math.ceil(totalItems / rowsPerPage);
    },
    [rowsPerPage]
  );

  const hasMore = useCallback(
    (totalItems: number): boolean => {
      return (page + 1) * rowsPerPage < totalItems;
    },
    [page, rowsPerPage]
  );

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPagination,
    getPaginatedData,
    totalPages,
    hasMore,
  };
};

/**
 * Hook for managing multiple pagination instances
 * Useful when you have multiple tables on the same page
 *
 * @example
 * ```tsx
 * const {
 *   users: usersPagination,
 *   assessments: assessmentsPagination,
 *   logs: logsPagination
 * } = useMultiplePagination({
 *   users: { initialRowsPerPage: 10 },
 *   assessments: { initialRowsPerPage: 5 },
 *   logs: { initialRowsPerPage: 20 }
 * });
 *
 * <TablePagination {...usersPagination} />
 * <TablePagination {...assessmentsPagination} />
 * ```
 */
export const useMultiplePagination = <T extends string>(
  configs: Record<T, UsePaginationOptions>
): Record<T, UsePaginationReturn> => {
  const paginationStates = {} as Record<T, UsePaginationReturn>;

  for (const key in configs) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    paginationStates[key] = usePagination(configs[key]);
  }

  return paginationStates;
};

export default usePagination;
