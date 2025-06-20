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
import WorldMap from '../components/WorldMap';

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
    const [allUsersForMap, setAllUsersForMap] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [skillDistribution, setSkillDistribution] = useState([
        { name: 'Hard Skills', value: 0, color: '#8884d8' },
        { name: 'Soft Skills', value: 0, color: '#82ca9d' }
    ]);
    const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

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
            const [allUsers] = await Promise.all([
                fetchAllUsersForMap(),
                fetchStats(),
                fetchUserGrowthData(),
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getCounts`);
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
                    assessmentGrowth: 8.3 // Mock growth percentage
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
                assessmentGrowth: 0
            });
        }
    };

    const fetchAllUsersForMap = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?limit=1000`);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getUserCountsByDay`);
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
                            existingDay.assessments = assessmentItem.assessmentCount;
                        } else {
                            processedData.push({
                                day: new Date(assessmentItem.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                users: 0,
                                posts: 0,
                                assessments: assessmentItem.assessmentCount,
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
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const apiUrl = `${baseUrl}dashboard/job-assessment-results-grouped`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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

    // Process user location data for world map
    const processUserLocations = () => {
        const locationMap = new Map<string, { count: number; users: any[] }>();
        
        allUsersForMap.forEach(user => {
            if (user.Localisation) {
                // Extract country from location string (e.g., "Tunis, Tunis Governorate, TN" -> "TN")
                const locationParts = user.Localisation.split(',').map(part => part.trim());
                let country = locationParts[locationParts.length - 1] || 'Unknown';
                
                // Handle common country variations and codes
                if (country === 'US' || country === 'USA') {
                    country = 'United States of America';
                } else if (country === 'UK' || country === 'GB') {
                    country = 'United Kingdom';
                } else if (country === 'CA') {
                    country = 'Canada';
                } else if (country === 'FR') {
                    country = 'France';
                } else if (country === 'DE') {
                    country = 'Germany';
                } else if (country === 'ES') {
                    country = 'Spain';
                } else if (country === 'IT') {
                    country = 'Italy';
                } else if (country === 'JP') {
                    country = 'Japan';
                } else if (country === 'CN') {
                    country = 'China';
                } else if (country === 'IN') {
                    country = 'India';
                } else if (country === 'AU') {
                    country = 'Australia';
                } else if (country === 'BR') {
                    country = 'Brazil';
                } else if (country === 'AR') {
                    country = 'Argentina';
                } else if (country === 'ZA') {
                    country = 'South Africa';
                } else if (country === 'EG') {
                    country = 'Egypt';
                } else if (country === 'RU') {
                    country = 'Russia';
                } else if (country === 'TN') {
                    country = 'Tunisia';
                } else if (country === 'MA') {
                    country = 'Morocco';
                } else if (country === 'DZ') {
                    country = 'Algeria';
                } else if (country === 'LY') {
                    country = 'Libya';
                } else if (country === 'SA') {
                    country = 'Saudi Arabia';
                } else if (country === 'AE') {
                    country = 'United Arab Emirates';
                } else if (country === 'QA') {
                    country = 'Qatar';
                } else if (country === 'KW') {
                    country = 'Kuwait';
                } else if (country === 'BH') {
                    country = 'Bahrain';
                } else if (country === 'OM') {
                    country = 'Oman';
                } else if (country === 'JO') {
                    country = 'Jordan';
                } else if (country === 'LB') {
                    country = 'Lebanon';
                } else if (country === 'SY') {
                    country = 'Syria';
                } else if (country === 'IQ') {
                    country = 'Iraq';
                } else if (country === 'IR') {
                    country = 'Iran';
                } else if (country === 'TR') {
                    country = 'Turkey';
                } else if (country === 'IL') {
                    country = 'Israel';
                } else if (country === 'PS') {
                    country = 'Palestine';
                } else if (country === 'YE') {
                    country = 'Yemen';
                } else if (country === 'PK') {
                    country = 'Pakistan';
                } else if (country === 'AF') {
                    country = 'Afghanistan';
                } else if (country === 'BD') {
                    country = 'Bangladesh';
                } else if (country === 'LK') {
                    country = 'Sri Lanka';
                } else if (country === 'NP') {
                    country = 'Nepal';
                } else if (country === 'BT') {
                    country = 'Bhutan';
                } else if (country === 'MV') {
                    country = 'Maldives';
                } else if (country === 'MM') {
                    country = 'Myanmar';
                } else if (country === 'TH') {
                    country = 'Thailand';
                } else if (country === 'VN') {
                    country = 'Vietnam';
                } else if (country === 'LA') {
                    country = 'Laos';
                } else if (country === 'KH') {
                    country = 'Cambodia';
                } else if (country === 'MY') {
                    country = 'Malaysia';
                } else if (country === 'SG') {
                    country = 'Singapore';
                } else if (country === 'ID') {
                    country = 'Indonesia';
                } else if (country === 'PH') {
                    country = 'Philippines';
                } else if (country === 'TW') {
                    country = 'Taiwan';
                } else if (country === 'KR') {
                    country = 'South Korea';
                } else if (country === 'KP') {
                    country = 'North Korea';
                } else if (country === 'MN') {
                    country = 'Mongolia';
                } else if (country === 'KZ') {
                    country = 'Kazakhstan';
                } else if (country === 'UZ') {
                    country = 'Uzbekistan';
                } else if (country === 'KG') {
                    country = 'Kyrgyzstan';
                } else if (country === 'TJ') {
                    country = 'Tajikistan';
                } else if (country === 'TM') {
                    country = 'Turkmenistan';
                } else if (country === 'AZ') {
                    country = 'Azerbaijan';
                } else if (country === 'GE') {
                    country = 'Georgia';
                } else if (country === 'AM') {
                    country = 'Armenia';
                } else if (country === 'BY') {
                    country = 'Belarus';
                } else if (country === 'UA') {
                    country = 'Ukraine';
                } else if (country === 'MD') {
                    country = 'Moldova';
                } else if (country === 'RO') {
                    country = 'Romania';
                } else if (country === 'BG') {
                    country = 'Bulgaria';
                } else if (country === 'GR') {
                    country = 'Greece';
                } else if (country === 'HR') {
                    country = 'Croatia';
                } else if (country === 'SI') {
                    country = 'Slovenia';
                } else if (country === 'HU') {
                    country = 'Hungary';
                } else if (country === 'SK') {
                    country = 'Slovakia';
                } else if (country === 'CZ') {
                    country = 'Czech Republic';
                } else if (country === 'PL') {
                    country = 'Poland';
                } else if (country === 'LT') {
                    country = 'Lithuania';
                } else if (country === 'LV') {
                    country = 'Latvia';
                } else if (country === 'EE') {
                    country = 'Estonia';
                } else if (country === 'FI') {
                    country = 'Finland';
                } else if (country === 'SE') {
                    country = 'Sweden';
                } else if (country === 'NO') {
                    country = 'Norway';
                } else if (country === 'DK') {
                    country = 'Denmark';
                } else if (country === 'NL') {
                    country = 'Netherlands';
                } else if (country === 'BE') {
                    country = 'Belgium';
                } else if (country === 'CH') {
                    country = 'Switzerland';
                } else if (country === 'AT') {
                    country = 'Austria';
                } else if (country === 'PT') {
                    country = 'Portugal';
                } else if (country === 'IE') {
                    country = 'Ireland';
                } else if (country === 'IS') {
                    country = 'Iceland';
                } else if (country === 'MT') {
                    country = 'Malta';
                } else if (country === 'CY') {
                    country = 'Cyprus';
                } else if (country === 'LU') {
                    country = 'Luxembourg';
                } else if (country === 'MC') {
                    country = 'Monaco';
                } else if (country === 'LI') {
                    country = 'Liechtenstein';
                } else if (country === 'AD') {
                    country = 'Andorra';
                } else if (country === 'SM') {
                    country = 'San Marino';
                } else if (country === 'VA') {
                    country = 'Vatican City';
                } else if (country === 'MX') {
                    country = 'Mexico';
                } else if (country === 'GT') {
                    country = 'Guatemala';
                } else if (country === 'BZ') {
                    country = 'Belize';
                } else if (country === 'SV') {
                    country = 'El Salvador';
                } else if (country === 'HN') {
                    country = 'Honduras';
                } else if (country === 'NI') {
                    country = 'Nicaragua';
                } else if (country === 'CR') {
                    country = 'Costa Rica';
                } else if (country === 'PA') {
                    country = 'Panama';
                } else if (country === 'CO') {
                    country = 'Colombia';
                } else if (country === 'VE') {
                    country = 'Venezuela';
                } else if (country === 'GY') {
                    country = 'Guyana';
                } else if (country === 'SR') {
                    country = 'Suriname';
                } else if (country === 'GF') {
                    country = 'French Guiana';
                } else if (country === 'EC') {
                    country = 'Ecuador';
                } else if (country === 'PE') {
                    country = 'Peru';
                } else if (country === 'BO') {
                    country = 'Bolivia';
                } else if (country === 'PY') {
                    country = 'Paraguay';
                } else if (country === 'UY') {
                    country = 'Uruguay';
                } else if (country === 'CL') {
                    country = 'Chile';
                } else if (country === 'NZ') {
                    country = 'New Zealand';
                } else if (country === 'FJ') {
                    country = 'Fiji';
                } else if (country === 'PG') {
                    country = 'Papua New Guinea';
                } else if (country === 'NC') {
                    country = 'New Caledonia';
                } else if (country === 'VU') {
                    country = 'Vanuatu';
                } else if (country === 'SB') {
                    country = 'Solomon Islands';
                } else if (country === 'TO') {
                    country = 'Tonga';
                } else if (country === 'WS') {
                    country = 'Samoa';
                } else if (country === 'KI') {
                    country = 'Kiribati';
                } else if (country === 'TV') {
                    country = 'Tuvalu';
                } else if (country === 'NR') {
                    country = 'Nauru';
                } else if (country === 'PW') {
                    country = 'Palau';
                } else if (country === 'MH') {
                    country = 'Marshall Islands';
                } else if (country === 'FM') {
                    country = 'Micronesia';
                } else if (country === 'CK') {
                    country = 'Cook Islands';
                } else if (country === 'NU') {
                    country = 'Niue';
                } else if (country === 'TK') {
                    country = 'Tokelau';
                } else if (country === 'AS') {
                    country = 'American Samoa';
                } else if (country === 'GU') {
                    country = 'Guam';
                } else if (country === 'MP') {
                    country = 'Northern Mariana Islands';
                } else if (country === 'PW') {
                    country = 'Palau';
                } else if (country === 'MH') {
                    country = 'Marshall Islands';
                } else if (country === 'FM') {
                    country = 'Micronesia';
                } else if (country === 'CK') {
                    country = 'Cook Islands';
                } else if (country === 'NU') {
                    country = 'Niue';
                } else if (country === 'TK') {
                    country = 'Tokelau';
                } else if (country === 'AS') {
                    country = 'American Samoa';
                } else if (country === 'GU') {
                    country = 'Guam';
                } else if (country === 'MP') {
                    country = 'Northern Mariana Islands';
                }
                
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
                                {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                                        +{stats.userGrowth}% this month
                                    </Typography>
                                </Box> */}
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
                                {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                                        +{stats.assessmentGrowth}% this month
                                    </Typography>
                                </Box> */}
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
                                    Total Resumes
                                </Typography>
                                {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                                        {stats.activeAssessments} active
                                    </Typography>
                                </Box> */}
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
                                    {stats.averageScore.toFixed(2)}%
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
                gap: 3,
                mb: 4
            }}>
                <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
                    <StyledCard>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Growth Analytics
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>Filter by Month</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="Filter by Month"
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <MenuItem value="all">All Time</MenuItem>
                                    <MenuItem value="2025-04">April 2025</MenuItem>
                                    <MenuItem value="2025-05">May 2025</MenuItem>
                                    <MenuItem value="2025-06">June 2025</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getFilteredUserGrowthData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="users" stroke="#8310FF" strokeWidth={2} name="Users" />
                                <Line type="monotone" dataKey="posts" stroke="#00C49F" strokeWidth={2} name="Posts" />
                                <Line type="monotone" dataKey="assessments" stroke="#FFBB28" strokeWidth={2} name="Assessments" />
                            </LineChart>
                        </ResponsiveContainer>
                    </StyledCard>
                </Box>

                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                    <StyledCard>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Skills Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={skillDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {skillDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </StyledCard>
                </Box>
            </Box>

            {/* World Map */}
            <Box sx={{ mb: 4 }}>
                <WorldMap userLocations={processUserLocations()} totalUsers={stats.totalUsers} />
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
                            <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
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
                                    <Box>
                                        {user.Localisation ? (
                                            <>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    {user.Localisation}
                                                </Typography>
                                                {user.ip && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        IP: {user.ip}
                                                    </Typography>
                                                )}
                                            </>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                No location data
                                            </Typography>
                                        )}
                                    </Box>
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
                Job Assessment Details
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
                            <Typography variant="h6" sx={{ mb: 2 }}>Job Information</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Job Title</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedAssessment.jobId?.title || selectedAssessment.jobName || 'Unnamed Job'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Job Description</Typography>
                                    <Typography variant="body1">
                                        {selectedAssessment.jobId?.description || selectedAssessment.jobDescription || 'No description available'}
                                    </Typography>
                                </Box>
                                {selectedAssessment.jobId?.location && (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Location</Typography>
                                        <Typography variant="body1">📍 {selectedAssessment.jobId.location}</Typography>
                                    </Box>
                                )}
                                {selectedAssessment.jobId?.employmentType && (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Employment Type</Typography>
                                        <Chip 
                                            label={selectedAssessment.jobId.employmentType} 
                                            size="small" 
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </Box>
                                )}
                                {selectedAssessment.jobId?.experienceLevel && (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Experience Level</Typography>
                                        <Typography variant="body1">{selectedAssessment.jobId.experienceLevel}</Typography>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Job ID</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedAssessment._id}</Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Assessment Statistics</Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Number of Attempts</Typography>
                                    <Typography variant="body1">{selectedAssessment.numberOfAttempts}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Questions</Typography>
                                    <Typography variant="body1">{selectedAssessment.totalQuestions}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Average Score</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedAssessment.averageScore.toFixed(2)}%
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Assessment Type</Typography>
                                    <Typography variant="body1">Job Assessment</Typography>
                                </Box>
                                {selectedAssessment.jobId?.salary && (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Salary Range</Typography>
                                        <Typography variant="body1">
                                            {selectedAssessment.jobId.salary.min.toLocaleString()} - {selectedAssessment.jobId.salary.max.toLocaleString()} {selectedAssessment.jobId.salary.currency}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAssessmentDialogOpen(false)}>Close</Button>
                <Button variant="contained" sx={{ backgroundColor: GREEN_MAIN }}>
                    View All Assessments
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