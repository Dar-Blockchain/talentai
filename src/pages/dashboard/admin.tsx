import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
    Box,
    Typography,
    IconButton,
    Alert,
    CircularProgress,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
} from '@mui/icons-material';
import { logout, setLoggingOut } from '@/store/slices/authSlice';
import AdminWorldMap from '@/components/dashboard-admin/AdminWorldMap';
import AdminSkillsDistribution from '@/components/dashboard-admin/AdminSkillsDistribution';
import AdminGrowthAnalytics from '@/components/dashboard-admin/AdminGrowthAnalytics';
import AdminHeader from '@/components/dashboard-admin/AdminHeader';
import AdminStatsCards from '@/components/dashboard-admin/AdminStatsCards';
import AdminSkillsBarChart from '@/components/dashboard-admin/AdminSkillsBarChart';
import UserManagement from '@/components/dashboard-admin/UserManagement';
import AdminSidebar from '@/components/dashboard-admin/AdminSidebar';
import UserDetailsDialog from '@/components/dashboard-admin/UserDetailsDialog';
import AssessmentDetailsDialog from '@/components/dashboard-admin/AssessmentDetailsDialog';
import PostInterviewAssessments from '@/components/dashboard-admin/PostInterviewAssessments';
import SkillInterviewAssessments from '@/components/dashboard-admin/SkillInterviewAssessments';
import CompanyPermissionsModal, { CompanyPermissions } from '@/components/dashboard-admin/CompanyPermissionsModal';

// Utilities
import { getCountryName } from '@/utils/countryMappings';
import RoleGuard from '@/components/guards/RoleGuard';
import dynamic from 'next/dynamic';

// Constants
const GREEN_MAIN = '#8310FF';

// Interfaces
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
    jobId?: {
        _id: string;
        title: string;
        description: string;
        requirements: string[];
        responsibilities: string[];
        location: string;
        employmentType: string;
        experienceLevel: string;
        salary: {
            min: number;
            max: number;
            currency: string;
        };
        createdAt: string;
    };
    jobName?: string;
    jobDescription?: string;
    numberOfAttempts: number;
    averageScore: number;
    totalQuestions: number;
    assessments: Array<{
        _id: string;
        condidateId: string;
        companyId: string;
        jobId: {
            _id: string;
            title: string;
            description: string;
            requirements: string[];
            responsibilities: string[];
            location: string;
            employmentType: string;
            experienceLevel: string;
            salary: {
                min: number;
                max: number;
                currency: string;
            };
            createdAt: string;
        };
        timestamp: string;
        assessmentType: string;
        numberOfQuestions: number;
        analysis: {
            overallScore: number;
            skillAnalysis: Array<{
                skillName: string;
                requiredLevel: number;
                demonstratedExperienceLevel: number;
                strengths: string[];
                weaknesses: string[];
                confidenceScore: number;
                match: string;
                levelGap: number;
            }>;
            recommendations: string[];
            technicalLevel: string;
            nextSteps: string[];
            jobMatch: {
                percentage: number;
                status: string;
                keyGaps: string[];
            };
            skillProgression: any[];
        };
        candidateDetails?: any;
        companyDetails?: any;
    }>;
}

interface TopSkill {
    _id: string;
    count: number;
    avgLevel: number;
}

interface DashboardStats {
    users: number;
    posts: number;
    jobAssessments: number;
    jobAssessmentsWithScore: number;
    jobAssessmentsWithScorePercentage: number;
    feedback: number;
    bids: number;
    avgOverallScore: number;
    totalSkills: number;
    totalHardSkills: number;
    totalSoftSkills: number;
    hardSkillsPercentage: number;
    softSkillsPercentage: number;
    topSkills: TopSkill[];
}

interface Log {
    _id: string;
    type: string;
    method: string;
    url: string;
    ip: string;
    referer: string;
    statusCode: number;
    user_id: string;
    user_nom: string;
    headers: string;
    executionTime: number;
    body: string;
    timestamp: string;
    __v: number;
}

