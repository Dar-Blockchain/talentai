import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
    Box,
    Typography,
    Card,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    TextField,
    Paper,
    Stack,
    Tooltip,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Chip,
    ListItemButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Assessment as AssessmentIcon,
    Menu as MenuIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import Cookies from 'js-cookie';
import { selectProfile, clearProfile } from '@/store/slices/profileSlice';
import { logout, setLoggingOut } from '@/store/slices/authSlice';
import { resetRedirectState } from '@/utils/authRedirect';
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
import AssessmentResults from '@/components/dashboard-admin/AssessmentResults';
import CompanyPermissionsModal, { CompanyPermissions } from '@/components/dashboard-admin/CompanyPermissionsModal';

// Utilities
import { getCountryName } from '@/utils/countryMappings';
import RoleGuard from '@/components/guards/RoleGuard';

// Constants
const GREEN_MAIN = '#8310FF';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(131,16,255,0.10)',
    border: '1.5px solid #ece6fa',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(131,16,255,0.13)'
    }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#8310FF',
    marginBottom: theme.spacing(4),
    letterSpacing: '-1px',
    position: 'relative',
    lineHeight: 1.1,
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: '-10px',
        left: '0',
        width: '60px',
        height: '4px',
        background: 'linear-gradient(90deg, #8310FF 0%, #00FFC3 100%)',
        borderRadius: '2px'
    }
}));

const StatCard = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: theme.spacing(3),
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
    }
}));

const SidebarItem = styled(ListItemButton)(({ theme }) => ({
    borderRadius: '12px',
    margin: theme.spacing(0.5, 1),
    '&:hover': {
        backgroundColor: 'rgba(131, 16, 255, 0.1)',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgba(131, 16, 255, 0.15)',
        '&:hover': {
            backgroundColor: 'rgba(131, 16, 255, 0.2)',
        }
    }
}));

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

interface DashboardStats {
    totalUsers: number;
    totalAssessments: number;
    activeAssessments: number;
    totalAttempts: number;
    averageScore: number;
    userGrowth: number;
    assessmentGrowth: number;
    totalSkills: number;
    posts: number;
    jobAssessmentsWithScorePercentage: number;
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
    const { profile, loading: profileLoading } = useSelector(selectProfile);

    // State management
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [activeTab, setActiveTab] = useState(0);
    const [usersTab, setUsersTab] = useState(0);
    const [assessmentsTab, setAssessmentsTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [usersPage, setUsersPage] = useState(0);
    const [usersRowsPerPage, setUsersRowsPerPage] = useState(10);
    const [assessmentsPage, setAssessmentsPage] = useState(0);
    const [assessmentsRowsPerPage, setAssessmentsRowsPerPage] = useState(10);
    const [assessmentResultsTab, setAssessmentResultsTab] = useState(0);

    // Assessment Results state - Now handled by AssessmentResults component
    // Removed: assessmentResults, assessmentResultsLoading, assessmentResultsPage,
    // assessmentResultsRowsPerPage, assessmentResultsFilter, availableSkills

    // Data state
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalAssessments: 0,
        activeAssessments: 0,
        totalAttempts: 0,
        averageScore: 0,
        userGrowth: 0,
        assessmentGrowth: 0,
        totalSkills: 0,
        posts: 0,
        jobAssessmentsWithScorePercentage: 0
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
                    totalUsers: data.data.users || 0,
                    totalAssessments: data.data.jobAssessments || 0,
                    activeAssessments: data.data.jobAssessments || 0, // Using jobAssessments as active assessments
                    totalAttempts: data.data.resumes || 0, // Using resumes instead of attempts
                    averageScore: data.data.avgOverallScore || 0,
                    userGrowth: 12.5, // Mock growth percentage
                    assessmentGrowth: 8.3, // Mock growth percentage
                    totalSkills: data.data.totalSkills || 0,
                    posts: data.data.posts || data.data.totalPosts || data.data.postsCreatedByDay?.reduce((total: number, item: any) => total + item.postCount, 0) || 0,
                    jobAssessmentsWithScorePercentage: data.data.jobAssessmentsWithScorePercentage || 0
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
                totalUsers: 0,
                totalAssessments: 0,
                activeAssessments: 0,
                totalAttempts: 0,
                averageScore: 0,
                userGrowth: 0,
                assessmentGrowth: 0,
                totalSkills: 0,
                posts: 0,
                jobAssessmentsWithScorePercentage: 0
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

            // Update pagination
            if (data.pagination) {
                setAssessmentsPage(data.pagination.currentPage - 1);
                setAssessmentsRowsPerPage(data.pagination.totalResults > 0 ? data.pagination.totalResults : 10);
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Set logout flag to prevent axios interceptors from triggering redirects
            setLoggingOut(true);
            resetRedirectState();
            
            // Clear Redux state
            dispatch(clearProfile());
            dispatch(logout());
            
            // Clear tokens
            localStorage.removeItem('api_token');
            Cookies.remove('api_token', { path: '/' });
            localStorage.clear();
            
            // Clear all cookies
            Object.keys(Cookies.get()).forEach((cookieName) => {
                Cookies.remove(cookieName, { path: '/' });
            });
            
            // Sign out from NextAuth
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Logout failed:', error);
            // Even on error, try to sign out
            setLoggingOut(true);
            resetRedirectState();
            await signOut({ callbackUrl: '/' });
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleUsersTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setUsersTab(newValue);
    };

    const handleAssessmentsTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setAssessmentsTab(newValue);
    };

