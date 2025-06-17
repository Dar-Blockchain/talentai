import { useState, useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  selectProfile,
  clearProfile,
} from "../store/slices/profileSlice";
import type { Profile as ProfileType } from "../store/slices/profileSlice";
import { AppDispatch, RootState } from "../store/store";
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  Rating,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  Divider,
  Paper,
  Grid,
  Stack,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  InputLabel,
  Slider,
  Autocomplete,
  useTheme,
  Tooltip,
  Checkbox,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import { generateTodos, fetchTodos } from "@/store/slices/todoSlice";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12), 0 0 30px rgba(0, 0, 0, 0.08)",
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
  padding: theme.spacing(8),
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
}));

const StatCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 3,
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
  borderRadius: theme.shape.borderRadius * 2.5,
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

// Add this before calculateSkillPercentage
const softSkillNames = [
  "Communication",
  "Leadership",
  "Problem Solving",
  "Teamwork",
  "Time Management",
];

// Update the calculation function to handle both technical and soft skills
const calculateSkillPercentage = (
  profile: any,
  type: "technical" | "soft"
): number => {
  if (!profile) return 0;

  if (type === "technical") {
    const technicalSkills =
      profile.skills?.filter(
        (skill: any) => !softSkillNames.includes(skill.name)
      ) || [];
    if (technicalSkills.length === 0) return 0;

    const totalScore = technicalSkills.reduce((sum: number, skill: any) => {
      return sum + (skill.proficiencyLevel / 5) * 100;
    }, 0);

    return totalScore / technicalSkills.length;
  } else {
    // For soft skills
    if (!profile.softSkills?.length) return 0;

    const totalScore = profile.softSkills.reduce((sum: any, skill: any) => {
      // Convert experienceLevel to number
      const proficiencyMap: { [key: string]: number } = {
        "Entry Level": 1,
        Junior: 2,
        "Mid Level": 3,
        Senior: 4,
        Expert: 5,
      };
      const proficiencyLevel = proficiencyMap[skill.experienceLevel] || 1;
      return sum + (proficiencyLevel / 5) * 100;
    }, 0);

    return totalScore / profile.softSkills.length;
  }
};

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

const CandidateCard = styled(Box)(({ theme }) => ({
  background: "rgba(30, 41, 59, 0.7)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: theme.spacing(3),
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(2,226,255,0.15)",
    border: "1px solid rgba(2,226,255,0.3)",
  },
}));

