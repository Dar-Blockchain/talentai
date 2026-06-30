import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLogout } from '@/modules/auth/shared/hooks';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AdminSidebar } from '@/modules/admin/shared';
import {
  UserDetailsDialog, CompanyPermissionsModal,
  type CompanyPermissions, type User, useSaveCompanyPermissionsMutation,
} from '@/modules/admin/users';
import dynamic from 'next/dynamic';

const AdminDashboardHome      = dynamic(() => import('@/modules/admin/overview').then((m) => m.AdminDashboardHome));
const UserManagement          = dynamic(() => import('@/modules/admin/users').then((m) => m.UserManagement));
const PostsManagement         = dynamic(() => import('@/modules/admin/posts').then((m) => m.PostsManagement));
const PostInterviewAssessments  = dynamic(() => import('@/modules/admin/post-interview').then((m) => m.PostInterviewAssessments));
const SkillInterviewAssessments = dynamic(() => import('@/modules/admin/skill-interview').then((m) => m.SkillInterviewAssessments));
const CompanyConfig           = dynamic(() => import('@/modules/admin/company-config').then((m) => m.CompanyConfig));

const VALID_TABS = ['dashboard', 'users', 'posts', 'post-interview', 'skill-interview', 'company-config'] as const;
type TabName = typeof VALID_TABS[number];

const DashboardAdmin = () => {
  const router = useRouter();
  const handleLogout = useLogout('/signin');
  const { mutateAsync: saveCompanyPermissions } = useSaveCompanyPermissionsMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen]             = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser]     = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<User | null>(null);

  const activeTab = (VALID_TABS.includes(router.query.tab as TabName) ? router.query.tab : 'dashboard') as TabName;

  const handleTabChange = useCallback((tab: TabName) => {
    router.push({ pathname: router.pathname, query: { tab } }, undefined, { shallow: true });
  }, [router]);

  const handleSavePermissions = async (companyId: string, permissions: CompanyPermissions) => {
    await saveCompanyPermissions({ companyId, permissions });
  };

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />

      <main className="flex flex-col flex-1 min-h-screen p-2 sm:p-4 md:p-8">
        {/* Mobile header */}
        <div className="flex items-center mb-4 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 mr-3 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <MenuIcon />
          </button>
          <span className="text-[1.05rem] font-bold text-teal-600">TalentAI Admin</span>
        </div>

        {/* Content */}
        <div className="w-full max-w-[1600px] mx-auto">
          {activeTab === 'dashboard'       && <AdminDashboardHome />}
          {activeTab === 'users'           && (
            <UserManagement
              onUserSelect={(user) => { setSelectedUser(user); setUserDialogOpen(true); }}
              onUserEdit={(user)   => { setSelectedUser(user); setUserDialogOpen(true); }}
              onManagePermissions={(user) => { setSelectedCompany(user); setPermissionsDialogOpen(true); }}
            />
          )}
          {activeTab === 'posts'           && <PostsManagement />}
          {activeTab === 'post-interview'  && <PostInterviewAssessments />}
          {activeTab === 'skill-interview' && <SkillInterviewAssessments />}
          {activeTab === 'company-config'  && <CompanyConfig />}
        </div>
      </main>

      <UserDetailsDialog
        open={userDialogOpen}
        user={selectedUser}
        onClose={() => setUserDialogOpen(false)}
      />
      <CompanyPermissionsModal
        open={permissionsDialogOpen}
        onClose={() => { setPermissionsDialogOpen(false); setSelectedCompany(null); }}
        company={selectedCompany}
        onSave={handleSavePermissions}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(DashboardAdmin), { ssr: false });
