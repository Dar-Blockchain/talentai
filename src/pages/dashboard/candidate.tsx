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
import PostInterviewTab from "@/components/dashboard-candidate/PostInterviewTab";
import InterviewDetailsTabs from "@/components/dashboard-candidate/InterviewDetailsTabs";
import RecommendedOpportunities from "@/components/dashboard-candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/dashboard-candidate/WelcomeHeader";
import { useCallback } from 'react';
import Link from "next/link";
import TestSelectionDialog from "@/components/dashboard-candidate/TestSelectionDialog";
import UserInfoCard from "@/components/dashboard-candidate/UserInfoCard";
import AddSoftSkillDialog from "@/components/dashboard-candidate/AddSoftSkillDialog";
import AddSkillDialog from "@/components/dashboard-candidate/AddSkillDialog";

import Avatar from '@mui/material/Avatar';
const GREEN_MAIN = "#8310FF";

 

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

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);



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
          `/interview?type=technical&skill=${skill.name}&proficiency=${proficiencyLevel}`
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
          `/interview?type=soft&skill=${skill.name}&category=${skill.category
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
          `/interview?type=technicalSkill&skill=${selectedSkill}`
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

        router.push(`/interview?${queryParams.toString()}`);
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

      router.push(`/interview?${queryParams.toString()}`);
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
          `/interview?type=technicalSkill&skill=${encodeURIComponent(selectedSkill)}`
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
              <WelcomeHeader
                profile={profile}
                quota={profile?.quota || 0}
                onStartTest={handleStartTest}
                onHrInterview={() => router.push("/interview/hr")}
                onCvBuilder={() => router.push("/resume-builder")}
              />
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
              <TestSelectionDialog
                open={testModalOpen}
                onClose={handleCloseTestModal}
                onSubmit={handleTestSubmit}
                primaryAccentColor={GREEN_MAIN}
                skillType={skillType}
                onSkillTypeChange={handleSkillTypeChange}
                technicalSkillsList={technicalSkillsList}
                selectedSkill={selectedSkill}
                onSelectedSkillChange={(v) => setSelectedSkill(v)}
                softSkills={softSkills}
                softSkillType={softSkillType}
                onSoftSkillChange={handleSoftSkillChange}
                languages={languages}
                softSkillLanguage={softSkillLanguage}
                onSoftSkillLanguageChange={handleSoftSkillLanguageChange}
                softSkillSubcategory={softSkillSubcategory}
                onSoftSkillSubcategoryChange={handleSoftSkillSubcategoryChange}
              />

          {/* Recommended Opportunities - Subcomponent */}
          <StyledCard sx={{ mb: 4, background: '#f8fafc', border: '2px dashed #8310FF' }}>
            <SectionTitle sx={{ color: '#8310FF', fontSize: '1.5rem', mb: 4 }}>Recommended Opportunities</SectionTitle>
            {adLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                <CircularProgress size={32} sx={{ color: '#8310FF' }} />
              </Box>
            ) : adError ? (
              <Box sx={{ color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                <Typography>{adError}</Typography>
              </Box>
            ) : (
              <RecommendedOpportunities
                data={(adPost || []).map((ad: any) => ({
                  _id: ad._id,
                  title: ad.jobDetails?.title,
                  description: ad.jobDetails?.description || '',
                  firstStepId: (ad?.post_Steps && ad.post_Steps.length > 0) ? ad.post_Steps[0] : undefined,
                }))}
                total={Array.isArray(adPost) ? adPost.length : 0}
                emptyText="No recommended opportunities available at the moment."
              />
            )}
          </StyledCard>

          {/* User Information */}
          <UserInfoCard
            profile={profile}
            SectionTitle={SectionTitle}
            StyledCard={StyledCard}
            ScoreCircle={ScoreCircle}
            GREEN_MAIN={GREEN_MAIN}
            softSkillNames={softSkillNames}
            visibleSkills={visibleSkills}
            setVisibleSkills={(updater: any) => setVisibleSkills(updater)}
            setAddSoftSkillDialogOpen={(open: boolean) => setAddSoftSkillDialogOpen(open)}
            setAddSkillDialogOpen={(open: boolean) => setAddSkillDialogOpen(open)}
            SkillBlock={SkillBlock}
            handleStartTest={handleStartTest}
            handleDeleteSoftSkill={handleDeleteSoftSkill}
            handleDeleteSkill={handleDeleteSkill}
          />

          {/* Interview Details Section */}
          
          <Box>
            <StyledCard>
              <SectionTitle>Interview Details</SectionTitle>
              <InterviewDetailsTabs profile={profile} />
            </StyledCard>
          </Box>

        
          {/* Add Soft Skill Dialog */}
          <AddSoftSkillDialog
            open={addSoftSkillDialogOpen}
            onClose={handleCloseAddSoftSkillModal}
            onSubmit={handleSoftSkillAddSubmit}
            primaryAccentColor={GREEN_MAIN}
            softSkills={softSkills}
            languages={languages}
            softSkillType={softSkillType}
            onSoftSkillChange={handleSoftSkillChange}
            softSkillLanguage={softSkillLanguage}
            onSoftSkillLanguageChange={handleSoftSkillLanguageChange}
            softSkillSubcategory={softSkillSubcategory}
            onSoftSkillSubcategoryChange={handleSoftSkillSubcategoryChange}
          />
          {/* Add Skill Dialog */}
          <AddSkillDialog
            open={addSkillDialogOpen}
            onClose={() => setAddSkillDialogOpen(false)}
            onSubmit={handleAddSkill}
            primaryAccentColor={GREEN_MAIN}
            selectedCategory={selectedCategory}
            onSelectedCategoryChange={(v) => setSelectedCategory(v)}
            newSkillName={newSkill.name}
            onSkillSelection={(v) => handleSkillSelection(v)}
            skillCategories={skillCategories}
            technicalSkillsList={technicalSkillsList}
          />

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

