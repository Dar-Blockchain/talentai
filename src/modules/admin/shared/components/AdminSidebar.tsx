import React from 'react';
import Link from 'next/link';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  QuestionAnswer as InterviewIcon,
  Psychology as SkillIcon,
  Settings as SettingsIcon,
  WorkOutline as PostsIcon,
} from '@mui/icons-material';
import { cn } from '@/lib/utils';

const DRAWER_WIDTH = 240;

type TabName = 'dashboard' | 'users' | 'posts' | 'post-interview' | 'skill-interview' | 'company-config';

const GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard' as TabName, label: 'Dashboard', icon: DashboardIcon },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'users'           as TabName, label: 'Users',           icon: PeopleIcon    },
      { id: 'posts'           as TabName, label: 'Posts',           icon: PostsIcon     },
      { id: 'post-interview'  as TabName, label: 'Post Interview',  icon: InterviewIcon },
      { id: 'skill-interview' as TabName, label: 'Skill Interview', icon: SkillIcon     },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'company-config' as TabName, label: 'Company Config', icon: SettingsIcon },
    ],
  },
];

interface AdminSidebarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  onLogout: () => void;
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

const SidebarContent: React.FC<AdminSidebarProps> = ({
  activeTab, onTabChange, onLogout, onDrawerClose,
}) => (
  <div className="flex flex-col h-full bg-white">
    {/* Logo bar */}
    <div className="h-16 flex items-center justify-between px-4 bg-[#F7FBF9] border-b border-gray-200 shrink-0">
      <Link href="/">
        <img src="/logo.svg" alt="TalentAI" className="h-9 cursor-pointer" />
      </Link>
      <button
        onClick={onDrawerClose}
        className="md:hidden w-7 h-7 flex items-center justify-center rounded-[7px] border border-gray-200 bg-gray-100 text-gray-500"
      >
        <CloseIcon style={{ fontSize: 16 }} />
      </button>
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto py-3 px-2">
      {GROUPS.map((group) => (
        <div key={group.label} className="mb-3">
          <p className="px-2.5 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-[0.14em]">
            {group.label}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onDrawerClose(); }}
                className={cn(
                  'group relative flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-[9px] text-left transition-colors duration-100',
                  active
                    ? 'bg-[rgba(82,232,153,0.13)] text-teal-600'
                    : 'text-gray-700 hover:bg-[rgba(106,211,156,0.10)]',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px] bg-[#52e899]" />
                )}
                <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', active ? 'text-teal-600' : 'text-gray-500')}>
                  <Icon style={{ fontSize: 20 }} />
                </span>
                <span className={cn('text-[14px] leading-none', active ? 'font-bold' : 'font-semibold')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>

    {/* Footer */}
    <div className="px-2 pb-3.5 pt-2.5 border-t border-gray-200 bg-[#F7FBF9] shrink-0">
      <button
        onClick={onLogout}
        className="group flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-[9px] text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors duration-100"
      >
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-500 group-hover:text-red-500">
          <LogoutIcon style={{ fontSize: 20 }} />
        </span>
        <span className="text-[14px] font-semibold leading-none">Logout</span>
      </button>
    </div>
  </div>
);

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  const { drawerOpen, onDrawerClose } = props;
  return (
    <>
      {/* Desktop — persistent */}
      <aside
        className="hidden md:flex flex-col shrink-0 border-r border-gray-200 shadow-[2px_0_12px_rgba(0,0,0,0.06)]"
        style={{ width: DRAWER_WIDTH }}
      >
        <SidebarContent {...props} onDrawerClose={() => {}} />
      </aside>

      {/* Mobile — overlay */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={onDrawerClose}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 shadow-xl md:hidden"
            style={{ width: DRAWER_WIDTH }}
          >
            <SidebarContent {...props} />
          </aside>
        </>
      )}
    </>
  );
};

export default React.memo(AdminSidebar);
