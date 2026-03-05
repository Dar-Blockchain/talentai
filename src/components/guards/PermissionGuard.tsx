import React, { ReactNode } from 'react';
import { Permission } from '@/types/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { Box, CircularProgress, Alert } from '@mui/material';

interface PermissionGuardProps {
  userId?: string;
  profileId?: string;
  requiredPermission: keyof Permission;
  fallback?: ReactNode;
  showLoading?: boolean;
  showError?: boolean;
  children: ReactNode;
}

/**
 * PermissionGuard Component
 *
 * Conditionally renders children based on user permissions.
 *
 * @example
 * <PermissionGuard
 *   userId={userId}
 *   profileId={profileId}
 *   requiredPermission="canCreateJobPosts"
 *   fallback={<Alert severity="warning">You don't have permission to create job posts</Alert>}
 * >
 *   <CreateJobPostButton />
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  userId,
  profileId,
  requiredPermission,
  fallback = null,
  showLoading = true,
  showError = true,
  children,
}) => {
  const { permissions, loading, error, hasPermission } = usePermissions(userId, profileId);

  if (loading && showLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error && showError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load permissions: {error}
      </Alert>
    );
  }

  if (!permissions || !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;

/**
 * Hook-based alternative for more complex permission logic
 */
export const usePermissionCheck = (
  userId?: string,
  profileId?: string,
  requiredPermissions?: Array<keyof Permission>
) => {
  const { permissions, loading, error, hasPermission } = usePermissions(userId, profileId);

  const hasAllPermissions = React.useCallback(() => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) => hasPermission(perm));
  }, [requiredPermissions, hasPermission]);

  const hasAnyPermission = React.useCallback(() => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some((perm) => hasPermission(perm));
  }, [requiredPermissions, hasPermission]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};
