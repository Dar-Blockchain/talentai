import React, { useState, useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  selectProfile,
  clearProfile,
} from "@/store/slices/profileSlice";
import {
  logout
} from "@/store/slices/authSlice";
import type { Profile as ProfileType } from "@/store/slices/profileSlice";
import { AppDispatch, RootState } from "@/store/store";
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Autocomplete,
  useTheme,
  Tooltip,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import { generateTodos } from "@/store/slices/todoSlice";
import CandidateOnly from "@/components/CandidateOnly";
import PostInterviewTab from "@/components/PostInterviewTab";
import { useCallback } from 'react';
import Link from "next/link";
import Popover from '@mui/material/Popover';
import GroupIcon from '@mui/icons-material/Group';
import Avatar from '@mui/material/Avatar';
const GREEN_MAIN = "#8310FF";

// Add shimmer animation keyframes
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 0.3;
      transform: scale(1.1);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scoreCountUp {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes cardFloat {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 0 20px rgba(0, 0, 0, 0.04)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12), 0 0 30px rgba(0, 0, 0, 0.08)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #8310FF 0%, #02E2FF 50%, #00FFC3 100%)",
    borderRadius: "24px 24px 0 0",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 800,
  color: "#191919",
  marginBottom: theme.spacing(4),
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-12px",
    left: "0",
    width: "80px",
    height: "6px",
    background: "#191919",
    borderRadius: "3px",
  },
}));



const ProfileHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  color: "#000000",
  padding: theme.spacing(4, 2), // Reduced horizontal padding for mobile
  borderRadius: "32px",
  marginBottom: theme.spacing(6),
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.06)",
  "&:before": {
    content: '""',
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background:
      "radial-gradient(circle at top right, rgba(0, 0, 0, 0.03) 0%, transparent 70%)",
    zIndex: 1,
  },
  // Responsive padding
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(6, 4),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(8),
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 3,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `
    0 6px 20px rgba(0, 0, 0, 0.05),
    0 1px 6px rgba(0, 0, 0, 0.04)
  `,
  transition: theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  cursor: "default",

  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: `
      0 12px 35px rgba(0, 0, 0, 0.08),
      0 4px 20px rgba(0, 0, 0, 0.04)
    `,
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: "12px",
  padding: theme.spacing(1.5),
  height: "36px",
  background: "rgba(2, 226, 255, 0.08)",
  color: "#000000",
  border: "1px solid rgba(2, 226, 255, 0.15)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(2, 226, 255, 0.15)",
    transform: "scale(1.05)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: Number(theme.shape.borderRadius) * 2.5,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem", // base font size (mobile)
  padding: theme.spacing(1.5, 3), // base padding (mobile)
  // backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
  transition: theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),

  // Responsive styles
  [theme.breakpoints.up("sm")]: {
    fontSize: "1.05rem",
    padding: theme.spacing(1.75, 3.5),
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "1.1rem",
    padding: theme.spacing(2, 4),
  },

  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-2px)",
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.15)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.light}`,
    outlineOffset: 2,
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: "16px",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  color: "#000000",
  boxShadow: "0 5px 20px rgba(0, 0, 0, 0.04), 0 0 10px rgba(0, 0, 0, 0.02)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
    transform: "translateX(6px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08), 0 0 15px rgba(0, 0, 0, 0.04)",
  },
}));

interface MatchingCandidate {
  id: string;
  name: string;
  matchScore: number;
  location: string;
  role: string;
  skills: Array<{
    name: string;
    proficiencyLevel: number;
  }>;
  experienceLevel: string;
  description: string;
  avatarUrl: string;
  availability: string;
  expectedSalary?: string;
}

interface Skill {
  name: string;
  proficiencyLevel: number;
  value?: string;
  requiresLanguage?: boolean;
  subcategories?: Array<{
    value: string;
    label: string;
  }>;
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

// Add this before calculateSkillPercentage
const softSkillNames = [
  "Communication",
  "Leadership",
  "Problem Solving",
  "Teamwork",
  "Time Management",
];


// Add helper function to map proficiency to experience level
const getExperienceLevelFromProficiency = (
  proficiencyLevel: number
): string => {
  switch (proficiencyLevel) {
    case 1:
      return "Entry Level";
    case 2:
      return "Junior";
    case 3:
      return "Mid Level";
    case 4:
      return "Senior";
    case 5:
      return "Expert";
    default:
      return "Entry Level";
  }
};



const ScoreCircle = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "150px",
  height: "150px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
}));

// SkillBlock component for unified skill design
const SkillBlock = ({
  skill,
  type,
  onStartTest,
  onDelete,
}: {
  skill: any;
  type: "technical" | "soft";
  onStartTest: () => void;
  onDelete?: () => void;
}) => {
  const proficiencyMap: { [key: string]: number } = {
    "Entry Level": 1,
    Junior: 2,
    "Mid Level": 3,
    Senior: 4,
    Expert: 5,
  };

  const getLevelFromNumber = (level: number): string => {
    const levelMap: { [key: number]: string } = {
      1: "Entry Level",
      2: "Junior",
      3: "Mid Level",
      4: "Senior",
      5: "Expert"
    };
    return levelMap[level] || "Entry Level";
  };

  const proficiencyLevel =
    type === "technical"
      ? skill.proficiencyLevel
      : proficiencyMap[skill.experienceLevel] || 1;
  const percentage = (proficiencyLevel / 5) * 100;
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "20px",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        transition: "all 0.3s ease",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            color: "black",
            fontWeight: 600,
            fontSize: "1.1rem",
            mb: 1,
          }}
        >
          {skill.name}
        </Typography>
        {type === "soft" && (
          <Typography
            variant="caption"
            sx={{
              color: "rgba(0,0,0,0.6)",
              display: "block",
              mb: 1,
            }}
          >
            {skill.category}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            color: "black",
            ml: 1,
            fontWeight: 500,
          }}
        >
          {type === "technical" ? (
            <>
              {skill.Levelconfirmed && skill.Levelconfirmed > 0 ? (
                <Chip
                  label={`${getLevelFromNumber(skill.Levelconfirmed)} Confirmed`}
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: "rgba(0, 255, 157, 0.2)",
                    color: "black",
                    height: "20px",
                    fontSize: "0.75rem",
                  }}
                />
              ) : (
                <Chip
                  label="No Level Confirmed"
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: "rgba(255, 193, 7, 0.2)",
                    color: "#856404",
                    height: "20px",
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </>
          ) : (
            skill.experienceLevel
          )}
        </Typography>
        <Box
          sx={{
            height: "10px",
            background: "rgba(0,0,0,0.06)",
            borderRadius: "8px",
            overflow: "hidden",
            mt: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: "100%",
              background: type === "technical" 
                ? "linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)"
                : "linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)",
              borderRadius: "8px",
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                animation: "shimmer 2s infinite",
              },
            }}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStartTest}
          sx={{
            background: GREEN_MAIN,
            color: "#000000",
            "&:hover": {
              background: GREEN_MAIN,
            },
          }}
        >
          Start Test
        </Button>

        {onDelete && (
          <IconButton
            onClick={onDelete}
            size="medium"
            sx={{
              color: "#ff3b30",
              background: "rgba(255,59,48,0.08)",
              "&:hover": {
                background: "rgba(255,59,48,0.12)",
                transform: "scale(1.1)",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

// Sample list of technical skills (expand as needed)
const technicalSkillsList = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "React",
  "Angular",
  "Vue.js",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "Laravel",
  "SQL",
  "NoSQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "GraphQL",
  "REST API",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "CI/CD",
  "Jenkins",
  "Git",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Webpack",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "NLP",
  "Computer Vision",
  "Data Science",
  "Cybersecurity",
  "DevOps",
  "Agile",
  "Scrum",
  "Testing",
  "Jest",
  "Mocha",
  "Cypress",
  "Playwright",
  "Mobile Development",
  "React Native",
  "Flutter",
  "iOS",
  "Android",
  "Unity",
  "Unreal Engine",
  // ...add more as needed
];

// Define skill categories
const skillCategories = {
  Development: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C#",
    "C++",
    "Go",
    "Rust",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
    "React",
    "Angular",
    "Vue.js",
    "Next.js",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring",
    "Laravel",
    "SQL",
    "NoSQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "GraphQL",
    "REST API",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "CI/CD",
    "Jenkins",
    "Git",
    "HTML",
    "CSS",
    "Sass",
    "Tailwind CSS",
    "Webpack",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "NLP",
    "Computer Vision",
    "Data Science",
    "Cybersecurity",
    "DevOps",
    "Agile",
    "Scrum",
    "Testing",
    "Jest",
    "Mocha",
    "Cypress",
    "Playwright",
    "Mobile Development",
    "React Native",
    "Flutter",
    "iOS",
    "Android",
    "Unity",
    "Unreal Engine",
  ],
  Web3: [
    "Solidity",
    "Ethereum",
    "Smart Contracts",
    "DeFi",
    "NFTs",
    "Web3.js",
    "Hardhat",
    "Truffle",
    "Massa",
    "Hedera",
    "Polkadot",
    "NEAR",
    "Substrate",
    "Cosmos",
    "Solana",
    "Avalanche",
    "Polygon",
    "Arbitrum",
    "Optimism",
    "Base",
    "Token Economics",
    "DAO Governance",
    "Blockchain Events",
    "Crypto PR",
    "DeFi Marketing",
    "NFT Marketing",
    "Web3 Marketing",
    "Community Management"
  ],
  Marketing: [
    "SEO",
    "Content Marketing",
    "Email Marketing",
    "Social Media",
    "Google Analytics",
    "Copywriting",
    "Branding",
    "Market Research",
    "Advertising",
    "Digital Marketing",
    "Growth Hacking",
    "Influencer Marketing",
    "Web3 Marketing",
    "NFT Marketing",
    "Crypto PR",
    "Token Economics",
    "DeFi Marketing",
    "Blockchain Events",
    "Community Management",
    "DAO Governance"
  ],
  QA: [
    "Testing",
    "Cypress",
    "Playwright",
    "Jest",
    "Mocha",
    "Manual Testing",
    "Automation",
    "Bug Tracking",
    "Quality Assurance",
    "Regression Testing",
    "Performance Testing",
  ],
  Business: [
    "Business Analysis",
    "Project Management",
    "Product Management",
    "Strategy",
    "Finance",
    "Sales",
    "Negotiation",
    "Customer Success",
    "Operations",
    "Entrepreneurship",
  ],
};


export default function DashboardCandidate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);
  const { todos, generate } = useSelector((state: RootState) => state.todo);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [resetDate, setResetDate] = useState<string>("");

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [skillType, setSkillType] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [softSkillType, setSoftSkillType] = useState("");
  const [softSkillLanguage, setSoftSkillLanguage] = useState("");
  const [softSkillSubcategory, setSoftSkillSubcategory] = useState("");
  const [softSkillProficiency, setSoftSkillProficiency] = useState<number>(1);
  const [isExistingSoftSkill, setIsExistingSoftSkill] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibleSkills, setVisibleSkills] = useState(3); // Add this line for tracking visible skills

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    experienceLevel: "",
  });

  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", proficiencyLevel: 1 });
  const [addSoftSkillDialogOpen, setAddSoftSkillDialogOpen] = useState(false);

  // Add state to track pre-selected skill for test modal
  const [preSelectedTest, setPreSelectedTest] = useState<{
    type: "technical" | "soft";
    skill: any;
  } | null>(null);


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const generateTodoList = () => {
    dispatch(generateTodos());
  };
  useEffect(() => {
    dispatch(getMyProfile());
    // dispatch(fetchTodos());
  }, [dispatch]);

  useEffect(() => {
    // fetchLogs(); // Commented out - logs functionality moved to admin dashboard
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.userId.username,
        email: profile.userId.email,
        experienceLevel: profile.requiredExperienceLevel || "",
      });
    }
  }, [profile]);

  // Add useEffect for timer
  useEffect(() => {
    const updateTimer = () => {
      if (profile?.quotaUpdatedAt) {
        const quotaDate = new Date(profile.quotaUpdatedAt);
        const resetDate = new Date(quotaDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from quotaUpdatedAt
        const now = new Date();
        const timeDiff = resetDate.getTime() - now.getTime();

        // Format reset date
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        setResetDate(resetDate.toLocaleDateString('en-US', options));

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeUntilReset(`${days}d ${hours}h`);
          } else {
            setTimeUntilReset(`${hours}h ${minutes}m`);
          }
        } else {
          setTimeUntilReset("Reset available");
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [profile?.quotaUpdatedAt]);

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Add your update profile API call here
      console.log("Updating profile with:", formData);
      handleEditProfileClose();
      // Optionally refresh the profile data
      dispatch(getMyProfile());
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // First clear the token from both localStorage and cookies
      localStorage.removeItem("api_token");
      Cookies.remove("api_token", { path: "/" });

      // Then clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
      });

      // Redirect to signin page
      router.push("/signin");
      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());
      // Sign out from NextAuth
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleStartTest = (type?: "technical" | "soft", skill?: any) => {
    if (type && skill) {
      setPreSelectedTest({ type, skill });
      setSkillType(type);
      if (type === "technical") {
        setSelectedSkill(skill.name);
        // Use default proficiency level of 1 if not defined
        const proficiencyLevel = skill.proficiencyLevel || 1;
        router.push(
          `/test?type=technical&skill=${skill.name}&proficiency=${proficiencyLevel}`
        );
      } else {
        setSoftSkillType(skill.name);
        if (skill.name === "Communication") {
          setSoftSkillLanguage(skill.category);
        } else {
          setSoftSkillSubcategory(skill.category);
        }
        const proficiencyMap: { [key: string]: number } = {
          "Entry Level": 1,
          Junior: 2,
          "Mid Level": 3,
          Senior: 4,
          Expert: 5,
        };
        setSoftSkillProficiency(proficiencyMap[skill.experienceLevel] || 1);
        router.push(
          `/test?type=soft&skill=${skill.name}&category=${skill.category
          }&proficiency=${proficiencyMap[skill.experienceLevel] || 1}`
        );
      }
    } else {
      setPreSelectedTest(null);
      setTestModalOpen(true);
    }
  };

  const handleCloseTestModal = () => {
    setTestModalOpen(false);
    setSkillType("");
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSoftSkillSubcategory("");
    setSoftSkillProficiency(1);
    setPreSelectedTest(null);
  };

  const handleCloseAddSoftSkillModal = () => {
    setAddSoftSkillDialogOpen(false);
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSoftSkillSubcategory("");
    setSoftSkillProficiency(1);
    setIsExistingSoftSkill(false);
  };

  const handleSkillTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSkillType(event.target.value);
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
  };

  const handleTestSubmit = async () => {
    try {
      if (skillType === "technical" && selectedSkill) {
        router.push(
          `/test?type=technicalSkill&skill=${selectedSkill}`
        );
      } else if (skillType === "soft" && softSkillType) {
        const proficiencyMap: { [key: string]: number } = {
          "Entry Level": 1,
          Junior: 2,
          "Mid Level": 3,
          Senior: 4,
          Expert: 5,
        };
        const proficiency =
          proficiencyMap[
          getExperienceLevelFromProficiency(softSkillProficiency)
          ] || 1;

        const queryParams = new URLSearchParams();
        queryParams.append("type", "soft");
        queryParams.append("skill", softSkillType);
        queryParams.append("proficiency", proficiency.toString());

        if (softSkillType === "Communication") {
          if (!softSkillLanguage) {
            toast.error("Please select a language for Communication skill");
            return;
          }
          queryParams.append("language", softSkillLanguage);
        } else {
          if (!softSkillSubcategory) {
            toast.error("Please select a subcategory");
            return;
          }
          queryParams.append("subcategory", softSkillSubcategory);
        }

        router.push(`/test?${queryParams.toString()}`);
      }
      handleCloseTestModal();
    } catch (error) {
      console.error("Error in test submission:", error);
      toast.error("Failed to start test");
    }
  };

  const handleSoftSkillAddSubmit = async () => {
    try {
      if (!softSkillType) {
        toast.error("Please select a soft skill");
        return;
      }
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      const proficiency =
        proficiencyMap[
          getExperienceLevelFromProficiency(softSkillProficiency)
        ] || 1;

      const queryParams = new URLSearchParams();
      queryParams.append("type", "soft");
      queryParams.append("skill", softSkillType);
      queryParams.append("proficiency", proficiency.toString());

      if (softSkillType === "Communication") {
        if (!softSkillLanguage) {
          toast.error("Please select a language for Communication skill");
          return;
        }
        queryParams.append("language", softSkillLanguage);
      } else {
        if (!softSkillSubcategory) {
          toast.error("Please select a subcategory");
          return;
        }
        queryParams.append("subcategory", softSkillSubcategory);
      }

      router.push(`/test?${queryParams.toString()}`);
      handleCloseAddSoftSkillModal();
    } catch (error) {
      console.error("Error in soft skill submission:", error);
      toast.error("Failed to start test");
    }
  };

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'error'
  });

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleAddSkill = async () => {
    try {
      const token = Cookies.get("api_token");
      const selectedSkill = newSkill.name;

      const isDuplicate = profile?.skills?.some(
        (skill: any) => skill.name.toLowerCase() === selectedSkill.toLowerCase()
      );

      if (isDuplicate) {
        console.log("Skill already exists in profile");
        setNotification({
          open: true,
          message: "This skill already exists in your profile!",
          severity: 'error'
        });
        return;
      }

      // Redirect to test for the selected skill
      if (selectedSkill) {
        router.push(
          `/test?type=technicalSkill&skill=${encodeURIComponent(selectedSkill)}`
        );
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      setNotification({
        open: true,
        message: "Failed to add skill. Please try again.",
        severity: 'error'
      });
    }
  };

  // Add new handler for skill selection
  const handleSkillSelection = (value: string | null) => {
    setNewSkill((prev) => ({ ...prev, name: value || "" }));
  };



  const softSkills: Skill[] = [
    {
      name: "Communication",
      proficiencyLevel: 0,
      requiresLanguage: true,
      subcategories: [
        { value: "verbal", label: "Verbal Communication" },
        { value: "written", label: "Written Communication" },
        { value: "presentation", label: "Presentation Skills" },
        { value: "negotiation", label: "Negotiation Skills" },
      ],
    },
    {
      name: "Leadership",
      proficiencyLevel: 0,
      subcategories: [
        { value: "team-management", label: "Team Management" },
        { value: "decision-making", label: "Decision Making" },
        { value: "delegation", label: "Task Delegation" },
        { value: "motivation", label: "Team Motivation" },
      ],
    },
    {
      name: "Problem Solving",
      proficiencyLevel: 0,
      subcategories: [
        { value: "analytical", label: "Analytical Thinking" },
        { value: "critical", label: "Critical Thinking" },
        { value: "creative", label: "Creative Problem Solving" },
        { value: "strategic", label: "Strategic Planning" },
      ],
    },
    {
      name: "Teamwork",
      proficiencyLevel: 0,
      subcategories: [
        { value: "collaboration", label: "Collaboration" },
        { value: "conflict-resolution", label: "Conflict Resolution" },
        { value: "adaptability", label: "Adaptability" },
        { value: "cultural-awareness", label: "Cultural Awareness" },
      ],
    },
    {
      name: "Time Management",
      proficiencyLevel: 0,
      subcategories: [
        { value: "prioritization", label: "Task Prioritization" },
        { value: "scheduling", label: "Scheduling" },
        { value: "deadline-management", label: "Deadline Management" },
        { value: "work-life-balance", label: "Work-Life Balance" },
      ],
    },
  ];

  const languages = [
    { value: "English", label: "English" },

  ];


  const checkExistingSoftSkill = (skillName: string, category?: string) => {
    if (!profile?.softSkills?.length) return null;

    return profile.softSkills.find((skill) => {
      if (skillName === "Communication") {
        // For Communication skills, match both name and language (category)
        return skill.name === skillName && skill.category === category;
      } else {
        // For other skills, match name and subcategory
        return skill.name === skillName && skill.category === category;
      }
    });
  };

  const handleSoftSkillChange = (value: string) => {
    setSoftSkillType(value);
    setSoftSkillSubcategory("");
    setSoftSkillLanguage("");
    setIsExistingSoftSkill(false);
    setSoftSkillProficiency(1);
  };

  const handleSoftSkillSubcategoryChange = (value: string) => {
    setSoftSkillSubcategory(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
      setIsExistingSoftSkill(true);
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      setSoftSkillProficiency(
        proficiencyMap[existingSkill.experienceLevel] || 1
      );
    } else {
      setIsExistingSoftSkill(false);
      setSoftSkillProficiency(1);
    }
  };

  // Add handler for language change
  const handleSoftSkillLanguageChange = (value: string) => {
    setSoftSkillLanguage(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
      setIsExistingSoftSkill(true);
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      setSoftSkillProficiency(
        proficiencyMap[existingSkill.experienceLevel] || 1
      );
    } else {
      setIsExistingSoftSkill(false);
      setSoftSkillProficiency(1);
    }
  };

  // Filter technical skills (exclude soft skills)


  // Add state to track if a skill was just added
  const [justAddedSkill, setJustAddedSkill] = useState<any>(null);

  // Add delete skill handler
  const handleDeleteSkill = async (skillName: string) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/deleteHardSkill`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skillToDelete: skillName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete skill");
      }

      // Refresh profile data
      dispatch(getMyProfile());
      toast.success("Skill deleted successfully");
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill");
    }
  };

  // Add delete soft skill handler
  const handleDeleteSoftSkill = async (skillName: string, category: string) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/deleteSoftSkills`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ softSkillToDelete: skillName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete soft skill");
      }

      // Refresh profile data
      dispatch(getMyProfile());
      toast.success("Soft skill deleted successfully");
    } catch (error) {
      console.error("Error deleting soft skill:", error);
      toast.error("Failed to delete soft skill");
    }
  };

  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adPost, setAdPost] = useState<any[]>([]);

  useEffect(() => {
    setAdLoading(true);
    setAdError(null);
    const token = localStorage.getItem("api_token");
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${apiBase}post/adsPost`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ad post");
        return res.json();
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAdPost(json.data);
        } else if (json.success && json.data) {
          setAdPost([json.data]);
        } else {
          setAdError("No ad data available");
        }
      })
      .catch((e) => setAdError(e.message || "Error fetching ad post"))
      .finally(() => setAdLoading(false));
  }, []);

  if (loading) {
    return (
      <Container
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // background: '#0f172a'
        }}
      >
        <CircularProgress sx={{ color: GREEN_MAIN }} />
      </Container>
    );
  }

  if (error && !loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return <></>
  }

  return (
    <CandidateOnly>
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.7)",
          color: "#191919",
          boxShadow: "0 4px 24px 0 rgba(124,77,255,0.10)",
          mb: 3,
          borderRadius: 3,
          backdropFilter: "blur(16px)",
          width: 'unset',
          mx: { xs: 1, sm: 4 },
          mt: 2,
          px: { xs: 1, sm: 3 },
          py: 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: { xs: 56, sm: 72 },
            px: '0 !important',
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="TalentAI Logo"
              sx={{ height: { xs: 28, sm: 32 }, mr: 1, cursor: "pointer", transition: "transform 0.2s", '&:hover': { transform: 'scale(1.07)' } }}
              onClick={() => router.push("/")}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                color: "#7C4DFF",
                textShadow: "0 2px 8px #7C4DFF11",
                display: { xs: "none", sm: "block" },
              }}
            >
              Candidate Dashboard
            </Typography>
          </Box>
          {profile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
              <Avatar
                sx={{
                  bgcolor: "linear-gradient(135deg, #7C4DFF 60%, #00B8D4 100%)",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  fontSize: 22,
                  boxShadow: "0 2px 8px #7C4DFF22",
                  border: "2px solid #fff",
                }}
              >
                {profile.userId?.username?.[0] || profile.userId?.email?.[0] || "U"}
              </Avatar>
              {!isMobile && (
                <>
                  <Box sx={{ textAlign: "right", minWidth: 120 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#222", fontSize: 17, lineHeight: 1.1 }}>
                      {profile.userId?.username || "User"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                      {profile.userId?.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mx: 1, height: 36, borderLeft: "1.5px solid #E0E0E0" }} />
                </>
              )}
              {isMobile ? (
                <IconButton 
                  onClick={handleLogout}
                  sx={{
                    background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                    color: "#fff",
                    width: 44, height: 44,
                    '&:hover': {
                      background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  sx={{
                    background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    boxShadow: "0 2px 8px #00B8D422",
                    textTransform: "none",
                    fontSize: 16,
                    letterSpacing: 0.2,
                    transition: "background 0.2s, box-shadow 0.2s",
                    '&:hover': {
                      background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
                      boxShadow: "0 4px 16px #00B8D433",
                    },
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: "100vh",
          color: GREEN_MAIN,
          // padding: { xs: theme.spacing(2), sm: theme.spacing(4), md: theme.spacing(6) }, // Responsive padding
        }}
      >
        <Container maxWidth="lg">
                    {/* Profile Header */}
          <ProfileHeader>
            <Box sx={{ position: "relative", zIndex: 2 }}>
              {/* Welcome Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 4,
                  flexDirection: { xs: "column", lg: "row" },
                  gap: { xs: 3, lg: 4 },
                }}
              >
                {/* Left side - Welcome message and user info */}
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 3 }}>
                  {/* User Avatar */}
                  <Avatar
                    sx={{
                      width: { xs: 80, sm: 100, md: 120 },
                      height: { xs: 80, sm: 100, md: 120 },
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                      fontWeight: 700,
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    {profile.userId?.username?.[0] || profile.userId?.email?.[0] || "U"}
                  </Avatar>
                  
                  {/* Welcome Text */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: "#1a1a1a",
                        fontSize: { xs: "1.75rem", sm: "2.125rem", md: "2.5rem", lg: "3rem" },
                        lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
                      }}
                    >
                      Welcome back, {profile.userId.username}!
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#666666",
                        fontWeight: 400,
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                        mb: 1,
                      }}
                    >
                      Ready to continue your journey? Let's make today productive!
                    </Typography>
                    
                    {/* Role and Member Since Info */}
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WorkIcon sx={{ color: "#667eea", fontSize: "1.2rem" }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666666",
                            fontWeight: 500,
                          }}
                        >
                          {profile.userId.role || "Member"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: "#667eea", fontSize: "1.2rem" }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666666",
                            fontWeight: 500,
                          }}
                        >
                          Member since {new Date(profile.userId.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Right side - Quick Stats */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    gap: 2,
                    minWidth: { xs: "auto", sm: 200 },
                  }}
                >
                  {/* Tests Completed */}
                  <Box
                    sx={{
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      padding: 2,
                      textAlign: "center",
                      border: "1px solid #e9ecef",
                      minWidth: { xs: 120, sm: 140 },
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      {profile.quota || 0}/5
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666666",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 500,
                      }}
                    >
                      Tests Completed
                    </Typography>
                  </Box>

                  {/* Experience Level */}
                  <Box
                    sx={{
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      padding: 2,
                      textAlign: "center",
                      border: "1px solid #e9ecef",
                      minWidth: { xs: 120, sm: 140 },
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      {profile.requiredExperienceLevel || "Beginner"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666666",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 500,
                      }}
                    >
                      Experience Level
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, sm: 2 }}
                sx={{ 
                  mt: 4,
                  "& .MuiButton-root": {
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#ffffff",
                    fontWeight: 600,
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                    },
                  },
                }}
              >
                <ActionButton
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleStartTest()}
                  disabled={profile?.quota >= 5}
                  sx={{
                    background: profile?.quota >= 5 
                      ? "rgba(128,128,128,0.3)" 
                      : "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)",
                    color: profile?.quota >= 5 ? "#888888" : "#ffffff",
                    width: { xs: "100%", sm: "auto" },
                    cursor: profile?.quota >= 5 ? "not-allowed" : "pointer",
                    border: "1px solid rgba(255,255,255,0.2)",
                    "&:hover": {
                      background: profile?.quota >= 5 
                        ? "rgba(128,128,128,0.3)" 
                        : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.3) 100%)",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(128,128,128,0.3)",
                      color: "#888888",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Start Test
                </ActionButton>
                <ActionButton
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => router.push("/interviewTest")}
                  disabled={profile?.quota >= 5}
                  sx={{
                    background: profile?.quota >= 5
                      ? "linear-gradient(135deg, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0.2) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)",
                    color: profile?.quota >= 5 ? "#888888" : "#ffffff",
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      background: profile?.quota >= 5
                        ? "linear-gradient(135deg, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0.2) 100%)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.3) 100%)",
                    },
                    "&:disabled": {
                      cursor: "not-allowed",
                    },
                  }}
                >
                  HR Interview Test
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  onClick={() => router.push("/resume-builder")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "#ffffff",
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      background: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  CV Builder
                </ActionButton>
              </Stack>
            </Box>
          </ProfileHeader>
              {/* Edit Profile Modal */}
              <Dialog
                open={editProfileOpen}
                onClose={handleEditProfileClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: {
                    background: "rgba(30, 41, 59, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  },
                }}
              >
                <DialogTitle
                  sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    color: "#000000",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6">Edit Profile</Typography>
                    <IconButton
                      onClick={handleEditProfileClose}
                      sx={{ color: "rgba(0,0,0,0.7)" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <TextField
                      name="username"
                      label="Username"
                      value={formData.username}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                      InputProps={{
                        sx: {
                          color: "#000000",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                        },
                      }}
                    />
                    <TextField
                      name="email"
                      label="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                      InputProps={{
                        sx: {
                          color: "#000000",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                        },
                      }}
                    />
                    <TextField
                      select
                      name="experienceLevel"
                      label="Experience Level"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                      InputProps={{
                        sx: {
                          color: "#000000",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                        },
                      }}
                      SelectProps={{
                        sx: { color: "#000000" },
                      }}
                    >
                      {[
                        "Entry Level",
                        "Junior",
                        "Mid Level",
                        "Senior",
                        "Expert",
                      ].map((level) => (
                        <MenuItem
                          key={level}
                          value={level}
                          sx={{
                            backgroundColor: "rgba(30,41,59,0.98)",
                            "&:hover": { backgroundColor: "rgba(30,41,59,1)" },
                          }}
                        >
                          {level}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </DialogContent>
                <DialogActions
                  sx={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    padding: 2,
                  }}
                >
                  <Button
                    onClick={handleEditProfileClose}
                    sx={{
                      color: "rgba(0,0,0,0.7)",
                      "&:hover": { color: "#000000" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                      background:
                        "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
                      color: "#000000",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)",
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Test Selection Modal */}
              <Dialog
                open={testModalOpen}
                onClose={handleCloseTestModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                  sx: {
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1px solid #8310FF",
                  },
                }}
              >
                <DialogTitle
                  sx={{
                    borderBottom: "1px solid #8310FF",
                    color: GREEN_MAIN,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "black" }}>
                      Start New Test
                    </Typography>
                    <IconButton
                      onClick={handleCloseTestModal}
                      sx={{ color: "black" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
                    <FormLabel sx={{
                      color: GREEN_MAIN, mb: 1, mt: 2,

                    }}>
                      <Typography variant="h6" sx={{ color: GREEN_MAIN }}>Select Skill Type</Typography>
                    </FormLabel>
                    <RadioGroup
                      value={skillType}
                      onChange={handleSkillTypeChange}
                    >
                      <FormControlLabel
                        value="technical"
                        control={<Radio sx={{
                          color: 'rgba(0,0,0,0.6)',
                          '&.Mui-checked': {
                            color: GREEN_MAIN
                          }
                        }} />}
                        label="Technical Skill"
                        sx={{
                          '&.Mui-checked': {
                            color: GREEN_MAIN
                          }
                        }}
                      />
                      <FormControlLabel
                        value="soft"
                        control={<Radio sx={{
                          color: 'rgba(0,0,0,0.6)',
                          '&.Mui-checked': {
                            color: GREEN_MAIN
                          }
                        }} />}
                        label="Soft Skill"
                        sx={{
                          '&.Mui-checked': {
                            color: GREEN_MAIN
                          }
                        }}
                      />
                    </RadioGroup>
                  </FormControl>

                  {skillType === "technical" && (
                    <Box >
                      <Typography sx={{ color: GREEN_MAIN }}>Select Technical Skill</Typography>

                      <Autocomplete
                        fullWidth
                        options={technicalSkillsList}
                        value={selectedSkill}
                        onChange={(_, value) => setSelectedSkill(value || "")}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                            InputProps={{
                              ...params.InputProps,
                              sx: {
                                color: "#000000",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(0,0,0,0.2)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: GREEN_MAIN,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: GREEN_MAIN,
                                },
                                "&.Mui-focused": {
                                  "& .MuiInputLabel-root": {
                                    color: GREEN_MAIN,
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  "&.Mui-focused": {
                                    color: GREEN_MAIN,
                                  },
                                },
                              },
                            }}
                          />
                        )}
                        PaperComponent={(props) => (
                          <Paper
                            {...props}
                            sx={{
                              backgroundColor: "white",
                              "& .MuiAutocomplete-option": {
                                color: "black",
                                '&[aria-selected="true"]': {
                                  backgroundColor: "rgba(131, 16, 255, 0.1)",
                                  color: GREEN_MAIN
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(131, 16, 255, 0.05)",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  )}

                  {skillType === "soft" && (
                    <Box sx={{}}>
                      <Typography sx={{ color: GREEN_MAIN }}>Select Soft Skill</Typography>

                      <Autocomplete
                        fullWidth
                        options={softSkills}
                        value={
                          softSkills.find((s) => s.name === softSkillType) || null
                        }
                        onChange={(_, value) =>
                          handleSoftSkillChange(value?.name || "")
                        }
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                            InputProps={{
                              ...params.InputProps,
                              sx: {
                                color: "#000000",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(0,0,0,0.2)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: GREEN_MAIN,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: GREEN_MAIN,
                                },
                                "&.Mui-focused": {
                                  "& .MuiInputLabel-root": {
                                    color: GREEN_MAIN,
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  "&.Mui-focused": {
                                    color: GREEN_MAIN,
                                  },
                                },
                              },
                            }}
                          />
                        )}
                        PaperComponent={(props) => (
                          <Paper
                            {...props}
                            sx={{
                              backgroundColor: "white",
                              color: "black",
                              "& .MuiAutocomplete-option": {
                                color: "black",
                                '&[aria-selected="true"]': {
                                  backgroundColor: "rgba(0, 255, 157, 0.1)",
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(0, 255, 157, 0.05)",
                                },
                              },
                            }}
                          />
                        )}
                      />

                      {softSkillType === "Communication" && (
                        <Autocomplete
                          fullWidth
                          options={languages}
                          value={
                            languages.find(
                              (l) => l.value === softSkillLanguage
                            ) || null
                          }
                          onChange={(_, value) =>
                            handleSoftSkillLanguageChange(value?.value || "")
                          }
                          getOptionLabel={(option) => option.label}
                          sx={{ mt: 2 }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputLabelProps={{
                                sx: { color: GREEN_MAIN },
                              }}
                              InputProps={{
                                ...params.InputProps,
                                sx: {
                                  color: "#000000",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: GREEN_MAIN,
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: GREEN_MAIN
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: GREEN_MAIN,
                                  },
                                  "&.Mui-focused": {
                                    "& .MuiInputLabel-root": {
                                      color: GREEN_MAIN,
                                    },
                                  },
                                  "& .MuiInputLabel-root": {
                                    "&.Mui-focused": {
                                      color: GREEN_MAIN,
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                          PaperComponent={(props) => (
                            <Paper
                              {...props}
                              sx={{
                                backgroundColor: "white",
                                color: "black",
                                "& .MuiAutocomplete-option": {
                                  color: "black",
                                  '&[aria-selected="true"]': {
                                    backgroundColor: GREEN_MAIN,
                                  },
                                  "&:hover": {
                                    backgroundColor: GREEN_MAIN,
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      )}

                      {softSkillType && softSkillType !== "Communication" && (
                        <Autocomplete
                          fullWidth
                          options={
                            softSkills.find((s) => s.name === softSkillType)
                              ?.subcategories || []
                          }
                          value={
                            softSkills
                              .find((s) => s.name === softSkillType)
                              ?.subcategories?.find(
                                (sub) => sub.value === softSkillSubcategory
                              ) || null
                          }
                          onChange={(_, value) =>
                            handleSoftSkillSubcategoryChange(value?.value || "")
                          }
                          getOptionLabel={(option) => option.label}
                          sx={{ mt: 2 }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputLabelProps={{
                                sx: { color: "rgba(0,0,0,0.7)" },
                              }}
                              InputProps={{
                                ...params.InputProps,
                                sx: {
                                  color: "#000000",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "rgba(4, 3, 3, 0.2)",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: GREEN_MAIN,
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: GREEN_MAIN,
                                  },
                                  "&.Mui-focused": {
                                    "& .MuiInputLabel-root": {
                                      color: GREEN_MAIN,
                                    },
                                  },
                                  "& .MuiInputLabel-root": {
                                    "&.Mui-focused": {
                                      color: GREEN_MAIN,
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                          PaperComponent={(props) => (
                            <Paper
                              {...props}
                              sx={{
                                backgroundColor: "white",
                                color: "black",
                                "& .MuiAutocomplete-option": {
                                  color: "black",
                                  '&[aria-selected="true"]': {
                                    backgroundColor: GREEN_MAIN,
                                  },
                                  "&:hover": {
                                    backgroundColor: GREEN_MAIN,
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      )}
                    </Box>
                  )}
                </DialogContent>
                <DialogActions
                  sx={{ p: 3, borderTop: "1px solid rgba(0, 255, 157, 0.2)" }}
                >
                  <Button
                    onClick={handleCloseTestModal}
                    sx={{
                      color: "rgba(0,0,0,0.7)",
                      "&:hover": { color: "#000000" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleTestSubmit}
                    disabled={
                      (skillType === "technical" && !selectedSkill) ||
                      (skillType === "soft" &&
                        (!softSkillType ||
                          (softSkillType === "Communication" &&
                            !softSkillLanguage) ||
                          (softSkillType !== "Communication" &&
                            !softSkillSubcategory)))
                    }
                    sx={{
                      background: GREEN_MAIN,
                      color: "#000000",
                      "&:hover": {
                        background: GREEN_MAIN,
                      },
                      "&.Mui-disabled": {
                        background: "rgba(0,0,0,0.1)",
                        color: "rgba(0,0,0,0.3)",
                      },
                    }}
                  >
                    Start Test
                  </Button>
                </DialogActions>
              </Dialog>

          {/* Ads Block - Show API ad post */}
          <StyledCard sx={{ mb: 4, background: '#f8fafc', border: '2px dashed #8310FF' }}>
            <SectionTitle sx={{ color: '#8310FF', fontSize: '1.5rem', mb: 4 }}>Recommended Opportunities</SectionTitle>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              {adLoading ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                  <CircularProgress size={32} sx={{ color: '#8310FF' }} />
                </Box>
              ) : adError ? (
                <Box sx={{ flex: 1, color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                  <Typography>{adError}</Typography>
                </Box>
              ) : adPost && adPost.length > 0 ? (
                adPost.map((ad: any) => (
                  <Box key={ad._id} sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
                      <Typography variant="h6" sx={{ color: '#8310FF', fontWeight: 700, mb: 1, minHeight: 48 }}>
                        {ad.jobDetails?.title || 'Untitled Post'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', mb: 2, minHeight: 60 }}>
                        {ad.jobDetails?.description ? ad.jobDetails.description.slice(0, 90) + (ad.jobDetails.description.length > 90 ? '...' : '') : 'No description.'}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Link href={`/interview-post/${ad._id}${ad?.post_Steps?.length ? `?stepId=${ad.post_Steps[0]}` : ''}`} passHref legacyBehavior>
                          <Button variant="contained" sx={{ background: '#8310FF', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, width: '100%' }}>
                            Learn More
                          </Button>
                        </Link>
                      </Box>
                    </Paper>
                  </Box>
                ))
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                  <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
                    No recommended opportunities available at the moment.
                  </Typography>
                </Box>
              )}
            </Box>
          </StyledCard>

          {/* User Information */}
          <Box
            sx={{
              display: "grid",
              width: "100%",
              gap: 4,
            }}
          >
            <Box>
              <StyledCard>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 25px rgba(131, 16, 255, 0.3)",
                    }}
                  >
                    <DescriptionIcon sx={{ color: "white", fontSize: "28px" }} />
                  </Box>
                  <Box>
                    <SectionTitle sx={{ mb: 1 }}>Skills & Expertise</SectionTitle>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(0,0,0,0.6)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        mt: 3
                      }}
                    >
                      Showcase your technical and soft skills to potential employers
                    </Typography>
                  </Box>
                </Box>

                {/* Overall Score - Simple and Modern */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 5,
                    gap: 2,
                  }}
                >
                  <ScoreCircle>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={180}
                      thickness={6}
                      sx={{
                        position: "absolute",
                        color: "rgba(0, 0, 0, 0.08)",
                      }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={profile ? Number(profile.overallScore) : 0}
                      size={180}
                      thickness={6}
                      sx={{
                        position: "absolute",
                        color: "transparent",
                        "& .MuiCircularProgress-circle": {
                          strokeLinecap: "round",
                          stroke: "url(#gradient)",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          background:
                            "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: "bold",
                          fontSize: "2.75rem",
                          textAlign: "center",
                        }}
                      >
                        {profile ? Number(profile.overallScore).toFixed(1) : "0.0"}
                      </Typography>
                    </Box>
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#02E2FF" />
                          <stop offset="100%" stopColor="#00FFC3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </ScoreCircle>
                  <Typography
                    sx={{
                      color: "rgba(0, 0, 0, 0.75)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      textTransform: "none",
                      letterSpacing: 0.2,
                    }}
                  >
                    Overall Score
                  </Typography>
                </Box>

                {/* Motivational Message */}
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 4,
                    p: 3,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(131,16,255,0.05) 0%, rgba(2,226,255,0.05) 100%)",
                    border: "1px solid rgba(131,16,255,0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#8310FF",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    💪 Keep Growing Your Skills!
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(0,0,0,0.7)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    {Number(profile.overallScore) >= 90 ? "You're an expert! Consider mentoring others and sharing your knowledge." :
                     Number(profile.overallScore) >= 80 ? "Excellent progress! You're close to becoming an expert in your field." :
                     Number(profile.overallScore) >= 70 ? "Great work! Keep practicing and you'll reach advanced level soon." :
                     Number(profile.overallScore) >= 60 ? "Good start! Focus on improving your weakest areas to boost your score." :
                     "Welcome! Start by taking skill assessments to build your profile and track your progress."}
                  </Typography>
                </Box>

                {/* Soft Skills Distribution */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PersonIcon sx={{ color: "white", fontSize: "20px" }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ 
                          color: "black", 
                          opacity: 0.9,
                          fontWeight: 600,
                          fontSize: "1.25rem"
                        }}
                      >
                        Soft Skills
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setAddSoftSkillDialogOpen(true)}
                      variant="outlined"
                      sx={{
                        color: "#FF6B6B",
                        borderColor: "#FF6B6B",
                        borderRadius: "12px",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: "#FF6B6B",
                          background: "rgba(255,107,107,0.08)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(255,107,107,0.2)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Add Soft Skill
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {profile?.softSkills?.length ? (
                      profile.softSkills.map((skill: any) => (
                        <SkillBlock
                          key={`${skill.name}-${skill.category}`}
                          skill={skill}
                          type="soft"
                          onStartTest={() => handleStartTest("soft", skill)}
                          onDelete={() =>
                            handleDeleteSoftSkill(skill.name, skill.category)
                          }
                        />
                      ))
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                          px: 3,
                          borderRadius: "16px",
                          background: "rgba(255,107,107,0.05)",
                          border: "2px dashed rgba(255,107,107,0.3)",
                        }}
                      >
                        <PersonIcon 
                          sx={{ 
                            fontSize: "48px", 
                            color: "rgba(255,107,107,0.5)",
                            mb: 2 
                          }} 
                        />
                        <Typography
                          sx={{ 
                            color: "rgba(0,0,0,0.6)", 
                            fontSize: "1rem",
                            fontWeight: 500
                          }}
                        >
                          No soft skills added yet
                        </Typography>
                        <Typography
                          sx={{ 
                            color: "rgba(0,0,0,0.5)", 
                            fontSize: "0.875rem",
                            mt: 1
                          }}
                        >
                          Start a soft skill test to add them to your profile
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => setAddSoftSkillDialogOpen(true)}
                          variant="contained"
                          sx={{
                            mt: 2,
                            background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                            color: "white",
                            borderRadius: "12px",
                            px: 3,
                            py: 1.5,
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 15px rgba(255,107,107,0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 25px rgba(255,107,107,0.4)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Add Your First Skill
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Technical Skills */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <WorkIcon sx={{ color: "white", fontSize: "20px" }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ 
                          color: "#000000", 
                          opacity: 0.9,
                          fontWeight: 600,
                          fontSize: "1.25rem"
                        }}
                      >
                        Technical Skills
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setAddSkillDialogOpen(true)}
                      variant="outlined"
                      sx={{
                        color: "#02E2FF",
                        borderColor: "#02E2FF",
                        borderRadius: "12px",
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: "#02E2FF",
                          background: "rgba(2,226,255,0.08)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(2,226,255,0.2)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Add Technical Skill
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {profile.skills
                      ?.filter(
                        (skill: any) => !softSkillNames.includes(skill.name)
                      )?.length > 0 ? (
                      <>
                        {profile.skills
                          ?.filter(
                            (skill: any) => !softSkillNames.includes(skill.name)
                          )
                          ?.slice(0, visibleSkills)
                          ?.map((skill: any) => (
                            <SkillBlock
                              key={skill.name}
                              skill={skill}
                              type="technical"
                              onStartTest={() => handleStartTest("technical", skill)}
                              onDelete={() => handleDeleteSkill(skill.name)}
                            />
                          ))}
                        {profile.skills?.filter(
                          (skill: any) => !softSkillNames.includes(skill.name)
                        )?.length > visibleSkills && (
                          <Box
                            sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                          >
                            <Button
                              onClick={() => setVisibleSkills((prev) => prev + 3)}
                              variant="outlined"
                              sx={{
                                color: "#02E2FF",
                                borderColor: "#02E2FF",
                                borderRadius: "12px",
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                  borderColor: "#02E2FF",
                                  background: "rgba(2,226,255,0.08)",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 12px rgba(2,226,255,0.2)",
                                },
                                transition: "all 0.3s ease",
                              }}
                            >
                              Load More
                            </Button>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                          px: 3,
                          borderRadius: "16px",
                          background: "rgba(2,226,255,0.05)",
                          border: "2px dashed rgba(2,226,255,0.3)",
                        }}
                      >
                        <WorkIcon 
                          sx={{ 
                            fontSize: "48px", 
                            color: "rgba(2,226,255,0.5)",
                            mb: 2 
                          }} 
                        />
                        <Typography
                          sx={{ 
                            color: "rgba(0,0,0,0.6)", 
                            fontSize: "1rem",
                            fontWeight: 500
                          }}
                        >
                          No technical skills added yet
                        </Typography>
                        <Typography
                          sx={{ 
                            color: "rgba(0,0,0,0.5)", 
                            fontSize: "0.875rem",
                            mt: 1
                          }}
                        >
                          Start a technical skill test to add them to your profile
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => setAddSkillDialogOpen(true)}
                          variant="contained"
                          sx={{
                            mt: 2,
                            background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
                            color: "white",
                            borderRadius: "12px",
                            px: 3,
                            py: 1.5,
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 15px rgba(2,226,255,0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 25px rgba(2,226,255,0.4)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Add Your First Skill
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </StyledCard>
            </Box>

            {/* Interview Details Section */}

          </Box>
          <Box>
            <StyledCard>
              <SectionTitle>Interview Details</SectionTitle>
              <InterviewDetailsTabs profile={profile} />
            </StyledCard>
          </Box>

          {/* My Leader Projects Section */}
          <Box>
            <StyledCard>
              <SectionTitle>My Leader Projects</SectionTitle>
              <LeaderProjectsCard />
            </StyledCard>
          </Box>
          {/* My Team Projects Section */}
          <Box>
            <StyledCard>
              <SectionTitle>My Team Projects</SectionTitle>
              <TeamMemberProjectsCard />
            </StyledCard>
          </Box>
          {/* Add Soft Skill Dialog */}
          <Dialog
            open={addSoftSkillDialogOpen}
            onClose={handleCloseAddSoftSkillModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid #FF6B6B",
              },
            }}
          >
            <DialogTitle
              sx={{
                borderBottom: "1px solid #FF6B6B",
                color: GREEN_MAIN,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" sx={{ color: "black" }}>
                  Add Soft Skill
                </Typography>
                <IconButton onClick={handleCloseAddSoftSkillModal} sx={{ color: "black" }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box>
                <Typography sx={{ color: GREEN_MAIN, mb: 1, mt: 2 }}>Select Soft Skill</Typography>
                <Autocomplete
                  fullWidth
                  options={softSkills}
                  value={softSkills.find((s) => s.name === softSkillType) || null}
                  onChange={(_, value) => handleSoftSkillChange(value?.name || "")}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          color: "#000000",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                          "&.Mui-focused": {
                            "& .MuiInputLabel-root": {
                              color: GREEN_MAIN,
                            },
                          },
                          "& .MuiInputLabel-root": {
                            "&.Mui-focused": {
                              color: GREEN_MAIN,
                            },
                          },
                        },
                      }}
                    />
                  )}
                  PaperComponent={(props) => (
                    <Paper
                      {...props}
                      sx={{
                        backgroundColor: "white",
                        color: "black",
                        "& .MuiAutocomplete-option": {
                          color: "black",
                          '&[aria-selected="true"]': {
                            backgroundColor: "rgba(0, 255, 157, 0.1)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(0, 255, 157, 0.05)",
                          },
                        },
                      }}
                    />
                  )}
                />

                {softSkillType === "Communication" && (
                  <Autocomplete
                    fullWidth
                    options={languages}
                    value={languages.find((l) => l.value === softSkillLanguage) || null}
                    onChange={(_, value) => handleSoftSkillLanguageChange(value?.value || "")}
                    getOptionLabel={(option) => option.label}
                    sx={{ mt: 2 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            color: "#000000",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                            },
                            "&.Mui-focused": {
                              "& .MuiInputLabel-root": {
                                color: GREEN_MAIN,
                              },
                            },
                            "& .MuiInputLabel-root": {
                              "&.Mui-focused": {
                                color: GREEN_MAIN,
                              },
                            },
                          },
                        }}
                      />
                    )}
                    PaperComponent={(props) => (
                      <Paper
                        {...props}
                        sx={{
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiAutocomplete-option": {
                            color: "black",
                            '&[aria-selected="true"]': {
                              backgroundColor: GREEN_MAIN,
                            },
                            "&:hover": {
                              backgroundColor: GREEN_MAIN,
                            },
                          },
                        }}
                      />
                    )}
                  />
                )}

                {softSkillType && softSkillType !== "Communication" && (
                  <Autocomplete
                    fullWidth
                    options={
                      softSkills.find((s) => s.name === softSkillType)?.subcategories || []
                    }
                    value={
                      softSkills
                        .find((s) => s.name === softSkillType)
                        ?.subcategories?.find((sub) => sub.value === softSkillSubcategory) || null
                    }
                    onChange={(_, value) => handleSoftSkillSubcategoryChange(value?.value || "")}
                    getOptionLabel={(option) => option.label}
                    sx={{ mt: 2 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            color: "#000000",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(4, 3, 3, 0.2)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: GREEN_MAIN,
                            },
                            "&.Mui-focused": {
                              "& .MuiInputLabel-root": {
                                color: GREEN_MAIN,
                              },
                            },
                            "& .MuiInputLabel-root": {
                              "&.Mui-focused": {
                                color: GREEN_MAIN,
                              },
                            },
                          },
                        }}
                      />
                    )}
                    PaperComponent={(props) => (
                      <Paper
                        {...props}
                        sx={{
                          backgroundColor: "white",
                          color: "black",
                          "& .MuiAutocomplete-option": {
                            color: "black",
                            '&[aria-selected="true"]': {
                              backgroundColor: GREEN_MAIN,
                            },
                            "&:hover": {
                              backgroundColor: GREEN_MAIN,
                            },
                          },
                        }}
                      />
                    )}
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(255, 107, 107, 0.2)" }}>
              <Button onClick={handleCloseAddSoftSkillModal} sx={{ color: "rgba(0,0,0,0.7)", "&:hover": { color: "#000000" } }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSoftSkillAddSubmit}
                disabled={
                  !softSkillType ||
                  (softSkillType === "Communication" && !softSkillLanguage) ||
                  (softSkillType !== "Communication" && !softSkillSubcategory)
                }
                sx={{
                  background: GREEN_MAIN,
                  color: "#000000",
                  "&:hover": {
                    background: GREEN_MAIN,
                  },
                  "&.Mui-disabled": {
                    background: "rgba(0,0,0,0.1)",
                    color: "rgba(0,0,0,0.3)",
                  },
                }}
              >
                Start Test
              </Button>
            </DialogActions>
          </Dialog>
          {/* Add Skill Dialog */}
          <Dialog
            open={addSkillDialogOpen}
            onClose={() => setAddSkillDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: "white",
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                position: "relative",
                zIndex: 1300
              },
            }}
          >
            <DialogTitle
              sx={{
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                color: "#000000",
                padding: "16px 24px"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Add New Skill</Typography>
                <IconButton
                  onClick={() => setAddSkillDialogOpen(false)}
                  sx={{ color: "rgba(0,0,0,0.7)" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2, padding: "24px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Category Select */}
                <Autocomplete<string>
                  fullWidth
                  options={Object.keys(skillCategories)}
                  value={selectedCategory || null}
                  onChange={(_, value) => setSelectedCategory(value || "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(0,0,0,0.7)",
                          "&.Mui-focused": {
                            color: GREEN_MAIN,
                          },
                        },
                      }}
                    />
                  )}
                  PaperComponent={(props) => (
                    <Paper
                      {...props}
                      sx={{
                        backgroundColor: "white",
                        "& .MuiAutocomplete-option": {
                          color: "black",
                          '&[aria-selected="true"]': {
                            backgroundColor: "rgba(0, 255, 157, 0.1)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(0, 255, 157, 0.05)",
                          },
                        },
                      }}
                    />
                  )}
                />
                {/* Skill Autocomplete */}
                <Autocomplete<string>
                  fullWidth
                  options={
                    selectedCategory
                      ? skillCategories[
                      selectedCategory as keyof typeof skillCategories
                      ]
                      : technicalSkillsList
                  }
                  value={newSkill.name}
                  onChange={(_, value: string | null) => handleSkillSelection(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Skill Name"
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.7)" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: GREEN_MAIN,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(0,0,0,0.7)",
                          "&.Mui-focused": {
                            color: GREEN_MAIN,
                          },
                        },
                      }}
                    />
                  )}
                  PaperComponent={(props) => (
                    <Paper
                      {...props}
                      sx={{
                        backgroundColor: "white",
                        "& .MuiAutocomplete-option": {
                          color: "black",
                          '&[aria-selected="true"]': {
                            backgroundColor: "rgba(0, 255, 157, 0.1)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(0, 255, 157, 0.05)",
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <Button
                onClick={() => setAddSkillDialogOpen(false)}
                sx={{
                  color: "rgba(0,0,0,0.8)",
                  mr: 1,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddSkill}
                disabled={!newSkill.name}
                sx={{
                  background: GREEN_MAIN,
                  color: "#000000",
                  "&:hover": {
                    background: GREEN_MAIN,
                  },
                  "&.Mui-disabled": {
                    background: "rgba(0,0,0,0.1)",
                    color: "rgba(0,0,0,0.3)",
                  },
                }}
              >
                Add Skill
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Snackbar for notifications */}
          <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={notification.severity}
              sx={{
                width: '100%',
                backgroundColor: notification.severity === 'error' ? '#ffebee' : '#e8f5e9',
                color: notification.severity === 'error' ? '#c62828' : '#2e7d32',
                '& .MuiAlert-icon': {
                  color: notification.severity === 'error' ? '#c62828' : '#2e7d32'
                }
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </CandidateOnly>
  );
}

const INTERVIEW_TYPES = [
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'HR', value: 'hr' },
  { label: 'Skill', value: 'skill' },
  { label: 'Post Interview', value: 'post_interview' },
];







type InterviewDetailsTabsProps = {
  profile: any; // Replace 'any' with 'ProfileType' if available
};

function InterviewDetailsTabs({ profile }: InterviewDetailsTabsProps) {
  const [tab, setTab] = useState('post_interview');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchData = useCallback(async (type: string, pageNum: number, limit: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('api_token');
      const realProfileId = profile?._id;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}interviewDetails/?page=${pageNum + 1}&limit=${limit}&type=${type}&profileId=${realProfileId}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch interview details');
      const json = await res.json();
      setData(json.results || []);
      setTotal(json.total || 0);
    } catch (e: any) {
      setError(e.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchData(tab, page, rowsPerPage);
  }, [tab, page, rowsPerPage, fetchData]);

  const handleTabChange = (_: any, newValue: string) => {
    setTab(newValue);
    setPage(0);
  };
  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };





  return (
    <Box sx={{ width: '100%' }}>
      {/* Enhanced Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              minHeight: 48,
            },
            '& .Mui-selected': {
              color: '#8310FF !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#8310FF',
              height: 3,
            },
          }}
        >
          {INTERVIEW_TYPES.map((t) => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#8310FF' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <>
          {tab === 'post_interview' ? (
            <PostInterviewTab data={data} loading={loading} error={error} />
          ) : (
            /* Original Table Design for Other Tabs */
            <Box>
              <Table size="small" sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Overall Score</TableCell>
                    <TableCell>Post Name</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No data</TableCell>
                    </TableRow>
                  ) : (
                    data.map((row: any, idx: number) => {
                      return (
                        <TableRow key={row._id || row.id}>
                          <TableCell>{row.type || '-'}</TableCell>
                          <TableCell>{row.overallScore ?? '-'}</TableCell>
                          <TableCell>{row.post?.jobDetails?.title || '-'}</TableCell>
                          <TableCell>
                            <Button variant="outlined" size="small" onClick={() => router.push(`/candidate/interview/${row._id || row.id}`)}>
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Pagination */}
          {data.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[2, 5, 10]}
                sx={tab === 'post_interview' ? {
                  '& .MuiTablePagination-toolbar': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    px: 2,
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    color: '#666',
                    fontWeight: 500,
                  },
                } : {}}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function TeamMemberProjectsCard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverTeam, setPopoverTeam] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("api_token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/";
        const res = await fetch(`${apiBase}project/teamMemberProjects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch team member projects");
        const json = await res.json();
        if (json.success && Array.isArray(json.result)) {
          setProjects(json.result);
        } else if (json.success && json.result) {
          setProjects([json.result]);
        } else {
          setError("No project data available");
        }
      } catch (e: any) {
        setError(e.message || "Error fetching projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Helper for avatar initials
  const getInitials = (name: string, email: string) => {
    if (name && name.trim().length > 0) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return '?';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
        <CircularProgress size={32} sx={{ color: '#8310FF' }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }
  if (!projects.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mx: 'auto',
            maxWidth: 720,
            borderRadius: 3,
            border: '2px dashed rgba(131,16,255,0.25)',
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(131, 16, 255, 0.25)',
              }}
            >
              <GroupIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
            No Team Projects Yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', maxWidth: 520, mx: 'auto' }}>
            You aren't part of any team projects right now. When you join a team, your projects will appear here with progress and details.
          </Typography>
        </Paper>
      </Box>
    );
  }
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {projects.map((project: any) => {
          const team = Array.isArray(project.team) ? project.team : [];
          const showAvatars = team.slice(0, 4);
          const extraCount = team.length > 4 ? team.length - 4 : 0;
          const createdLabel = project.createdAt
            ? new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '-';

          return (
            <Paper
              key={project._id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 8px 22px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #8310FF 0%, #02E2FF 50%, #00FFC3 100%)',
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 14px 36px rgba(0,0,0,0.12)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', pr: 1 }}>
                  {project.name || 'Untitled Project'}
                </Typography>
                {project.track && (
                  <Chip
                    label={project.track}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(131,16,255,0.08)',
                      color: '#8310FF',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" sx={{ color: '#444', mb: 1.5, minHeight: 40 }}>
                {project.description || 'No description.'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                <Chip
                  icon={<GroupIcon sx={{ color: '#7C4DFF' }} />}
                  label={`${team.length} member${team.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(124, 77, 255, 0.08)',
                    color: '#7C4DFF',
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                />
                <Chip
                  label={`Created ${createdLabel}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.04)',
                    color: '#555',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                  {showAvatars.map((member: any, idx: number) => (
                    <Tooltip
                      key={member._id || idx}
                      title={
                        <Box>
                          <Typography variant="subtitle2">{member.name || member.email}</Typography>
                          <Typography variant="caption">{member.email}</Typography><br />
                          <Typography variant="caption">Role: {member.role || '-'}</Typography><br />
                          <Chip
                            label={member.validated ? 'Validated' : 'Not Validated'}
                            size="small"
                            color={member.validated ? 'success' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                      arrow
                    >
                      <Avatar
                        sx={{
                          bgcolor: member.validated ? '#00b894' : '#fdcb6e',
                          color: '#fff',
                          border: member.validated ? '2px solid #00b894' : '2px solid #fdcb6e',
                          width: 36,
                          height: 36,
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          ml: idx === 0 ? 0 : -1.2,
                          zIndex: 10 - idx,
                          cursor: 'pointer',
                        }}
                        onClick={e => {
                          setAnchorEl(e.currentTarget);
                          setPopoverTeam(team);
                        }}
                      >
                        {getInitials(member.name, member.email)}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {extraCount > 0 && (
                    <Avatar
                      sx={{
                        bgcolor: '#8310FF',
                        color: '#fff',
                        width: 36,
                        height: 36,
                        fontWeight: 700,
                        fontSize: '1rem',
                        ml: -1.2,
                        zIndex: 5,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                      onClick={e => {
                        setAnchorEl(e.currentTarget);
                        setPopoverTeam(team);
                      }}
                    >
                      +{extraCount}
                    </Avatar>
                  )}
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  >
                    <Box sx={{ p: 2, minWidth: 220 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Full Team</Typography>
                      {popoverTeam.map((member: any, idx: number) => (
                        <Box key={member._id || idx} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.name || member.email}</Typography>
                          <Typography variant="caption">{member.email}</Typography><br />
                          <Typography variant="caption">Role: {member.role || '-'}</Typography><br />
                          <Chip
                            label={member.validated ? 'Validated' : 'Not Validated'}
                            size="small"
                            color={member.validated ? 'success' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Popover>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  sx={{
                    background: '#8310FF',
                    color: '#fff',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    width: '100%',
                    boxShadow: '0 2px 8px #7C4DFF22',
                    '&:hover': { background: '#6a0bd4' },
                  }}
                  onClick={() => router.push(`/hackathon/projects/${project._id}`)}
                >
                  Details
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

// LeaderProjectsCard: same design as TeamMemberProjectsCard but fetches from /project/leaderProjects
function LeaderProjectsCard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverTeam, setPopoverTeam] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("api_token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/";
        const res = await fetch(`${apiBase}project/leaderProjects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch leader projects");
        const json = await res.json();
        if (json.success && Array.isArray(json.result)) {
          setProjects(json.result);
        } else if (json.success && json.result) {
          setProjects([json.result]);
        } else {
          setError("No project data available");
        }
      } catch (e: any) {
        setError(e.message || "Error fetching projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Helper for avatar initials
  const getInitials = (name: string, email: string) => {
    if (name && name.trim().length > 0) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return '?';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
        <CircularProgress size={32} sx={{ color: '#8310FF' }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }
  if (!projects.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mx: 'auto',
            maxWidth: 720,
            borderRadius: 3,
            border: '2px dashed rgba(131,16,255,0.25)',
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(131, 16, 255, 0.25)',
              }}
            >
              <GroupIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
            No Leader Projects Yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', maxWidth: 520, mx: 'auto' }}>
            You haven't created any projects as a leader yet. Create a project to manage your team, track progress, and showcase outcomes here.
          </Typography>
        </Paper>
      </Box>
    );
  }
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {projects.map((project: any) => {
          const team = Array.isArray(project.team) ? project.team : [];
          const showAvatars = team.slice(0, 4);
          const extraCount = team.length > 4 ? team.length - 4 : 0;
          const createdLabel = project.createdAt
            ? new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '-';
          const isNew = project.createdAt
            ? Date.now() - new Date(project.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14
            : false;

          return (
            <Paper
              key={project._id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 8px 22px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #8310FF 0%, #02E2FF 50%, #00FFC3 100%)',
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 14px 36px rgba(0,0,0,0.12)',
                },
              }}
            >
              {isNew && (
                <Chip
                  label="New"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(131,16,255,0.1)',
                    color: '#8310FF',
                    fontWeight: 700,
                  }}
                />
              )}

              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a1a', pr: 1 }}>
                  {project.name || 'Untitled Project'}
                </Typography>
                {project.track && (
                  <Chip
                    label={project.track}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(131,16,255,0.08)',
                      color: '#8310FF',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" sx={{ color: '#444', mb: 1.5, minHeight: 40 }}>
                {project.description || 'No description.'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                <Chip
                  icon={<GroupIcon sx={{ color: '#7C4DFF' }} />}
                  label={`${team.length} member${team.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(124, 77, 255, 0.08)',
                    color: '#7C4DFF',
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                />
                <Chip
                  label={`Created ${createdLabel}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.04)',
                    color: '#555',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                  {showAvatars.map((member: any, idx: number) => (
                    <Tooltip
                      key={member._id || idx}
                      title={
                        <Box>
                          <Typography variant="subtitle2">{member.name || member.email}</Typography>
                          <Typography variant="caption">{member.email}</Typography><br />
                          <Typography variant="caption">Role: {member.role || '-'}</Typography><br />
                          <Chip
                            label={member.validated ? 'Validated' : 'Not Validated'}
                            size="small"
                            color={member.validated ? 'success' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                      arrow
                    >
                      <Avatar
                        sx={{
                          bgcolor: member.validated ? '#00b894' : '#fdcb6e',
                          color: '#fff',
                          border: member.validated ? '2px solid #00b894' : '2px solid #fdcb6e',
                          width: 36,
                          height: 36,
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          ml: idx === 0 ? 0 : -1.2,
                          zIndex: 10 - idx,
                          cursor: 'pointer',
                        }}
                        onClick={e => {
                          setAnchorEl(e.currentTarget);
                          setPopoverTeam(team);
                        }}
                      >
                        {getInitials(member.name, member.email)}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {extraCount > 0 && (
                    <Avatar
                      sx={{
                        bgcolor: '#8310FF',
                        color: '#fff',
                        width: 36,
                        height: 36,
                        fontWeight: 700,
                        fontSize: '1rem',
                        ml: -1.2,
                        zIndex: 5,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                      onClick={e => {
                        setAnchorEl(e.currentTarget);
                        setPopoverTeam(team);
                      }}
                    >
                      +{extraCount}
                    </Avatar>
                  )}
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  >
                    <Box sx={{ p: 2, minWidth: 220 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Full Team</Typography>
                      {popoverTeam.map((member: any, idx: number) => (
                        <Box key={member._id || idx} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.name || member.email}</Typography>
                          <Typography variant="caption">{member.email}</Typography><br />
                          <Typography variant="caption">Role: {member.role || '-'}</Typography><br />
                          <Chip
                            label={member.validated ? 'Validated' : 'Not Validated'}
                            size="small"
                            color={member.validated ? 'success' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Popover>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  sx={{
                    background: '#8310FF',
                    color: '#fff',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    width: '100%',
                    boxShadow: '0 2px 8px #7C4DFF22',
                    '&:hover': { background: '#6a0bd4' },
                  }}
                  onClick={() => router.push(`/hackathon/projects/${project._id}`)}
                >
                  Details
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
