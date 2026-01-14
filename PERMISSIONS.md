# Permission System Documentation

## Overview

The TalentAI platform uses a granular permission system to control access to various features. Permissions are stored in the `Permission` model and linked to both User and Profile.

## Backend Model

Location: `Backend/models/PermissionModel.js`

### Permission Categories

#### 1. Job Post Permissions
- `canCreateJobPosts`: Create, edit, delete, and manage job postings

#### 2. Candidate Permissions
- `canUnlockCandidates`: Purchase and unlock candidate profiles using tokens
- `canViewCandidateProfiles`: View unlocked candidate profiles, assessments, and resumes
- `canContactCandidates`: Send messages and communicate with candidates

#### 3. Matching Permissions
- `canAccessMatching`: Access matching algorithm and view candidate matches

#### 4. HR Agent Permissions
- `canUseHRAgents`: Create and manage AI HR agents for recruitment automation

#### 5. Team Permissions
- `canManageTeam`: Manage team members, view team list, and control team settings
- `canInviteMembers`: Send invitations to new team members to join the company
- `canAssignRoles`: Assign and update roles for team members

## Frontend Implementation

### Type Definitions

Location: `src/types/permissions.ts`

```typescript
import { Permission, DEFAULT_PERMISSIONS, PermissionKey } from '@/types/permissions';
```

### Using the Permission Hook

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { permissions, loading, error, hasPermission, refreshPermissions } = usePermissions(userId, profileId);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      {hasPermission('canCreateJobPosts') && (
        <Button>Create Job Post</Button>
      )}
    </div>
  );
}
```

### Using the PermissionGuard Component

```typescript
import PermissionGuard from '@/components/common/PermissionGuard';

function MyComponent() {
  return (
    <PermissionGuard
      userId={userId}
      profileId={profileId}
      requiredPermission="canCreateJobPosts"
      fallback={<Alert severity="warning">You don't have permission to create job posts</Alert>}
    >
      <CreateJobPostButton />
    </PermissionGuard>
  );
}
```

### Using the Permission Check Hook (Advanced)

For complex permission logic requiring multiple permissions:

```typescript
import { usePermissionCheck } from '@/components/common/PermissionGuard';

function MyComponent() {
  const { hasAllPermissions, hasAnyPermission } = usePermissionCheck(
    userId,
    profileId,
    ['canCreateJobPosts', 'canManageTeam']
  );

  return (
    <div>
      {hasAllPermissions() && <Button>Admin Panel</Button>}
      {hasAnyPermission() && <Button>Some Feature</Button>}
    </div>
  );
}
```

## Admin Panel - Managing Permissions

Location: `src/components/dashboard-admin/CompanyPermissionsModal.tsx`

The admin dashboard includes a modal for managing company permissions. Administrators can:
- View all permission categories
- Enable/disable individual permissions
- Select/deselect all permissions at once
- See a summary of enabled permissions

### API Endpoints

#### Get Company Permissions
```
GET /admin/companies/:companyId/permissions
```

#### Update Company Permissions
```
PUT /admin/companies/:companyId/permissions
Body: { ...permissions }
```

## Default Permissions

By default, all permissions are enabled (`true`) for new companies:

```typescript
{
  canCreateJobPosts: true,
  canUnlockCandidates: true,
  canViewCandidateProfiles: true,
  canContactCandidates: true,
  canAccessMatching: true,
  canUseHRAgents: true,
  canManageTeam: true,
  canInviteMembers: true,
  canAssignRoles: true,
}
```

## Best Practices

1. **Always check permissions on both frontend and backend**
   - Frontend checks improve UX by hiding unavailable features
   - Backend checks ensure security

2. **Use PermissionGuard for UI elements**
   - Cleaner code than inline conditionals
   - Consistent permission checking pattern

3. **Use the hook for complex logic**
   - When you need to check multiple permissions
   - When permission state affects component logic

4. **Refresh permissions after updates**
   - Call `refreshPermissions()` after modifying permissions
   - Ensures UI stays in sync with backend

5. **Handle loading and error states**
   - Always show appropriate feedback to users
   - Graceful degradation when permissions can't be loaded

## Example Use Cases

### Hiding a Button Based on Permission

```typescript
function JobPostList() {
  const { hasPermission } = usePermissions(userId, profileId);

  return (
    <div>
      <h1>Job Posts</h1>
      {hasPermission('canCreateJobPosts') && (
        <Button onClick={createNewPost}>Create New Post</Button>
      )}
    </div>
  );
}
```

### Conditional Routing

```typescript
function ProtectedRoute() {
  const { hasPermission, loading } = usePermissions(userId, profileId);

  if (loading) return <CircularProgress />;

  if (!hasPermission('canAccessMatching')) {
    return <Navigate to="/dashboard" />;
  }

  return <MatchingPage />;
}
```

### Feature Toggle

```typescript
function CandidateCard({ candidate }) {
  const { hasPermission } = usePermissions(userId, profileId);

  return (
    <Card>
      <CardContent>
        <Typography>{candidate.name}</Typography>

        {hasPermission('canViewCandidateProfiles') && (
          <Button onClick={() => viewProfile(candidate)}>View Profile</Button>
        )}

        {hasPermission('canContactCandidates') && (
          <Button onClick={() => sendMessage(candidate)}>Contact</Button>
        )}
      </CardContent>
    </Card>
  );
}
```

## Migration Guide

If you're migrating from the old permission system:

### Old Structure
```typescript
interface OldPermissions {
  canManageJobPosts: boolean;
  canAccessCandidates: boolean;
  canUseMatching: boolean;
  canManageRecruitment: boolean;
  canManageTokens: boolean;
  canViewAnalytics: boolean;
  canCommunicate: boolean;
}
```

### New Structure Mapping
- `canManageJobPosts` → `canCreateJobPosts`
- `canAccessCandidates` → Split into `canViewCandidateProfiles` and `canContactCandidates`
- `canUseMatching` → `canAccessMatching`
- `canCommunicate` → `canContactCandidates`
- New: `canUnlockCandidates`, `canUseHRAgents`, `canManageTeam`, `canInviteMembers`, `canAssignRoles`

### Update Your Code
1. Replace old permission keys with new ones
2. Update API calls to use new endpoints
3. Test all permission checks thoroughly
4. Update any hardcoded permission references
