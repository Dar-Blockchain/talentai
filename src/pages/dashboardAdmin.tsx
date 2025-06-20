import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    TextField,
    Paper,
    Stack,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Tooltip,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Tabs,
    Tab,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Drawer,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Star as StarIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    ShowChart as ShowChartIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Constants
const GREEN_MAIN = '#8310FF';
const DRAWER_WIDTH = 280;

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
    role: 'admin' | 'company' | 'candidate';
    isVerified: boolean;
    createdAt: string;
    lastLogin?: string;
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
    title: string;
    description: string;
    type: 'technical' | 'soft' | 'personality';
    status: 'active' | 'inactive' | 'draft';
    totalQuestions: number;
    duration: number; // in minutes
    passingScore: number;
    createdAt: string;
    updatedAt: string;
    totalAttempts: number;
    averageScore: number;
    createdBy: string;
}

interface DashboardStats {
    totalUsers: number;
    totalAssessments: number;
    activeAssessments: number;
    totalAttempts: number;
    averageScore: number;
    userGrowth: number;
    assessmentGrowth: number;
}

// Mock data for charts
const userGrowthData = [
    { month: 'Jan', users: 120, assessments: 15 },
    { month: 'Feb', users: 180, assessments: 22 },
    { month: 'Mar', users: 250, assessments: 28 },
    { month: 'Apr', users: 320, assessments: 35 },
    { month: 'May', users: 400, assessments: 42 },
    { month: 'Jun', users: 480, assessments: 48 },
];

