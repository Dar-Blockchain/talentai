import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLogout } from '@/modules/auth/shared/hooks';
import {
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AdminSidebar, ADMIN_ACCENT } from '@/modules/admin/shared';
import {
  UserDetailsDialog, CompanyPermissionsModal,
  type CompanyPermissions, type User, useSaveCompanyPermissionsMutation,
} from '@/modules/admin/users';
import dynamic from 'next/dynamic';

// Each admin tab is fetched + code-split on demand — only the active tab's
// JS (and its heavy deps like recharts/react-leaflet) is downloaded, instead
// of bundling all 6 tabs' code into the initial admin dashboard chunk.
const AdminDashboardHome = dynamic(() => import('@/modules/admin/overview').then((m) => m.AdminDashboardHome));
const UserManagement = dynamic(() => import('@/modules/admin/users').then((m) => m.UserManagement));
const PostsManagement = dynamic(() => import('@/modules/admin/posts').then((m) => m.PostsManagement));
const PostInterviewAssessments = dynamic(() => import('@/modules/admin/post-interview').then((m) => m.PostInterviewAssessments));
const SkillInterviewAssessments = dynamic(() => import('@/modules/admin/skill-interview').then((m) => m.SkillInterviewAssessments));
const CompanyConfig = dynamic(() => import('@/modules/admin/company-config').then((m) => m.CompanyConfig));

const VALID_TABS = ['dashboard', 'users', 'posts', 'post-interview', 'skill-interview', 'company-config'] as const;
type TabName = typeof VALID_TABS[number];

const DashboardAdmin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const handleLogout = useLogout("/signin");
  const { mutateAsync: saveCompanyPermissions } = useSaveCompanyPermissionsMutation();

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const activeTab = (VALID_TABS.includes(router.query.tab as TabName) ? router.query.tab : 'dashboard') as TabName;

  const handleTabChange = useCallback((tab: TabName) => {
    router.push({ pathname: router.pathname, query: { tab } }, undefined, { shallow: true });
  }, [router]);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<User | null>(null);

  const handleSavePermissions = async (companyId: string, permissions: CompanyPermissions) => {
    await saveCompanyPermissions({ companyId, permissions });
  };

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFBFC' }}>
        {/* Sidebar */}
        <Box sx={{ position: 'relative' }}>
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            drawerOpen={drawerOpen}
            onDrawerClose={() => setDrawerOpen(false)}
          />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            bgcolor: '#FAFBFC',
            p: { xs: 1, sm: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center mb-4">
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 mr-3 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <MenuIcon />
              </button>
              <span className="text-[1.05rem] font-bold" style={{ color: ADMIN_ACCENT }}>
                TalentAI Admin
              </span>
            </div>
          )}

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: { xs: '100%', sm: '98vw', md: '1200px', lg: '1400px', xl: '1600px' },
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: 'auto', md: 'calc(100vh - 48px)' },
              p: { xs: 0.5, sm: 2, md: 4 },
              bgcolor: 'transparent',
            }}
          >
            <Box sx={{ width: '100%' }}>
              {activeTab === 'dashboard' && <AdminDashboardHome />}
              {activeTab === 'users' && (
                <UserManagement
                  onUserSelect={(user) => {
                    setSelectedUser(user);
                    setUserDialogOpen(true);
                  }}
                  onUserEdit={(user) => {
                    setSelectedUser(user);
                    setUserDialogOpen(true);
                  }}
                  onUserDelete={(_userId) => {
                  }}
                  onManagePermissions={(user) => {
                    setSelectedCompany(user);
                    setPermissionsDialogOpen(true);
                  }}
                />
              )}
              {activeTab === 'posts' && <PostsManagement />}
              {activeTab === 'post-interview' && <PostInterviewAssessments />}
              {activeTab === 'skill-interview' && <SkillInterviewAssessments />}
              {activeTab === 'company-config' && <CompanyConfig />}
            </Box>
          </Box>
        </Box>

        {/* Dialogs */}
        <UserDetailsDialog
          open={userDialogOpen}
          user={selectedUser}
          onClose={() => setUserDialogOpen(false)}
          onEdit={(_user) => {
          }}
        />
        <CompanyPermissionsModal
          open={permissionsDialogOpen}
          onClose={() => {
            setPermissionsDialogOpen(false);
            setSelectedCompany(null);
          }}
          company={selectedCompany}
          onSave={handleSavePermissions}
        />
      </Box>
  );
};

export default dynamic(() => Promise.resolve(DashboardAdmin), {
  ssr: false
});