const SkillBar = styled(Box)(({ theme }) => ({
  height: "4px",
  background: "rgba(255,255,255,0.1)",
  borderRadius: "2px",
  overflow: "hidden",
  "& .bar": {
    height: "100%",
    background: "linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)",
    transition: "width 0.3s ease",
  },
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "12px",
    height: "12px",
    background: "#22c55e",
    borderRadius: "50%",
    border: "2px solid rgba(30, 41, 59, 0.7)",
  },
}));

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
              {skill.Levelconfirmed && (
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
              )}
            </>
          ) : (
            skill.experienceLevel
          )}
        </Typography>
        <Box
          sx={{
            height: "8px",
            background: "rgba(0,0,0,0.06)",
            borderRadius: "4px",
            overflow: "hidden",
            mt: 2,
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: "100%",
              background: GREEN_MAIN,
              borderRadius: "4px",
              transition: "width 0.5s ease",
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

// Category color map
const categoryColors: Record<string, string> = {
  Development: "#0ea5e9",
  Marketing: "#f59e42",
  QA: "#a21caf",
  Business: "#22c55e",
  Other: "#64748b",
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

  // Add state to track pre-selected skill for test modal
  const [preSelectedTest, setPreSelectedTest] = useState<{
    type: "technical" | "soft";
    skill: any;
  } | null>(null);

  const theme = useTheme();
  const generateTodoList = () => {
    dispatch(generateTodos());
  };
  useEffect(() => {
    dispatch(getMyProfile());
    // dispatch(fetchTodos());
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

      // Check if skill already exists (case-insensitive)
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

  const matchingCandidates: MatchingCandidate[] = [
    {
      id: "1",
      name: "Alex Thompson",
      matchScore: 95,
      location: "New York, USA",
      role: "Full Stack Developer",
      skills: [
        { name: "React", proficiencyLevel: 5 },
        { name: "TypeScript", proficiencyLevel: 4 },
        { name: "Node.js", proficiencyLevel: 4 },
      ],
      experienceLevel: "Senior",
      description:
        "Passionate developer with 5+ years of experience in full-stack development and a focus on React ecosystems.",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      availability: "Available in 2 weeks",
      expectedSalary: "$120k - $150k",
    },
    {
      id: "2",
      name: "Sarah Chen",
      matchScore: 88,
      location: "San Francisco, USA",
      role: "Machine Learning Engineer",
      skills: [
        { name: "Python", proficiencyLevel: 5 },
        { name: "TensorFlow", proficiencyLevel: 4 },
        { name: "AWS", proficiencyLevel: 3 },
      ],
      experienceLevel: "Mid Level",
      description:
        "ML engineer specializing in computer vision and deep learning applications.",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      availability: "Immediately available",
      expectedSalary: "$100k - $130k",
    },
    {
      id: "3",
      name: "James Wilson",
      matchScore: 85,
      location: "London, UK",
      role: "Frontend Developer",
      skills: [
        { name: "React", proficiencyLevel: 4 },
        { name: "Vue.js", proficiencyLevel: 5 },
        { name: "UI/UX", proficiencyLevel: 4 },
      ],
      experienceLevel: "Senior",
      description:
        "Frontend specialist with a strong focus on creating beautiful and accessible user interfaces.",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      availability: "Available in 1 month",
      expectedSalary: "£70k - £90k",
    },
  ];

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

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ borderRadius: "12px" }}>
          No profile data available
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: GREEN_MAIN,
        padding: theme.spacing(6),
      }}
    >
      <Container maxWidth="lg">
        {/* Logout Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            variant="contained"
            sx={{
              background: GREEN_MAIN,
              color: "#000000",
              fontWeight: 600,
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              py: 1.2,
              boxShadow: "0 2px 8px rgba(0,255,157,0.15)",
              "&:hover": {
                background: GREEN_MAIN,
                opacity: 0.9,
              },
            }}
          >
            Logout
          </Button>
        </Box>
        {/* Profile Header */}
        <ProfileHeader>
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: "#191919",
                  }}
                >
                  Welcome back, {profile.userId.username}!
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <ActionButton
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleStartTest()}
                disabled={profile.quota >= 5}
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
              </ActionButton>
              <ActionButton
                variant="outlined"
                startIcon={<DescriptionIcon />}
                onClick={() => router.push("/resume-builder")}
                sx={{
                  borderColor: "black",
                  color: "black",
                  "&:hover": {
                    borderColor: GREEN_MAIN,
                    background: "rgba(0, 255, 157, 0.08)",
                  },
                }}
              >
                CV Builder
              </ActionButton>
            </Stack>

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
          </Box>

          <Container maxWidth="lg">
            <Box
              sx={{
                mt: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {/* Skills Count */}
              <StatCard>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", letterSpacing: 2 }}
                >
                  Skills Count
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary", mt: 1 }}
                >
                  {profile.skills?.length || 0}
                </Typography>
              </StatCard>

              {/* Tests Passed */}
              <StatCard>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "text.secondary", letterSpacing: 2 }}
                  >
                    Tests Passed
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {profile.quota || 0}/5
                  </Typography>
                  {timeUntilReset && (
                    <Chip
                      label={`Reset: ${resetDate}`}
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        height: 20,
                        fontSize: "0.75rem",
                        backgroundColor: "rgba(0,0,0,0.05)",
                        color: "rgba(0,0,0,0.6)",
                        "& .MuiChip-label": {
                          px: 1,
                          py: 0.5,
                        },
                      }}
                    />
                  )}
                </Box>
              </StatCard>

              {/* Last Login */}
              <StatCard>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", letterSpacing: 2 }}
                >
                  Last Login
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary", mt: 1 }}
                >
                  {new Date(profile.userId.lastLogin).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              </StatCard>

              {/* Profile Status */}
              <StatCard>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", letterSpacing: 2 }}
                >
                  Profile Status
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary", mt: 1 }}
                >
                  {profile.userId.isVerified ? "Verified" : "Pending"}
                </Typography>
              </StatCard>
            </Box>
          </Container>
        </ProfileHeader>

        {/* User Information */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 4,
          }}
        >
          <Box>
            <StyledCard>
              <SectionTitle>Personal Information</SectionTitle>
              <InfoItem>
                <PersonIcon sx={{ color: GREEN_MAIN }} />
                <Box>
                  <Typography variant="body2" sx={{ color: "#191919" }}>
                    Username
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#191919", fontWeight: 500 }}
                  >
                    {profile.userId.username}
                  </Typography>
                </Box>
              </InfoItem>
              <InfoItem>
                <EmailIcon sx={{ color: GREEN_MAIN }} />
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#000000", fontWeight: 500 }}
                  >
                    {profile.userId.email}
                  </Typography>
                </Box>
              </InfoItem>
              <InfoItem>
                <WorkIcon sx={{ color: GREEN_MAIN }} />
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>
                    Role
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#000000", fontWeight: 500 }}
                  >
                    {profile.userId.role}
                  </Typography>
                </Box>
              </InfoItem>
              <InfoItem>
                <CalendarTodayIcon sx={{ color: GREEN_MAIN }} />
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>
                    Member Since
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#000000", fontWeight: 500 }}
                  >
                    {new Date(profile.userId.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </Typography>
                </Box>
              </InfoItem>
            </StyledCard>
          </Box>

          <Box>
            <StyledCard>
              <SectionTitle>Skills & Expertise</SectionTitle>

              {/* Overall Score Circle */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <ScoreCircle>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={150}
                    thickness={4}
                    sx={{
                      position: "absolute",
                      color: "rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={150}
                    thickness={4}
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
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        background:
                          "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "bold",
                      }}
                    >
                      {profile
                        ? Number(profile.overallScore).toFixed(2)
                        : "0.00%"}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(0, 0, 0, 0.7)",
                        mt: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      Overall
                    </Typography>
                  </Box>
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#02E2FF" />
                        <stop offset="100%" stopColor="#00FFC3" />
                      </linearGradient>
                    </defs>
                  </svg>
                </ScoreCircle>
              </Box>

              {/* Soft Skills Distribution */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "black", opacity: 0.9 }}
                >
                  Soft Skills
                </Typography>
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
                    <Typography
                      sx={{ color: "black", textAlign: "center", py: 2 }}
                    >
                      No soft skills added yet. Start a soft skill test to add
                      them.
                    </Typography>
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
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#000000", opacity: 0.9 }}
                  >
                    Technical Skills
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setAddSkillDialogOpen(true)}
                    sx={{
                      color: "black",
                      borderColor: "black",
                      "&:hover": {
                        borderColor: "black",
                        background: "rgba(2,226,255,0.1)",
                      },
                    }}
                  >
                    Add Skill
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                </Box>
                {profile.skills?.filter(
                  (skill: any) => !softSkillNames.includes(skill.name)
                )?.length > visibleSkills && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Button
                        onClick={() => setVisibleSkills((prev) => prev + 3)}
                        sx={{
                          color: "black",
                          borderColor: "black",
                          "&:hover": {
                            borderColor: "black",
                            background: "rgba(2,226,255,0.1)",
                          },
                        }}
                      >
                        Load More
                      </Button>
                    </Box>
                  )}
              </Box>
            </StyledCard>
          </Box>
          {/* <Box>
            <StyledCard>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SectionTitle>To-Do List</SectionTitle>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={generateTodoList}
                  sx={{
                    background: GREEN_MAIN,
                    color: "#000000",
                    "&:hover": {
                      background: "rgba(0, 255, 157, 0.9)",
                    },
                  }}
                >
                  Generate
                </Button>
              </Box>

              <Box>
                {todos?.data?.length > 0 &&
                  todos.data.map((item, index) => (
                    <Accordion
                      key={index}
                      disableGutters
                      elevation={0}
                      sx={{
                        mb: 2,
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        "&::before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          item.tasks.length > 0 ? <ExpandMoreIcon /> : null
                        }
                        sx={{
                          display: "flex",
                          bgcolor: "#f9f9f9",
                          alignItems: "center",
                          borderRadius: "4px",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            checked={item.isCompleted}
                            sx={{ color: GREEN_MAIN, mr: 1 }}
                          />
                          <Typography sx={{ fontWeight: 500 }}>
                            {item.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      {item?.tasks?.length > 0 && (
                        <AccordionDetails>
                          <Box
                            component="ul"
                            sx={{ listStyle: "none", p: 0, m: 0 }}
                          >
                            {item.tasks.map((task: any, i: any) => (
                              <Box
                                key={i}
                                component="li"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Checkbox
                                  checked={task.isCompleted}
                                  sx={{ color: GREEN_MAIN, mr: 1 }}
                                />
                                <Typography>{task.title}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </AccordionDetails>
                      )}
                    </Accordion>
                  ))}
              </Box>
            </StyledCard>
          </Box> */}
        </Box>

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
  );
}
