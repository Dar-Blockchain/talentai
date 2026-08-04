import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLogout } from '@/modules/auth/shared/hooks';
import { Menu as MenuIcon } from 'lucide-react';
import { AdminSidebar } from '@/modules/admin/shared';
import { UserDetailsDialog, type User } from '@/modules/admin/users';
import dynamic from 'next/dynamic';

const AdminDashboardHome        = dynamic(() => import('@/modules/admin/overview').then((m) => m.AdminDashboardHome));
const UserManagement            = dynamic(() => import('@/modules/admin/users').then((m) => m.UserManagement));
const PostsManagement           = dynamic(() => import('@/modules/admin/posts').then((m) => m.PostsManagement));
const PostInterviewAssessments  = dynamic(() => import('@/modules/admin/post-interview').then((m) => m.PostInterviewAssessments));
const SkillInterviewAssessments = dynamic(() => import('@/modules/admin/skill-interview').then((m) => m.SkillInterviewAssessments));
const CompanyConfig             = dynamic(() => import('@/modules/admin/company-config').then((m) => m.CompanyConfig));
const WebinarManagement         = dynamic(() => import('@/modules/admin/webinars').then((m) => m.WebinarManagement));
const BlogManagement            = dynamic(() => import('@/modules/admin/blog').then((m) => m.BlogManagement));

const VALID_TABS = ['dashboard', 'users', 'posts', 'post-interview', 'skill-interview', 'company-config', 'webinars', 'blog'] as const;
type TabName = typeof VALID_TABS[number];

const DashboardAdmin = () => {
  const router = useRouter();
  const handleLogout = useLogout('/signin');

  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser]     = useState<User | null>(null);

  const activeTab = (VALID_TABS.includes(router.query.tab as TabName) ? router.query.tab : 'dashboard') as TabName;

  const handleTabChange = useCallback((tab: TabName) => {
    router.push({ pathname: router.pathname, query: { tab } }, undefined, { shallow: true });
  }, [router]);

  const openUserDialog = (user: User) => { setSelectedUser(user); setUserDialogOpen(true); };

  return (
    <div className="flex h-dvh bg-[#FAFBFC]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />

      <main className="flex flex-col flex-1 min-w-0 overflow-y-auto p-2 sm:p-4 md:p-8">
        <div className="flex items-center mb-4 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 mr-3 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <MenuIcon />
          </button>
          <span className="text-[1.05rem] font-bold text-teal-600">TalentAI Admin</span>
        </div>

        <div className="w-full max-w-[1600px] mx-auto">
          {activeTab === 'dashboard'       && <AdminDashboardHome />}
          {activeTab === 'users'           && (
            <UserManagement
              onUserSelect={openUserDialog}
              onUserEdit={openUserDialog}
            />
          )}
          {activeTab === 'posts'           && <PostsManagement />}
          {activeTab === 'post-interview'  && <PostInterviewAssessments />}
          {activeTab === 'skill-interview' && <SkillInterviewAssessments />}
          {activeTab === 'company-config'  && <CompanyConfig />}
          {activeTab === 'webinars'        && <WebinarManagement />}
          {activeTab === 'blog'            && <BlogManagement />}
        </div>
      </main>

      <UserDetailsDialog
        open={userDialogOpen}
        user={selectedUser}
        onClose={() => setUserDialogOpen(false)}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(DashboardAdmin), { ssr: false });
