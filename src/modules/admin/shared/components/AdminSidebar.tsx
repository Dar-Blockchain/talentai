import React from 'react';
import { Drawer, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  QuestionAnswer as InterviewIcon,
  Psychology as SkillIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { cn } from '@/lib/utils';
import { ADMIN_SIDEBAR_BG, ADMIN_SIDEBAR_BORDER, ADMIN_ACCENT } from '../theme';

const DRAWER_WIDTH = 260;

type TabName = 'dashboard' | 'users' | 'post-interview' | 'skill-interview' | 'company-config';

// Static across all renders — hoisted out of the component so it isn't
// reallocated (and the .map() below doesn't get a new array identity) every render.
const MENU_ITEMS: { id: TabName; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'users', label: 'Users', icon: PeopleIcon },
  { id: 'post-interview', label: 'Post Interview', icon: InterviewIcon },
  { id: 'skill-interview', label: 'Skill Interview', icon: SkillIcon },
  { id: 'company-config', label: 'Company Config', icon: SettingsIcon },
];

interface AdminSidebarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  onLogout: () => void;
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  drawerOpen,
  onDrawerClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={drawerOpen}
      onClose={onDrawerClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: ADMIN_SIDEBAR_BG,
          borderRight: `1px solid ${ADMIN_SIDEBAR_BORDER}`,
        },
      }}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-white rounded-md p-1">
              <img src="/logo-purple.svg" alt="TalentAI" className="h-6 w-auto" />
            </div>
            <span className="text-[13px] font-bold tracking-tight text-white">
              Admin
            </span>
          </Link>
          {isMobile && (
            <button
              onClick={onDrawerClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          )}
        </div>

        <div className="h-px bg-slate-800 mb-4" />

        {/* Navigation Menu */}
        <span className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </span>
        <nav className="flex flex-col gap-0.5 px-0.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (isMobile) onDrawerClose();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] transition-colors text-left",
                  selected
                    ? "text-white font-semibold"
                    : "text-slate-400 font-medium hover:bg-slate-800 hover:text-slate-200",
                )}
                style={selected ? { backgroundColor: ADMIN_ACCENT } : undefined}
              >
                <Icon style={{ fontSize: 20 }} className={selected ? "text-white" : "text-slate-500"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout */}
        <div className="h-px bg-slate-800 mb-1" />
        <div className="px-0.5">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors w-full text-left"
          >
            <LogoutIcon style={{ fontSize: 20 }} className="text-slate-500" />
            Logout
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default React.memo(AdminSidebar);