// Mock data for charts
const assessmentPerformanceData = [
    { name: 'Technical', value: 45, color: '#8884d8' },
    { name: 'Soft Skills', value: 30, color: '#82ca9d' },
    { name: 'Personality', value: 25, color: '#ffc658' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardAdmin = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const dispatch = useDispatch<AppDispatch>();

    // State management
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [activeTab, setActiveTab] = useState(0);
    const [usersPage, setUsersPage] = useState(0);
    const [usersRowsPerPage, setUsersRowsPerPage] = useState(10);

    // Data state
    const [stats, setStats] = useState<DashboardStats>({
        users: 0,
        posts: 0,
        jobAssessments: 0,
        jobAssessmentsWithScore: 0,
        jobAssessmentsWithScorePercentage: 0,
        feedback: 0,
        bids: 0,
        avgOverallScore: 0,
        totalSkills: 0,
        totalHardSkills: 0,
        totalSoftSkills: 0,
        hardSkillsPercentage: 0,
        softSkillsPercentage: 0,
        topSkills: [],
    });
    const [users, setUsers] = useState<User[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [allUsersForMap, setAllUsersForMap] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [skillDistribution, setSkillDistribution] = useState([
        { name: 'Hard Skills', value: 0, color: '#8884d8' },
        { name: 'Soft Skills', value: 0, color: '#82ca9d' }
    ]);
    const [skillsData, setSkillsData] = useState<Array<{ skill: string; count: number }>>([]);
    const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    // Dialog states
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
    const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<User | null>(null);

    // Add filter state
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [userStatusFilter, setUserStatusFilter] = useState('');
    const [assessmentSearch, setAssessmentSearch] = useState('');
    const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('');
    const [assessmentStatusFilter, setAssessmentStatusFilter] = useState('');

    // Add totalUsers state
    const [totalUsers, setTotalUsers] = useState(0);

    // Add username and email filter state
    const [userUsernameFilter, setUserUsernameFilter] = useState('');
    const [userEmailFilter, setUserEmailFilter] = useState('');

    // Fetch assessment results function - Now handled by AssessmentResults component
    // Removed: fetchAssessmentResults, skillSearch, setSkillSearch

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, [usersPage, usersRowsPerPage]);

    useEffect(() => {
        if (activeTab === 2) {
            fetchAssessments();
        }
    }, [activeTab]);

    // Assessment Results fetching - Now handled by AssessmentResults component
    // Removed: useEffect for fetchAssessmentResults()

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [allUsers] = await Promise.all([
                fetchAllUsersForMap(),
                fetchStats(),
                fetchUserGrowthData(),
                fetchSkillsData(),
                fetchUsers(usersPage + 1, usersRowsPerPage),
                fetchAssessments()
            ]);
            setAllUsersForMap(allUsers);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("api_token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getCounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // <-- pass token here
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success && data.data) {
                setStats({
                    users: data.data.users || 0,
                    posts: data.data.posts || 0,
                    jobAssessments: data.data.jobAssessments || 0,
                    jobAssessmentsWithScore: data.data.jobAssessmentsWithScore || 0,
                    jobAssessmentsWithScorePercentage: data.data.jobAssessmentsWithScorePercentage || 0,
                    feedback: data.data.feedback || 0,
                    bids: data.data.bids || 0,
                    avgOverallScore: data.data.avgOverallScore || 0,
                    totalSkills: data.data.totalSkills || 0,
                    totalHardSkills: data.data.totalHardSkills || 0,
                    totalSoftSkills: data.data.totalSoftSkills || 0,
                    hardSkillsPercentage: data.data.hardSkillsPercentage || 0,
                    softSkillsPercentage: data.data.softSkillsPercentage || 0,
                    topSkills: data.data.topSkills || [],
                });

                // Update skill distribution
                setSkillDistribution([
                    { name: 'Hard Skills', value: data.data.hardSkillsPercentage || 0, color: '#8884d8' },
                    { name: 'Soft Skills', value: data.data.softSkillsPercentage || 0, color: '#82ca9d' }
                ]);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            // Set default values if there's an error
            setStats({
                users: 0,
                posts: 0,
                jobAssessments: 0,
                jobAssessmentsWithScore: 0,
                jobAssessmentsWithScorePercentage: 0,
                feedback: 0,
                bids: 0,
                avgOverallScore: 0,
                totalSkills: 0,
                totalHardSkills: 0,
                totalSoftSkills: 0,
                hardSkillsPercentage: 0,
                softSkillsPercentage: 0,
                topSkills: [],
            });
        }
    };

    const fetchAllUsersForMap = async () => {
        try {
            const token = localStorage.getItem("api_token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // <-- pass token here
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data && data.users) {
                return data.users;
            }
            return [];
        } catch (err) {
            console.error('Error fetching all users for map:', err);
            return [];
        }
    };

    const fetchUserGrowthData = async () => {
        try {
            const token = localStorage.getItem("api_token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getUserCountsByDay`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // <-- pass token here
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success && data.data) {
                // Process the data for the chart
                const processedData = data.data.usersCreatedByDay.map((item: any) => ({
                    day: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    users: item.userCount,
                    posts: 0, // Will be updated below
                    assessments: 0, // Will be updated below
                    fullDate: item.day
                }));

                // Add posts data
                if (data.data.postsCreatedByDay) {
                    data.data.postsCreatedByDay.forEach((postItem: any) => {
                        const existingDay = processedData.find((item: any) => item.fullDate === postItem.day);
                        if (existingDay) {
                            existingDay.posts = postItem.postCount;
                        } else {
                            processedData.push({
                                day: new Date(postItem.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                users: 0,
                                posts: postItem.postCount,
                                assessments: 0,
                                fullDate: postItem.day
                            });
                        }
                    });
                }

                // Add assessments data if available
                if (data.data.jobAssessmentsCreatedByDay) {
                    data.data.jobAssessmentsCreatedByDay.forEach((assessmentItem: any) => {
                        const existingDay = processedData.find((item: any) => item.fullDate === assessmentItem.day);
                        if (existingDay) {
                            existingDay.assessments = assessmentItem.jobAssessmentCount;
                        } else {
                            processedData.push({
                                day: new Date(assessmentItem.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                users: 0,
                                posts: 0,
                                assessments: assessmentItem.jobAssessmentCount,
                                fullDate: assessmentItem.day
                            });
                        }
                    });
                }

                // Sort by date
                processedData.sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

                setUserGrowthData(processedData);
            }
        } catch (err) {
            console.error('Error fetching user growth data:', err);
            setUserGrowthData([]);
        }
    };

    const fetchSkillsData = async () => {
        try {
            const token = localStorage.getItem("api_token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getCounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // <-- pass token here
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success && data.data && data.data.topSkills) {
                // Map the topSkills data to the expected format
                const skillsData = data.data.topSkills.map((item: any) => ({
                    skill: item._id,
                    count: item.count
                }));

                // Sort skills by count in descending order
                const sortedSkills = skillsData
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 10);

                setSkillsData(sortedSkills);
            }
        } catch (err) {
            console.error('Error fetching skills data:', err);
            // Fallback to mock data if API fails
            const fallbackSkillsData = [
                { skill: 'JavaScript', count: 45 },
                { skill: 'React', count: 38 },
                { skill: 'Python', count: 32 },
                { skill: 'Node.js', count: 28 },
                { skill: 'SQL', count: 25 },
                { skill: 'TypeScript', count: 22 },
                { skill: 'AWS', count: 18 },
                { skill: 'Docker', count: 15 },
                { skill: 'MongoDB', count: 12 },
                { skill: 'Git', count: 10 }
            ];
            setSkillsData(fallbackSkillsData);
        }
    };

    const fetchUsers = async (page = 1, limit = 10, username = '', email = '', role = '', status = '') => {
        try {
            setLoading(true);
            const token = localStorage.getItem("api_token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (username) params.append('username', username);
            if (email) params.append('email', email);
            if (role) params.append('role', role);
            if (status) params.append('status', status);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // <-- pass token here
                },
            });
            const data = await res.json();
            if (data && data.users) {
                setUsers(data.users);
                if (data.pagination) {
                    setTotalUsers(data.pagination.totalUsers);
                    setUsersPage(data.pagination.currentPage - 1);
                    setUsersRowsPerPage(limit);
                }
            }
        } catch (err) {
            setError('Failed to fetch users from API');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssessments = async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const apiUrl = `${baseUrl}dashboard/job-assessment-results-grouped`;
            const token = localStorage.getItem("api_token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // <-- pass token here
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAssessments(data.results || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

        const handleLogout = useCallback(async () => {
          try {
            await dispatch(logout()).unwrap();
          } catch (error) {
            console.error("Logout failed:", error);
          }
        }, [dispatch]);

    // Color mapping functions - Now imported from utils/colorMappings.ts
    // Removed: getRoleColor, getStatusColor, getTypeColor

    // Process user location data for world map - Now using countryMappings utility
    const processUserLocations = () => {
        const locationMap = new Map<string, { count: number; users: any[] }>();

        allUsersForMap.forEach(user => {
            if (user.Localisation) {
                // Extract country code from location string (e.g., "Tunis, Tunis Governorate, TN" -> "TN")
                const locationParts = user.Localisation.split(',').map(part => part.trim());
                const countryCode = locationParts[locationParts.length - 1] || 'Unknown';

                // Use the utility function to convert country code to full name
                // Handles USA -> United States of America, UK/GB -> United Kingdom, etc.
                const country = getCountryName(countryCode);

                if (locationMap.has(country)) {
                    locationMap.get(country)!.count++;
                    locationMap.get(country)!.users.push(user);
                } else {
                    locationMap.set(country, { count: 1, users: [user] });
                }
            }
        });

        return Array.from(locationMap.entries()).map(([country, data]) => ({
            country,
            count: data.count,
            users: data.users
        }));
    };

    // Filter user growth data by month
    const getFilteredUserGrowthData = () => {
        if (selectedMonth === 'all') {
            return userGrowthData;
        }

        return userGrowthData.filter(item => {
            const date = new Date(item.fullDate);
            const month = date.getMonth() + 1; // getMonth() returns 0-11
            const year = date.getFullYear();
            const selectedMonthNum = parseInt(selectedMonth.split('-')[1]);
            const selectedYear = parseInt(selectedMonth.split('-')[0]);

            return month === selectedMonthNum && year === selectedYear;
        });
    };

    // On filter change, fetch page 1 with new filters
    useEffect(() => {
        fetchUsers(1, usersRowsPerPage, userUsernameFilter, userEmailFilter, userRoleFilter, userStatusFilter);
    }, [userUsernameFilter, userEmailFilter, userRoleFilter, userStatusFilter]);

    const renderDashboard = () => (
        <Box>
            <AdminHeader />
            <AdminStatsCards stats={stats} />
            <AdminSkillsBarChart skillsData={skillsData} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
                    <AdminGrowthAnalytics
                        userGrowthData={userGrowthData}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        getFilteredUserGrowthData={getFilteredUserGrowthData}
                    />
                </Box>
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                    <AdminSkillsDistribution skillDistribution={skillDistribution} />
                </Box>
            </Box>
            <AdminWorldMap
                userLocations={processUserLocations()}
                totalUsers={stats.users}
            />
        </Box>
    );

    // Handle permissions save
    const handleSavePermissions = async (companyId: string, permissions: CompanyPermissions) => {
        try {
            console.log('🔵 [Admin] Saving permissions for company:', companyId);
            console.log('🔵 [Admin] Permissions object (new structure):', permissions);

            const token = localStorage.getItem('api_token');
            if (!token) throw new Error('Authentication required');

            // Backend expects permissions wrapped in an object with "permissions" key
            const requestBody = {
                permissions: permissions
            };

            console.log('🔵 [Admin] Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}admin/companies/${companyId}/permissions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            console.log('📡 [Admin] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ [Admin] Error response:', errorData);
                throw new Error(errorData.message || 'Failed to update permissions');
            }

            const data = await response.json();
            console.log('✅ [Admin] Permissions updated successfully:', data);
        } catch (error) {
            console.error('❌ [Admin] Error saving permissions:', error);
            throw error; // Re-throw to let modal handle error display
        }
    };

    // User Management - Now using extracted component
    const renderUsers = () => (
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
                // Add delete logic here
            }}
            onManagePermissions={(user) => {
                setSelectedCompany(user);
                setPermissionsDialogOpen(true);
            }}
        />
    );

    // Sidebar - Now using extracted component
    const renderSidebar = () => (
        <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            drawerOpen={drawerOpen}
            onDrawerClose={() => setDrawerOpen(false)}
        />
    );

    // User Dialog - Now using extracted component
    const renderUserDialog = () => (
        <UserDetailsDialog
            open={userDialogOpen}
            user={selectedUser}
            onClose={() => setUserDialogOpen(false)}
            onEdit={(user) => {
                // Add edit logic here
                console.log('Edit user:', user);
            }}
        />
    );

    // Assessment Dialog - Now using extracted component
    const renderAssessmentDialog = () => (
        <AssessmentDetailsDialog
            open={assessmentDialogOpen}
            assessment={selectedAssessment}
            onClose={() => setAssessmentDialogOpen(false)}
            onEdit={(assessment) => {
                // Add edit logic here
                console.log('Edit assessment:', assessment);
            }}
        />
    );

    // Post Interview Assessments
    const renderPostInterviewAssessments = () => <PostInterviewAssessments />;

    // Skill Interview Assessments
    const renderSkillInterviewAssessments = () => <SkillInterviewAssessments />;

    // Add this function inside DashboardAdmin component
    const handleDownloadExcel = async (endpoint: string, filename: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/';
            const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/dashboard/${endpoint}`, {
                method: 'GET',
            });
            if (!response.ok) throw new Error('Failed to download file');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Error downloading file: ' + (error instanceof Error ? error.message : error));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
                {/* Sidebar with accent background and divider */}
                <Box sx={{
                    position: 'relative',
                    // zIndex: 2,
                    // boxShadow: '2px 0 12px 0 rgba(131,16,255,0.07)',
                    bgcolor: '#fff',
                    // borderRight: '2px solid #ece6fa',
                }}>
                    {renderSidebar()}
                </Box>

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
                            <IconButton
                                onClick={() => setDrawerOpen(true)}
                                sx={{ mr: 2 }}
                            >
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
                            {activeTab === 0 && renderDashboard()}
                            {activeTab === 1 && renderUsers()}
                            {activeTab === 2 && renderPostInterviewAssessments()}
                            {activeTab === 3 && renderSkillInterviewAssessments()}
                        </Box>
                    </Box>
                </Box>

                {/* Dialogs */}
                {renderUserDialog()}
                {renderAssessmentDialog()}

                {/* Company Permissions Modal */}
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

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(DashboardAdmin), {
  ssr: false
});