    const handleAssessmentResultsTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setAssessmentResultsTab(newValue);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleUsersPageChange = (event: unknown, newPage: number) => {
        setUsersPage(newPage);
    };

    const handleUsersRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsersRowsPerPage(parseInt(event.target.value, 10));
        setUsersPage(0);
    };

    const handleAssessmentsPageChange = (event: unknown, newPage: number) => {
        setAssessmentsPage(newPage);
    };

    const handleAssessmentsRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAssessmentsRowsPerPage(parseInt(event.target.value, 10));
        setAssessmentsPage(0);
    };

    // Assessment Results pagination handlers - Now handled by AssessmentResults component
    // Removed: handleAssessmentResultsPageChange, handleAssessmentResultsRowsPerPageChange

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
                totalUsers={stats.totalUsers}
            />
        </Box>
    );

    // Handle permissions save
    const handleSavePermissions = async (companyId: string, permissions: CompanyPermissions) => {
        try {
            const token = localStorage.getItem('api_token');
            if (!token) throw new Error('Authentication required');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}admin/companies/${companyId}/permissions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ permissions }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update permissions');
            }

            // Success - modal will handle UI feedback
            console.log('Permissions updated successfully');
        } catch (error) {
            console.error('Error saving permissions:', error);
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

    const renderAssessments = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <SectionTitle>Job Assessment Results</SectionTitle>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        backgroundColor: GREEN_MAIN,
                        '&:hover': { backgroundColor: '#6a0dad' }
                    }}
                >
                    Create Assessment
                </Button>
            </Box>

            {/* Filter Card */}
            <StyledCard sx={{ mb: 3, p: { xs: 2, md: 3 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="Search by job name"
                    variant="outlined"
                    size="small"
                    value={assessmentSearch}
                    onChange={e => setAssessmentSearch(e.target.value)}
                    sx={{ minWidth: 200 }}
                />

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => { setAssessmentSearch(''); setAssessmentTypeFilter(''); setAssessmentStatusFilter(''); }}
                    sx={{ ml: 'auto' }}
                >
                    Reset Filters
                </Button>
            </StyledCard>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Job</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Attempts</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Total Questions</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Avg Score</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessments
                            .filter(assessment =>
                            (!assessmentSearch ||
                                (assessment.jobId?.title && assessment.jobId.title.toLowerCase().includes(assessmentSearch.toLowerCase())) ||
                                (assessment.jobName && assessment.jobName.toLowerCase().includes(assessmentSearch.toLowerCase())))
                            )
                            .slice(assessmentsPage * assessmentsRowsPerPage, assessmentsPage * assessmentsRowsPerPage + assessmentsRowsPerPage)
                            .map((assessment) => (
                                <TableRow key={assessment._id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {assessment.jobId?.title || assessment.jobName || 'Unnamed Job'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                Job ID: {assessment._id}
                                            </Typography>
                                            {assessment.jobId?.location && (
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                    📍 {assessment.jobId.location}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {assessment.jobId?.description || assessment.jobDescription || 'No description available'}
                                        </Typography>
                                        {assessment.jobId?.employmentType && (
                                            <Chip
                                                label={assessment.jobId.employmentType}
                                                size="small"
                                                sx={{ mt: 1, textTransform: 'capitalize' }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assessment.numberOfAttempts}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assessment.totalQuestions}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {assessment.averageScore.toFixed(2)}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedAssessment(assessment);
                                                        setAssessmentDialogOpen(true);
                                                    }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Assessments">
                                                <IconButton size="small">
                                                    <AssessmentIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={assessments.filter(assessment =>
                    (!assessmentSearch ||
                        (assessment.jobId?.title && assessment.jobId.title.toLowerCase().includes(assessmentSearch.toLowerCase())) ||
                        (assessment.jobName && assessment.jobName.toLowerCase().includes(assessmentSearch.toLowerCase())))
                    ).length}
                    rowsPerPage={assessmentsRowsPerPage}
                    page={assessmentsPage}
                    onPageChange={handleAssessmentsPageChange}
                    onRowsPerPageChange={handleAssessmentsRowsPerPageChange}
                />
            </TableContainer>
        </Box>
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

    // Assessment Results - Now using extracted component
    const renderAssessmentResults = () => <AssessmentResults />;

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
                            {activeTab === 2 && renderAssessments()}
                            {activeTab === 3 && renderAssessmentResults()}
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

export default DashboardAdmin; 