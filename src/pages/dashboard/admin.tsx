import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { logout } from '@/store/slices/authSlice';
import { saveCompanyPermissions } from '@/store/slices/adminSlice';
import AdminSidebar from '@/components/dashboard-admin/AdminSidebar';
import AdminDashboardHome from '@/components/dashboard-admin/AdminDashboardHome';
import UserManagement from '@/components/dashboard-admin/UserManagement';
import UserDetailsDialog from '@/components/dashboard-admin/UserDetailsDialog';
import AssessmentDetailsDialog from '@/components/dashboard-admin/AssessmentDetailsDialog';
import PostInterviewAssessments from '@/components/dashboard-admin/PostInterviewAssessments';
import SkillInterviewAssessments from '@/components/dashboard-admin/SkillInterviewAssessments';
import CompanyPermissionsModal, { CompanyPermissions } from '@/components/dashboard-admin/CompanyPermissionsModal';
import RoleGuard from '@/components/guards/RoleGuard';
import dynamic from 'next/dynamic';

const GREEN_MAIN = '#8310FF';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Company' | 'Candidate' | 'jury';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  ip?: string;
  Localisation?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    company?: string;
    position?: string;
  };
}

interface Assessment {
  _id: string;
  jobId?: any;
  jobName?: string;
  jobDescription?: string;
  numberOfAttempts: number;
  averageScore: number;
  totalQuestions: number;
  assessments: any[];
}

const DashboardAdmin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<User | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [dispatch]);

  const handleSavePermissions = async (companyId: string, permissions: CompanyPermissions) => {
    await dispatch(saveCompanyPermissions({ companyId, permissions })).unwrap();
  };

  return (
    <RoleGuard allowedRoles={['Admin']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
        {/* Sidebar */}
        <Box sx={{ position: 'relative', bgcolor: '#fff' }}>
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
            bgcolor: '#fff',
            p: { xs: 1, sm: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile Header */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                TalentAI Admin
              </Typography>
            </Box>
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
              bgcolor: '#fff',
            }}
          >
            <Box sx={{ width: '100%' }}>
              {activeTab === 0 && <AdminDashboardHome />}
              {activeTab === 1 && (
                <UserManagement
                  onUserSelect={(user) => {
                    setSelectedUser(user);
                    setUserDialogOpen(true);
                  }}
                  onUserEdit={(user) => {
                    setSelectedUser(user);
                    setUserDialogOpen(true);
                  }}
                  onUserDelete={(userId) => {
                    console.log('Delete user:', userId);
                  }}
                  onManagePermissions={(user) => {
                    setSelectedCompany(user);
                    setPermissionsDialogOpen(true);
                  }}
                />
              )}
              {activeTab === 2 && <PostInterviewAssessments />}
              {activeTab === 3 && <SkillInterviewAssessments />}
            </Box>
          </Box>
        </Box>

        {/* Dialogs */}
        <UserDetailsDialog
          open={userDialogOpen}
          user={selectedUser}
          onClose={() => setUserDialogOpen(false)}
          onEdit={(user) => {
            console.log('Edit user:', user);
          }}
        />
        <AssessmentDetailsDialog
          open={assessmentDialogOpen}
          assessment={selectedAssessment}
          onClose={() => setAssessmentDialogOpen(false)}
          onEdit={(assessment) => {
            console.log('Edit assessment:', assessment);
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
    </RoleGuard>
  );
};

export default dynamic(() => Promise.resolve(DashboardAdmin), {
  ssr: false
});