const assessmentPerformanceData = [
    { name: 'Technical', value: 45, color: '#8884d8' },
    { name: 'Soft Skills', value: 30, color: '#82ca9d' },
    { name: 'Personality', value: 25, color: '#ffc658' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardAdmin = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();

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

    // Data state
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalAssessments: 0,
        activeAssessments: 0,
        totalAttempts: 0,
        averageScore: 0,
        userGrowth: 0,
        assessmentGrowth: 0
    });
    const [users, setUsers] = useState<User[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

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

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, [usersPage, usersRowsPerPage]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchUsers(usersPage + 1, usersRowsPerPage),
                fetchAssessments()
            ]);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        // Mock data - replace with actual API call
        setStats({
            totalUsers: 1247,
            totalAssessments: 48,
            activeAssessments: 35,
            totalAttempts: 2847,
            averageScore: 78.5,
            userGrowth: 12.5,
            assessmentGrowth: 8.3
        });
    };

    const fetchUsers = async (page = 1, limit = 10, username = '', email = '', role = '', status = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (username) params.append('username', username);
            if (email) params.append('email', email);
            if (role) params.append('role', role);
            if (status) params.append('status', status);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?${params.toString()}`);
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
        // Mock data - replace with actual API call
        const mockAssessments: Assessment[] = [
            {
                _id: '1',
                title: 'JavaScript Fundamentals',
                description: 'Test knowledge of JavaScript basics and ES6 features',
                type: 'technical',
                status: 'active',
                totalQuestions: 25,
                duration: 30,
                passingScore: 70,
                createdAt: '2024-03-01T10:00:00Z',
                updatedAt: '2024-06-10T14:30:00Z',
                totalAttempts: 156,
                averageScore: 82.5,
                createdBy: 'admin_user'
            },
            {
                _id: '2',
                title: 'Communication Skills',
                description: 'Evaluate communication and interpersonal skills',
                type: 'soft',
                status: 'active',
                totalQuestions: 20,
                duration: 25,
                passingScore: 75,
                createdAt: '2024-03-15T11:00:00Z',
                updatedAt: '2024-06-12T09:15:00Z',
                totalAttempts: 89,
                averageScore: 76.2,
                createdBy: 'admin_user'
            },
            {
                _id: '3',
                title: 'Personality Assessment',
                description: 'Big Five personality traits evaluation',
                type: 'personality',
                status: 'active',
                totalQuestions: 50,
                duration: 45,
                passingScore: 60,
                createdAt: '2024-04-01T08:00:00Z',
                updatedAt: '2024-06-08T16:20:00Z',
                totalAttempts: 203,
                averageScore: 71.8,
                createdBy: 'admin_user'
            }
        ];
        setAssessments(mockAssessments);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
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

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'error';
            case 'company': return 'primary';
            case 'candidate': return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'error';
            case 'draft': return 'warning';
            default: return 'default';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'technical': return 'primary';
            case 'soft': return 'secondary';
            case 'personality': return 'info';
            default: return 'default';
        }
    };

    // On filter change, fetch page 1 with new filters
    useEffect(() => {
        fetchUsers(1, usersRowsPerPage, userUsernameFilter, userEmailFilter, userRoleFilter, userStatusFilter);
    }, [userUsernameFilter, userEmailFilter, userRoleFilter, userStatusFilter]);

    const renderDashboard = () => (
        <Box>
            <SectionTitle>Dashboard Overview</SectionTitle>

            {/* Stats Cards */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mb: 4
            }}>
                <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                    <StatCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                                    {stats.totalUsers.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Total Users
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                                        +{stats.userGrowth}% this month
                                    </Typography>
                                </Box>
                            </Box>
                            <PeopleIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
                        </Box>
                    </StatCard>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                    <StatCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                                    {stats.totalAssessments}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Total Assessments
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                                        +{stats.assessmentGrowth}% this month
                                    </Typography>
                                </Box>
                            </Box>
                            <AssessmentIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
                        </Box>
                    </StatCard>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                    <StatCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                                    {stats.totalAttempts.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Total Attempts
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                                        {stats.activeAssessments} active
                                    </Typography>
                                </Box>
                            </Box>
                            <BarChartIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
                        </Box>
                    </StatCard>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                    <StatCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                                    {stats.averageScore}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Average Score
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <StarIcon sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'warning.main' }}>
                                        Good performance
                                    </Typography>
                                </Box>
                            </Box>
                            <ShowChartIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
                        </Box>
                    </StatCard>
                </Box>
            </Box>

            {/* Charts */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3
            }}>
                <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
                    <StyledCard>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            User & Assessment Growth
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="users" stroke="#8310FF" strokeWidth={2} name="Users" />
                                <Line type="monotone" dataKey="assessments" stroke="#00C49F" strokeWidth={2} name="Assessments" />
                            </LineChart>
                        </ResponsiveContainer>
                    </StyledCard>
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <StyledCard>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Assessment Types Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={assessmentPerformanceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {assessmentPerformanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </StyledCard>
                </Box>
            </Box>
        </Box>
    );

    const renderUsers = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <SectionTitle>User Management</SectionTitle>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        backgroundColor: GREEN_MAIN,
                        '&:hover': { backgroundColor: '#6a0dad' }
                    }}
                >
                    Add User
                </Button>
            </Box>

            {/* Filter Card */}
            <StyledCard sx={{ mb: 3, p: { xs: 2, md: 3 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="Username"
                    variant="outlined"
                    size="small"
                    value={userUsernameFilter}
                    onChange={e => setUserUsernameFilter(e.target.value)}
                    sx={{ minWidth: 160 }}
                />
                <TextField
                    label="Email"
                    variant="outlined"
                    size="small"
                    value={userEmailFilter}
                    onChange={e => setUserEmailFilter(e.target.value)}
                    sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={userRoleFilter}
                        label="Role"
                        onChange={e => setUserRoleFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Candidat">Candidate</MenuItem>
                        <MenuItem value="Company">Company</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={userStatusFilter}
                        label="Status"
                        onChange={e => setUserStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="verified">Verified</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => { setUserUsernameFilter(''); setUserEmailFilter(''); setUserRoleFilter(''); setUserStatusFilter(''); }}
                    sx={{ ml: 'auto' }}
                >
                    Reset Filters
                </Button>
            </StyledCard>

        
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2, bgcolor: GREEN_MAIN }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            {user.profile && user.profile.firstName && user.profile.lastName ? (
                                                <>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {user.profile.firstName} {user.profile.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        @{user.username}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {user.username}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={getRoleColor(user.role) as any}
                                        size="small"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.isVerified ? 'Verified' : 'Pending'}
                                        color={user.isVerified ? 'success' : 'warning'}
                                        size="small"
                                        icon={user.isVerified ? <CheckCircleIcon /> : <PendingIcon />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleDateString()
                                            : 'Never'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setUserDialogOpen(true);
                                                }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit User">
                                            <IconButton size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete User">
                                            <IconButton size="small" color="error">
                                                <DeleteIcon />
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
                    count={totalUsers}
                    rowsPerPage={usersRowsPerPage}
                    page={usersPage}
                    onPageChange={(event, newPage) => fetchUsers(newPage + 1, usersRowsPerPage, userUsernameFilter, userEmailFilter, userRoleFilter, userStatusFilter)}
                    onRowsPerPageChange={e => fetchUsers(1, parseInt(e.target.value, 10), userUsernameFilter, userEmailFilter, userRoleFilter, userStatusFilter)}
                />
            </TableContainer>
        </Box>
    );

    const renderAssessments = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <SectionTitle>Assessment Management</SectionTitle>
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
                    label="Search by title"
                    variant="outlined"
                    size="small"
                    value={assessmentSearch}
                    onChange={e => setAssessmentSearch(e.target.value)}
                    sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={assessmentTypeFilter}
                        label="Type"
                        onChange={e => setAssessmentTypeFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="technical">Technical</MenuItem>
                        <MenuItem value="soft">Soft Skills</MenuItem>
                        <MenuItem value="personality">Personality</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={assessmentStatusFilter}
                        label="Status"
                        onChange={e => setAssessmentStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => { setAssessmentSearch(''); setAssessmentTypeFilter(''); setAssessmentStatusFilter(''); }}
                    sx={{ ml: 'auto' }}
                >
                    Reset Filters
                </Button>
            </StyledCard>

            <Tabs value={assessmentsTab} onChange={handleAssessmentsTabChange} sx={{ mb: 3 }}>
                <Tab label="All Assessments" />
                <Tab label="Technical" />
                <Tab label="Soft Skills" />
                <Tab label="Personality" />
            </Tabs>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Assessment</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Questions</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Attempts</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Avg Score</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessments
                            .filter(assessment =>
                                (!assessmentSearch || assessment.title.toLowerCase().includes(assessmentSearch.toLowerCase())) &&
                                (!assessmentTypeFilter || assessment.type === assessmentTypeFilter) &&
                                (!assessmentStatusFilter || assessment.status === assessmentStatusFilter)
                            )
                            .slice(assessmentsPage * assessmentsRowsPerPage, assessmentsPage * assessmentsRowsPerPage + assessmentsRowsPerPage)
                            .map((assessment) => (
                                <TableRow key={assessment._id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {assessment.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {assessment.description}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={assessment.type}
                                            color={getTypeColor(assessment.type) as any}
                                            size="small"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={assessment.status}
                                            color={getStatusColor(assessment.status) as any}
                                            size="small"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assessment.totalQuestions}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assessment.duration} min
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assessment.totalAttempts}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {assessment.averageScore}%
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
                                            <Tooltip title="Edit Assessment">
                                                <IconButton size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Assessment">
                                                <IconButton size="small" color="error">
                                                    <DeleteIcon />
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
                        (!assessmentSearch || assessment.title.toLowerCase().includes(assessmentSearch.toLowerCase())) &&
                        (!assessmentTypeFilter || assessment.type === assessmentTypeFilter) &&
                        (!assessmentStatusFilter || assessment.status === assessmentStatusFilter)
                    ).length}
                    rowsPerPage={assessmentsRowsPerPage}
                    page={assessmentsPage}
                    onPageChange={handleAssessmentsPageChange}
                    onRowsPerPageChange={handleAssessmentsRowsPerPageChange}
                />
            </TableContainer>
        </Box>
    );

    const renderSidebar = () => (
        <Drawer
            variant={isMobile ? "temporary" : "persistent"}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
                        TalentAI Admin
                    </Typography>
                    {isMobile && (
                        <IconButton onClick={() => setDrawerOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <List>
                    <SidebarItem
                        selected={activeTab === 0}
                        onClick={() => setActiveTab(0)}
                    >
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </SidebarItem>

                    <SidebarItem
                        selected={activeTab === 1}
                        onClick={() => setActiveTab(1)}
                    >
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                    </SidebarItem>

                    <SidebarItem
                        selected={activeTab === 2}
                        onClick={() => setActiveTab(2)}
                    >
                        <ListItemIcon>
                            <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary="Assessments" />
                    </SidebarItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <SidebarItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </SidebarItem>
            </Box>
        </Drawer>
    );

    const renderUserDialog = () => (
        <Dialog
            open={userDialogOpen}
            onClose={() => setUserDialogOpen(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                User Details
                <IconButton
                    onClick={() => setUserDialogOpen(false)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {selectedUser && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
                            <Stack spacing={2}>
                                {Object.entries(selectedUser).map(([key, value]) => (
                                    key !== 'profile' && !key.toLowerCase().includes('id') && (
                                        <Box key={key}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{key}</Typography>
                                            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{String(value)}</Typography>
                                        </Box>
                                    )
                                ))}
                            </Stack>
                        </Box>
                        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Profile</Typography>
                            {selectedUser.profile ? (
                                <Stack spacing={2}>
                                    {Object.entries(selectedUser.profile).map(([key, value]) => (
                                        !key.toLowerCase().includes('id') && (
                                            <Box key={key}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{key}</Typography>
                                                {Array.isArray(value) ? (
                                                    <Box sx={{ pl: 2 }}>
                                                        {value.length === 0 ? (
                                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Empty</Typography>
                                                        ) : (
                                                            value.map((item, idx) => (
                                                                <Box key={idx} sx={{ mb: 1 }}>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>- {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}</Typography>
                                                                </Box>
                                                            ))
                                                        )}
                                                    </Box>
                                                ) : typeof value === 'object' && value !== null ? (
                                                    <Box sx={{ pl: 2 }}>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{JSON.stringify(value, null, 2)}</Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{String(value)}</Typography>
                                                )}
                                            </Box>
                                        )
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>No profile data</Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setUserDialogOpen(false)}>Close</Button>
                <Button variant="contained" sx={{ backgroundColor: GREEN_MAIN }}>
                    Edit User
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderAssessmentDialog = () => (
        <Dialog
            open={assessmentDialogOpen}
            onClose={() => setAssessmentDialogOpen(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Assessment Details
                <IconButton
                    onClick={() => setAssessmentDialogOpen(false)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {selectedAssessment && (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3
                    }}>
                        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Title</Typography>
                                    <Typography variant="body1">{selectedAssessment.title}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Description</Typography>
                                    <Typography variant="body1">{selectedAssessment.description}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Type</Typography>
                                    <Chip
                                        label={selectedAssessment.type}
                                        color={getTypeColor(selectedAssessment.type) as any}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
                                    <Chip
                                        label={selectedAssessment.status}
                                        color={getStatusColor(selectedAssessment.status) as any}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </Box>
                            </Stack>
                        </Box>
                        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Statistics</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Questions</Typography>
                                    <Typography variant="body1">{selectedAssessment.totalQuestions}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Duration</Typography>
                                    <Typography variant="body1">{selectedAssessment.duration} minutes</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Passing Score</Typography>
                                    <Typography variant="body1">{selectedAssessment.passingScore}%</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Attempts</Typography>
                                    <Typography variant="body1">{selectedAssessment.totalAttempts}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Average Score</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedAssessment.averageScore}%
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAssessmentDialogOpen(false)}>Close</Button>
                <Button variant="contained" sx={{ backgroundColor: GREEN_MAIN }}>
                    Edit Assessment
                </Button>
            </DialogActions>
        </Dialog>
    );

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
                    </Box>
                </Box>
            </Box>

            {/* Dialogs */}
            {renderUserDialog()}
            {renderAssessmentDialog()}
        </Box>
    );
};

export default DashboardAdmin; 