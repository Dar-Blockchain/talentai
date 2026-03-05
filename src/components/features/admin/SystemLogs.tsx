import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  styled,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

// Types
import { Log, FetchLogsResponse } from '../../../types/admin';

// Hooks
import { usePagination } from '../../../hooks/usePagination';
import { useAuthToken } from '../../../hooks/useAuthToken';

const GREEN_MAIN = '#7851a9';

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#333',
  marginBottom: theme.spacing(2),
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  backgroundColor: '#ffffff',
}));

/**
 * Get color for HTTP method chip
 */
const getMethodColor = (method: string): { backgroundColor: string; color: string } => {
  switch (method) {
    case 'GET':
      return { backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32' };
    case 'POST':
      return { backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#1976d2' };
    case 'PUT':
      return { backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#f57c00' };
    case 'DELETE':
      return { backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f' };
    default:
      return { backgroundColor: 'rgba(158, 158, 158, 0.1)', color: '#616161' };
  }
};

/**
 * Get color for HTTP status code chip
 */
const getStatusColor = (statusCode: number): { backgroundColor: string; color: string } => {
  if (statusCode >= 200 && statusCode < 300) {
    return { backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32' };
  } else if (statusCode >= 400 && statusCode < 500) {
    return { backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#f57c00' };
  } else if (statusCode >= 500) {
    return { backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f' };
  }
  return { backgroundColor: 'rgba(158, 158, 158, 0.1)', color: '#616161' };
};

/**
 * Get color for log type chip
 */
const getTypeColor = (type: string): { backgroundColor: string; color: string } => {
  if (type === 'Auth') {
    return { backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32' };
  }
  return { backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#1976d2' };
};

interface SystemLogsProps {
  autoFetch?: boolean;
  refreshInterval?: number;
}

/**
 * SystemLogs Component
 * Displays system logs with filtering and pagination
 * Extracted from admin.tsx for better modularity
 */
const SystemLogs: React.FC<SystemLogsProps> = ({ autoFetch = false, refreshInterval }) => {
  // Auth
  const { token, isAuthenticated } = useAuthToken();

  // State
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination - using custom hook
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, getPaginatedData } = usePagination({
    initialRowsPerPage: 10,
  });

  /**
   * Fetch logs from API
   */
  const fetchLogs = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}logs/getAllLogs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data: FetchLogsResponse = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load logs';
      setError(errorMessage);
      console.error('Fetch logs error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  /**
   * Handle page change in pagination
   */
  const handleLogsPageChange = useCallback(
    (event: unknown, newPage: number) => {
      handleChangePage(event, newPage);
    },
    [handleChangePage]
  );

  /**
   * Handle rows per page change in pagination
   */
  const handleLogsRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleChangeRowsPerPage(event);
    },
    [handleChangeRowsPerPage]
  );

  // Get paginated logs
  const paginatedLogs = getPaginatedData(logs);

  // Auto-fetch on mount - always fetch logs when component loads
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchLogs]);

  return (
    <Box sx={{ width: '100%' }}>
      <StyledCard>
        {/* Header with refresh button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <SectionTitle>System Logs</SectionTitle>
          <Button
            variant="outlined"
            onClick={fetchLogs}
            disabled={loading || !isAuthenticated}
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            sx={{
              borderColor: GREEN_MAIN,
              color: GREEN_MAIN,
              '&:hover': {
                borderColor: GREEN_MAIN,
                background: 'rgba(131, 16, 255, 0.08)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: GREEN_MAIN }} />
          </Box>
        ) : (
          <>
            {/* Logs Table */}
            <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Table sx={{ minWidth: 650 }} aria-label="logs table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(131, 16, 255, 0.08)' }}>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>URL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>Execution Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: GREEN_MAIN }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary" sx={{ py: 4 }}>
                          {loading ? 'Loading logs...' : 'No logs available. Click Refresh to fetch logs.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLogs.map((log) => (
                      <TableRow
                        key={log._id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(131, 16, 255, 0.04)',
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={log.type}
                            size="small"
                            sx={{
                              ...getTypeColor(log.type),
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.method}
                            size="small"
                            sx={{
                              ...getMethodColor(log.method),
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                          <Tooltip title={log.url}>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {log.url.length > 30 ? `${log.url.substring(0, 30)}...` : log.url}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.statusCode}
                            size="small"
                            sx={{
                              ...getStatusColor(log.statusCode),
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {log.ip}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {log.user_nom !== 'N/A' ? log.user_nom : 'Anonymous'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {log.executionTime}ms
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={logs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleLogsPageChange}
              onRowsPerPageChange={handleLogsRowsPerPageChange}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            />
          </>
        )}
      </StyledCard>
    </Box>
  );
};

export default React.memo(SystemLogs);
