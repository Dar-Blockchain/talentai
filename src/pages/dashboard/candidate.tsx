import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";

import { AppDispatch } from "@/store/store";
import {
  Box,
  Container,
  Typography,
  Card,
  Alert,
  useTheme,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
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
import LoadingState from "@/components/dashboard-candidate/LoadingState";
import ErrorState from "@/components/dashboard-candidate/ErrorState";
import CandidateEngagementTasks from "@/components/dashboard-candidate/CandidateEngagementTasks";
import {
  skillCategories,
  softSkillNames,
  softSkills,
  technicalSkillsList,
} from "@/constants/skills";
import HeaderDashboard from "@/components/HeaderDashboard";

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

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [skillType, setSkillType] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [softSkillType, setSoftSkillType] = useState("");
  const [softSkillLanguage, setSoftSkillLanguage] = useState("");
  const [softSkillSubcategory, setSoftSkillSubcategory] = useState("");
  const [softSkillProficiency, setSoftSkillProficiency] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibleSkills, setVisibleSkills] = useState(3); // Add this line for tracking visible skills

  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", proficiencyLevel: 1 });
  const [addSoftSkillDialogOpen, setAddSoftSkillDialogOpen] = useState(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "error",
  });

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleStartTest = useCallback(
    (type?: "technical" | "soft", skill?: any) => {
      if (type && skill) {
        setSkillType(type);
        if (type === "technical") {
          setSelectedSkill(skill.name);
          // Use default proficiency level of 1 if not defined
          const proficiencyLevel = skill.proficiencyLevel || 1;
          // Navigate to new HR interview route
          router.push(
            `/interview/hr/?type=technical&skill=${encodeURIComponent(
              skill.name
            )}&proficiency=${proficiencyLevel}`
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
          // Navigate to new HR interview route
          router.push(
            `/interview/hr/?type=soft&skill=${encodeURIComponent(
              skill.name
            )}&category=${encodeURIComponent(skill.category)}&proficiency=${
              proficiencyMap[skill.experienceLevel] || 1
            }`
          );
        }
      } else {
        setTestModalOpen(true);
      }
    },
    [router]
  );

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

  const handleSkillTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSkillType(event.target.value);
      setSelectedSkill("");
      setSoftSkillType("");
      setSoftSkillLanguage("");
    },
    []
  );

  // Add new handler for skill selection
  const handleSkillSelection = (value: string | null) => {
    setNewSkill((prev) => ({ ...prev, name: value || "" }));
  };

  const languages = [{ value: "English", label: "English" }];

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

  return (
    <CandidateOnly>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgba(251, 254, 255, 1)",
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          {/* Show loading state */}
          {loading && <LoadingState />}

          {/* Show error state */}
          {error && !loading && (
            <ErrorState
              error={error}
              onRetry={() => dispatch(getMyProfile())}
            />
          )}

          {/* Show main content only when profile is available */}
          {!loading && !error && profile && (
            <>
              {/* Navbar */}
              <HeaderDashboard />

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
                      const experienceLevel =
                        profile?.requiredExperienceLevel || "Mid-Level";
                      const role = profile?.targetRole || "Software Engineer";
                      router.push(
                        `/interview/hr?type=hr&role=${encodeURIComponent(
                          role
                        )}&proficiency=${encodeURIComponent(experienceLevel)}`
                      );
                    }}
                    onCvBuilder={() => router.push("/resume-builder")}
                  />

                  {/* Engagement Tasks Checklist */}
                  <CandidateEngagementTasks
                    profile={profile}
                    onStartTest={handleStartTest}
                    tokenBalance={0}
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
                    onSoftSkillSubcategoryChange={
                      handleSoftSkillSubcategoryChange
                    }
                    softSkillProficiency={softSkillProficiency}
                    router={router}
                    toast={toast}
                    getExperienceLevelFromProficiency={
                      getExperienceLevelFromProficiency
                    }
                    profileSkills={profile?.skills || []}
                    profileSoftSkills={profile?.softSkills || []}
                  />

                  {/* Token Balance Card */}
                  {/* <TokenBalanceCard /> */}

                  <RecommendedOpportunities />

                  {/* User Information */}
                  <UserInfoCard
                    profile={profile}
                    SectionTitle={SectionTitle}
                    StyledCard={StyledCard}
                    ScoreCircle={ScoreCircle}
                    GREEN_MAIN={GREEN_MAIN}
                    softSkillNames={softSkillNames}
                    visibleSkills={visibleSkills}
                    setVisibleSkills={(updater: any) =>
                      setVisibleSkills(updater)
                    }
                    setAddSoftSkillDialogOpen={(open: boolean) =>
                      setAddSoftSkillDialogOpen(open)
                    }
                    setAddSkillDialogOpen={(open: boolean) =>
                      setAddSkillDialogOpen(open)
                    }
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
                    onSoftSkillSubcategoryChange={
                      handleSoftSkillSubcategoryChange
                    }
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
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  >
                    <Alert
                      onClose={handleCloseNotification}
                      severity={notification.severity}
                      sx={{
                        width: "100%",
                        backgroundColor:
                          notification.severity === "error"
                            ? "#ffebee"
                            : "#e8f5e9",
                        color:
                          notification.severity === "error"
                            ? "#c62828"
                            : "#2e7d32",
                        "& .MuiAlert-icon": {
                          color:
                            notification.severity === "error"
                              ? "#c62828"
                              : "#2e7d32",
                        },
                      }}
                    >
                      {notification.message}
                    </Alert>
                  </Snackbar>
                </Container>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </CandidateOnly>
  );
}
