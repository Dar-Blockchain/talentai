import { useState, useEffect, useCallback } from 'react';
import { Permission, DEFAULT_PERMISSIONS } from '@/types/permissions';

interface UsePermissionsReturn {
  permissions: Permission | null;
  loading: boolean;
  error: string | null;
  hasPermission: (permissionKey: keyof Permission) => boolean;
  refreshPermissions: () => Promise<void>;
}

/**
 * Custom hook to manage user permissions
 * Fetches and caches permissions from the backend
 */
export const usePermissions = (userId?: string, profileId?: string): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!userId || !profileId) {
      setPermissions(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch permissions using the user permissions endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}permissions/me`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No permissions found, use defaults (all true)
          console.log('⚠️ [usePermissions] No permissions found, using defaults');
          const defaultPerms: Permission = {
            ...DEFAULT_PERMISSIONS,
            userId,
            profileId,
          };
          setPermissions(defaultPerms);
          return;
        }
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      console.log('📦 [usePermissions] Fetched permissions:', data);

      if (data.success && data.permissions) {
        // Extract only the permission fields and add userId/profileId
        const perms: Permission = {
          userId,
          profileId,
          canCreateJobPosts: data.permissions.canCreateJobPosts ?? true,
          canUnlockCandidates: data.permissions.canUnlockCandidates ?? true,
          canViewCandidateProfiles: data.permissions.canViewCandidateProfiles ?? true,
          canContactCandidates: data.permissions.canContactCandidates ?? true,
          canAccessMatching: data.permissions.canAccessMatching ?? true,
          canUseHRAgents: data.permissions.canUseHRAgents ?? true,
          canManageTeam: data.permissions.canManageTeam ?? true,
          canInviteMembers: data.permissions.canInviteMembers ?? true,
          canAssignRoles: data.permissions.canAssignRoles ?? true,
        };
        console.log('✅ [usePermissions] Processed permissions:', perms);
        setPermissions(perms);
      } else {
        // Use default permissions if response is invalid
        console.log('⚠️ [usePermissions] Invalid response, using defaults');
        const defaultPerms: Permission = {
          ...DEFAULT_PERMISSIONS,
          userId,
          profileId,
        };
        setPermissions(defaultPerms);
      }
    } catch (err: any) {
      console.error('❌ [usePermissions] Error fetching permissions:', err);
      setError(err.message || 'Failed to fetch permissions');

      // Fallback to default permissions on error
      const defaultPerms: Permission = {
        ...DEFAULT_PERMISSIONS,
        userId: userId || '',
        profileId: profileId || '',
      };
      setPermissions(defaultPerms);
    } finally {
      setLoading(false);
    }
  }, [userId, profileId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback(
    (permissionKey: keyof Permission): boolean => {
      if (!permissions) return false;

      // Exclude non-permission fields
      const nonPermissionKeys = ['_id', 'userId', 'profileId', 'lastModifiedBy', 'notes', 'createdAt', 'updatedAt'];
      if (nonPermissionKeys.includes(permissionKey)) return false;

      return Boolean(permissions[permissionKey]);
    },
    [permissions]
  );

  return {
    permissions,
    loading,
    error,
    hasPermission,
    refreshPermissions: fetchPermissions,
  };
};

/**
 * Helper function to check if user has permission (without hook)
 * Useful for one-off checks
 */
export const checkPermission = async (
  userId: string,
  profileId: string,
  permissionKey: keyof Permission
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('api_token');
    if (!token) return false;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}permissions/${userId}/${profileId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.permission) {
      return Boolean(data.permission[permissionKey]);
    }

    return false;
  } catch (err) {
    console.error('Error checking permission:', err);
    return false;
  }
};
