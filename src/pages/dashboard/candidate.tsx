import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  selectProfile,
  clearProfile,
} from "@/store/slices/profileSlice";
import {
  logout
} from "@/store/slices/authSlice";
import { AppDispatch } from "@/store/store";
import {
  Box,
  Container,
  Typography,
  Card,
  Alert,
  CircularProgress,
  useTheme,
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import CandidateOnly from "@/components/CandidateOnly";
import SkillBlock from "@/components/dashboard-candidate/SkillBlock";
import InterviewDetailsTabs from "@/components/dashboard-candidate/InterviewDetailsTabs";
import RecommendedOpportunities from "@/components/dashboard-candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/dashboard-candidate/WelcomeHeader";
 import TestSelectionDialog from "@/components/dashboard-candidate/TestSelectionDialog";
import UserInfoCard from "@/components/dashboard-candidate/UserInfoCard";
import AddSoftSkillDialog from "@/components/dashboard-candidate/AddSoftSkillDialog";
import AddSkillDialog from "@/components/dashboard-candidate/AddSkillDialog";
import EditProfileModal from "@/components/dashboard-candidate/EditProfileModal";
import LoadingState from "@/components/dashboard-candidate/LoadingState";
import ErrorState from "@/components/dashboard-candidate/ErrorState";
import DashboardNavbar from "@/components/dashboard-candidate/DashboardNavbar";
import { skillCategories, softSkillNames, softSkills, technicalSkillsList } from "@/constants/skills";

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

export default function DashboardCandidate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector(selectProfile);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [skillType, setSkillType] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [softSkillType, setSoftSkillType] = useState("");
  const [softSkillLanguage, setSoftSkillLanguage] = useState("");
  const [softSkillSubcategory, setSoftSkillSubcategory] = useState("");
  const [softSkillProficiency, setSoftSkillProficiency] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibleSkills, setVisibleSkills] = useState(3); // Add this line for tracking visible skills

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    experienceLevel: "",
    targetRole: "",
  });

  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", proficiencyLevel: 1 });
  const [addSoftSkillDialogOpen, setAddSoftSkillDialogOpen] = useState(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'error'
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      console.log('🔄 Profile data updated:', {
        username: profile.userId.username,
        email: profile.userId.email,
        experienceLevel: profile.requiredExperienceLevel,
        targetRole: profile.targetRole
      });
      setFormData({
        username: profile.userId.username,
        email: profile.userId.email,
        experienceLevel: profile.requiredExperienceLevel || "",
        targetRole: profile.targetRole || "",
      });
    }
  }, [profile]);

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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
      const token = localStorage.getItem("api_token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Prepare profile update data
      const profileUpdateData = {
        username: formData.username,
        email: formData.email,
        requiredExperienceLevel: formData.experienceLevel,
        targetRole: formData.targetRole,
      };

      console.log('🔧 Sending profile update data:', profileUpdateData);
      console.log('🔧 API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('🔧 Full URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfile`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileUpdateData)
      });

      console.log('📡 Profile update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Profile update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated successfully:', result);
      console.log('🔍 Updated profile data:', result.profile);

      // Close modal and refresh profile data
      handleEditProfileClose();
      console.log('🔄 Refreshing profile data...');
      dispatch(getMyProfile());

      // Show success notification
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update profile',
        severity: 'error'
      });
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

  const handleStartTest = useCallback((type?: "technical" | "soft", skill?: any) => {
    if (type && skill) {
      setSkillType(type);
      if (type === "technical") {
        setSelectedSkill(skill.name);
        // Use default proficiency level of 1 if not defined
        const proficiencyLevel = skill.proficiencyLevel || 1;
        router.push(
          `/interview/hr?type=technical&skill=${skill.name}&proficiency=${proficiencyLevel}`
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
          `/interview/hr?type=soft&skill=${skill.name}&category=${skill.category
          }&proficiency=${proficiencyMap[skill.experienceLevel] || 1}`
        );
      }
    } else {
      setTestModalOpen(true);
    }
  }, [router]);

  const handleCloseTestModal = useCallback(() => {
    setTestModalOpen(false);
    setSkillType("");
    setSelectedCategory("");
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSoftSkillSubcategory("");
    setSoftSkillProficiency(1);
  }, []);

  const handleCloseAddSoftSkillModal = useCallback(() => {
    setAddSoftSkillDialogOpen(false);
    setSoftSkillType("");
    setSoftSkillLanguage("");
    setSoftSkillSubcategory("");
    setSoftSkillProficiency(1);
  }, []);

  const handleSkillTypeChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSkillType(event.target.value);
    setSelectedSkill("");
    setSoftSkillType("");
    setSoftSkillLanguage("");
  }, []);


  // Add new handler for skill selection
  const handleSkillSelection = (value: string | null) => {
    setNewSkill((prev) => ({ ...prev, name: value || "" }));
  };



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
    setSoftSkillProficiency(1);
  };

  const handleSoftSkillSubcategoryChange = (value: string) => {
    setSoftSkillSubcategory(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
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
      setSoftSkillProficiency(1);
    }
  };

  // Add handler for language change
  const handleSoftSkillLanguageChange = (value: string) => {
    setSoftSkillLanguage(value);
    const existingSkill = checkExistingSoftSkill(softSkillType, value);
    if (existingSkill) {
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
      setSoftSkillProficiency(1);
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
        console.log('Ad Post API Response:', json);
        
        // Handle nested data structure: json.data.posts or json.data.data.posts
        let posts = [];
        
        if (json.success && json.data) {
          // Check for nested posts array
          if (Array.isArray(json.data.posts)) {
            posts = json.data.posts;
          } else if (json.data.data && Array.isArray(json.data.data.posts)) {
            posts = json.data.data.posts;
          } else if (Array.isArray(json.data)) {
            posts = json.data;
          } else if (json.data.data && Array.isArray(json.data.data)) {
            posts = json.data.data;
          } else {
            posts = [json.data];
          }
        }
        
        console.log('Processed posts:', posts);
        console.log('Number of posts:', posts.length);
        
        if (posts.length > 0) {
          setAdPost(posts);
        } else {
          setAdError("No ad data available");
        }
      })
      .catch((e) => {
        console.error("Error fetching ad post:", e);
        setAdError(e.message || "Error fetching ad post");
      })
      .finally(() => {
        setAdLoading(false);
      });
  }, []);

  // Move all useMemo hooks here to ensure they're called every render
  const memoizedAdData = useMemo(() => {
    const processed = (adPost || []).map((ad: any) => {
      const processedAd = {
        _id: ad._id,
        title: ad.jobDetails?.title,
        description: ad.jobDetails?.description || '',
        firstStepId: (ad?.post_Steps && ad.post_Steps.length > 0) ? ad.post_Steps[0] : undefined,
        // Include all job details for the RecommendedOpportunities component
        jobDetails: ad.jobDetails,
        employmentType: ad.jobDetails?.employmentType,
        location: ad.jobDetails?.location,
        salary: ad.jobDetails?.salary,
        company: ad.jobDetails?.company,
        companyName: ad.jobDetails?.companyName,
        experienceLevel: ad.jobDetails?.experienceLevel,
        requirements: ad.jobDetails?.requirements,
        responsibilities: ad.jobDetails?.responsibilities,
      };
      return processedAd;
    });
    return processed;
  }, [adPost, profile]);

  const memoizedAdTotal = useMemo(() => {
    return Array.isArray(adPost) ? adPost.length : 0;
  }, [adPost]);

  return (
    <CandidateOnly>
      {/* Show loading state */}
      {loading && (
        <LoadingState />
      )}

      {/* Show error state */}
      {error && !loading && (
        <ErrorState error={error} onRetry={() => dispatch(getMyProfile())} />
      )}

      {/* Show main content only when profile is available */}
      {!loading && !error && profile && (
        <>
          {/* Navbar */}
          <DashboardNavbar
            profile={profile}
            onLogout={handleLogout}
            onEditProfile={() => setEditProfileOpen(true)}
            isMobile={isMobile}
          />
          <Box
            sx={{
              minHeight: "100vh",
              color: GREEN_MAIN,
              // padding: { xs: theme.spacing(2), sm: theme.spacing(4), md: theme.spacing(6) }, // Responsive padding
            }}
          >
            <Container maxWidth="lg">
              {/* Profile Header */}
                  <WelcomeHeader
                    profile={profile}
                    quota={profile?.quota || 0}
                    onStartTest={handleStartTest}
                    onHrInterview={() => {
                      const experienceLevel = profile?.requiredExperienceLevel || 'Mid-Level';
                      const role = profile?.targetRole || 'Software Engineer';
                      router.push(`/interview/hr?type=hr&role=${encodeURIComponent(role)}&proficiency=${encodeURIComponent(experienceLevel)}`);
                    }}
                    onCvBuilder={() => router.push("/resume-builder")}
                  />
                                     {/* Edit Profile Modal */}
                   <EditProfileModal
                     open={editProfileOpen}
                     onClose={handleEditProfileClose}
                     formData={formData}
                     onChange={handleInputChange}
                     onSubmit={handleSubmit}
                   />

                  {/* Test Selection Modal */}
                                     <TestSelectionDialog
                     open={testModalOpen}
                     onClose={handleCloseTestModal}
                     primaryAccentColor={GREEN_MAIN}
                     skillType={skillType}
                     onSkillTypeChange={handleSkillTypeChange}
                     skillCategories={skillCategories}
                     selectedCategory={selectedCategory}
                     onSelectedCategoryChange={(v) => setSelectedCategory(v)}
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
                     softSkillProficiency={softSkillProficiency}
                     router={router}
                     toast={toast}
                     getExperienceLevelFromProficiency={getExperienceLevelFromProficiency}
                     profileSkills={profile?.skills || []}
                     profileSoftSkills={profile?.softSkills || []}
                   />

              {/* Recommended Opportunities */}
              <StyledCard sx={{ mb: 4 }}>
                {adLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <CircularProgress size={32} sx={{ color: '#8310FF' }} />
                  </Box>
                ) : adError ? (
                  <Box sx={{ color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <Typography>{adError}</Typography>
                  </Box>
                ) : (
                  <RecommendedOpportunities
                    data={memoizedAdData}
                    total={memoizedAdTotal}
                    emptyText="You need to pass a test with a score of 'Good' or >20% to see recommended opportunities"
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
                 dispatch={dispatch}
                 getMyProfile={getMyProfile}
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
                primaryAccentColor={GREEN_MAIN}
                softSkills={softSkills}
                languages={languages}
                softSkillType={softSkillType}
                onSoftSkillChange={handleSoftSkillChange}
                softSkillLanguage={softSkillLanguage}
                onSoftSkillLanguageChange={handleSoftSkillLanguageChange}
                softSkillSubcategory={softSkillSubcategory}
                onSoftSkillSubcategoryChange={handleSoftSkillSubcategoryChange}
                softSkillProficiency={softSkillProficiency}
                router={router}
              />
              {/* Add Skill Dialog */}
              <AddSkillDialog
                open={addSkillDialogOpen}
                onClose={() => setAddSkillDialogOpen(false)}
                primaryAccentColor={GREEN_MAIN}
                selectedCategory={selectedCategory}
                onSelectedCategoryChange={(v) => setSelectedCategory(v)}
                newSkillName={newSkill.name}
                onSkillSelection={(v) => handleSkillSelection(v)}
                skillCategories={skillCategories}
                technicalSkillsList={technicalSkillsList}
                profileSkills={profile?.skills}
                router={router}
                setNotification={setNotification}
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
        </>
      )}
    </CandidateOnly>
  );
}

