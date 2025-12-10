import { useState, useEffect, useCallback } from 'react';

export interface UseAuthTokenReturn {
  /**
   * The authentication token from localStorage
   */
  token: string | null;

  /**
   * Whether the token is being loaded
   */
  loading: boolean;

  /**
   * Error message if token retrieval failed
   */
  error: string | null;

  /**
   * Whether a valid token exists
   */
  isAuthenticated: boolean;

  /**
   * Manually refresh/reload the token
   */
  refreshToken: () => void;

  /**
   * Clear the token and force logout
   */
  clearToken: () => void;

  /**
   * Get authorization header object for API calls
   */
  getAuthHeaders: () => Record<string, string>;
}

export interface UseAuthTokenOptions {
  /**
   * Key to use for localStorage
   * @default 'api_token'
   */
  storageKey?: string;

  /**
   * Automatically refresh token when storage changes
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Callback when token changes
   */
  onTokenChange?: (token: string | null) => void;

  /**
   * Callback when authentication fails
   */
  onAuthError?: (error: string) => void;
}

/**
 * Custom hook for managing authentication token
 * Eliminates repeated token fetching from localStorage in every API call
 *
 * @example
 * ```tsx
 * const { token, isAuthenticated, getAuthHeaders } = useAuthToken();
 *
 * const fetchData = async () => {
 *   if (!isAuthenticated) {
 *     console.error('Not authenticated');
 *     return;
 *   }
 *
 *   const response = await fetch(apiUrl, {
 *     headers: getAuthHeaders()
 *   });
 * };
 * ```
 */
export const useAuthToken = (options: UseAuthTokenOptions = {}): UseAuthTokenReturn => {
  const {
    storageKey = 'api_token',
    autoRefresh = true,
    onTokenChange,
    onAuthError,
  } = options;

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadToken = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const storedToken = localStorage.getItem(storageKey);

      if (!storedToken) {
        setError('Authentication token not found');
        onAuthError?.('Authentication token not found');
        setToken(null);
      } else {
        setToken(storedToken);
        onTokenChange?.(storedToken);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve token';
      setError(errorMessage);
      onAuthError?.(errorMessage);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [storageKey, onTokenChange, onAuthError]);

  const refreshToken = useCallback(() => {
    loadToken();
  }, [loadToken]);

  const clearToken = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setToken(null);
      setError(null);
      onTokenChange?.(null);
    } catch (err) {
      console.error('Failed to clear token:', err);
    }
  }, [storageKey, onTokenChange]);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  // Load token on mount
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Listen for storage changes (e.g., login/logout in another tab)
  useEffect(() => {
    if (!autoRefresh) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [autoRefresh, storageKey, loadToken]);

  const isAuthenticated = Boolean(token && !error);

  return {
    token,
    loading,
    error,
    isAuthenticated,
    refreshToken,
    clearToken,
    getAuthHeaders,
  };
};

/**
 * Hook for authenticated API calls with automatic error handling
 *
 * @example
 * ```tsx
 * const { fetchWithAuth, loading, error } = useAuthenticatedFetch();
 *
 * const loadUsers = async () => {
 *   const data = await fetchWithAuth('/users');
 *   setUsers(data);
 * };
 * ```
 */
export const useAuthenticatedFetch = (options: UseAuthTokenOptions = {}) => {
  const { token, isAuthenticated, getAuthHeaders } = useAuthToken(options);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = useCallback(
    async <T = any>(url: string, init?: RequestInit): Promise<T | null> => {
      if (!isAuthenticated) {
        const authError = 'Not authenticated';
        setError(authError);
        throw new Error(authError);
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          ...init,
          headers: {
            ...getAuthHeaders(),
            ...init?.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Fetch failed';
        setError(errorMessage);
        console.error('Authenticated fetch error:', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  return {
    fetchWithAuth,
    loading,
    error,
    token,
    isAuthenticated,
  };
};

export default useAuthToken;
