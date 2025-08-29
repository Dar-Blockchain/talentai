import React from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";

export type UserInfoCardProps = {
  profile: any;
  SectionTitle: any; // styled component from parent
  StyledCard: any; // styled component from parent
  ScoreCircle: any; // styled component from parent
  GREEN_MAIN: string;
  softSkillNames: string[];
  visibleSkills: number;
  setVisibleSkills: (updater: (prev: number) => number) => void;
  setAddSoftSkillDialogOpen: (open: boolean) => void;
  setAddSkillDialogOpen: (open: boolean) => void;
  SkillBlock: any; // component from parent
  handleStartTest: (type?: "technical" | "soft", skill?: any) => void;
  
  // Additional props for the delete functions
  dispatch: any;
  getMyProfile: any;
};

function UserInfoCardComponent(props: UserInfoCardProps) {
  const {
    profile,
    SectionTitle,
    StyledCard,
    ScoreCircle,
    GREEN_MAIN,
    softSkillNames,
    visibleSkills,
    setVisibleSkills,
    setAddSoftSkillDialogOpen,
    setAddSkillDialogOpen,
    SkillBlock,
    handleStartTest,
    dispatch,
    getMyProfile,
  } = props;

  const handleDeleteSkill = async (skillName: string) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        console.error("Authentication token not found");
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
      console.log("Skill deleted successfully");
    } catch (error) {
      console.error("Error deleting skill:", error);
      console.error("Failed to delete skill");
    }
  };

  const handleDeleteSoftSkill = async (skillName: string, category: string) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        console.error("Authentication token not found");
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
      console.log("Soft skill deleted successfully");
    } catch (error) {
      console.error("Error deleting soft skill:", error);
      console.error("Failed to delete soft skill");
    }
  };

  return (
    <Box sx={{
      display: "grid",
      width: "100%",
      gap: 4,
    }}>
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
                  mt: 3,
                }}
              >
                Showcase your technical and soft skills to potential employers
              </Typography>
            </Box>
          </Box>

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
                sx={{ position: "absolute", color: "rgba(0, 0, 0, 0.08)" }}
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
              <Box sx={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <Typography
                  variant="h3"
                  sx={{
                    background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)",
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
            <Typography sx={{ color: "rgba(0, 0, 0, 0.75)", fontSize: "1rem", fontWeight: 700, textTransform: "none", letterSpacing: 0.2 }}>
              Overall Score
            </Typography>
          </Box>

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
            <Typography sx={{ color: "#8310FF", fontSize: "1.1rem", fontWeight: 600, mb: 1 }}>
              💪 Keep Growing Your Skills!
            </Typography>
            <Typography sx={{ color: "rgba(0,0,0,0.7)", fontSize: "0.95rem", fontWeight: 500 }}>
              {Number(profile.overallScore) >= 90
                ? "You're an expert! Consider mentoring others and sharing your knowledge."
                : Number(profile.overallScore) >= 80
                ? "Excellent progress! You're close to becoming an expert in your field."
                : Number(profile.overallScore) >= 70
                ? "Great work! Keep practicing and you'll reach advanced level soon."
                : Number(profile.overallScore) >= 60
                ? "Good start! Focus on improving your weakest areas to boost your score."
                : "Welcome! Start by taking skill assessments to build your profile and track your progress."}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PersonIcon sx={{ color: "white", fontSize: "20px" }} />
                </Box>
                <Typography variant="h6" sx={{ color: "black", opacity: 0.9, fontWeight: 600, fontSize: "1.25rem" }}>
                  Soft Skills
                </Typography>
              </Box>
              <Button
                onClick={() => setAddSoftSkillDialogOpen(true)}
                variant="outlined"
                sx={{ color: "#FF6B6B", borderColor: "#FF6B6B", borderRadius: "12px", px: 3, py: 1, textTransform: "none", fontWeight: 600 }}
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
                    onDelete={() => handleDeleteSoftSkill(skill.name, skill.category)}
                  />
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4, px: 3, borderRadius: "16px", background: "rgba(255,107,107,0.05)", border: "2px dashed rgba(255,107,107,0.3)" }}>
                  <PersonIcon sx={{ fontSize: "48px", color: "rgba(255,107,107,0.5)", mb: 2 }} />
                  <Typography sx={{ color: "rgba(0,0,0,0.6)", fontSize: "1rem", fontWeight: 500 }}>
                    No soft skills added yet
                  </Typography>
                  <Typography sx={{ color: "rgba(0,0,0,0.5)", fontSize: "0.875rem", mt: 1 }}>
                    Start a soft skill test to add them to your profile
                  </Typography>
                  <Button onClick={() => setAddSoftSkillDialogOpen(true)} variant="contained" sx={{ mt: 2, background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)", color: "white", borderRadius: "12px", px: 3, py: 1.5, textTransform: "none", fontWeight: 600 }}>
                    Add Your First Skill
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <WorkIcon sx={{ color: "white", fontSize: "20px" }} />
                </Box>
                <Typography variant="h6" sx={{ color: "#000000", opacity: 0.9, fontWeight: 600, fontSize: "1.25rem" }}>
                  Technical Skills
                </Typography>
              </Box>
              <Button onClick={() => setAddSkillDialogOpen(true)} variant="outlined" sx={{ color: "#02E2FF", borderColor: "#02E2FF", borderRadius: "12px", px: 3, py: 1, textTransform: "none", fontWeight: 600 }}>
                Add Technical Skill
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {profile.skills?.filter((skill: any) => !softSkillNames.includes(skill.name))?.length > 0 ? (
                <>
                  {profile.skills
                    ?.filter((skill: any) => !softSkillNames.includes(skill.name))
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
                  {profile.skills?.filter((skill: any) => !softSkillNames.includes(skill.name))?.length > visibleSkills && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <Button onClick={() => setVisibleSkills((prev) => prev + 3)} variant="outlined" sx={{ color: "#02E2FF", borderColor: "#02E2FF", borderRadius: "12px", px: 3, py: 1, textTransform: "none", fontWeight: 600 }}>
                        Load More
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 4, px: 3, borderRadius: "16px", background: "rgba(2,226,255,0.05)", border: "2px dashed rgba(2,226,255,0.3)" }}>
                  <WorkIcon sx={{ fontSize: "48px", color: "rgba(2,226,255,0.5)", mb: 2 }} />
                  <Typography sx={{ color: "rgba(0,0,0,0.6)", fontSize: "1rem", fontWeight: 500 }}>
                    No technical skills added yet
                  </Typography>
                  <Typography sx={{ color: "rgba(0,0,0,0.5)", fontSize: "0.875rem", mt: 1 }}>
                    Start a technical skill test to add them to your profile
                  </Typography>
                  <Button onClick={() => setAddSkillDialogOpen(true)} variant="contained" sx={{ mt: 2, background: "linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)", color: "white", borderRadius: "12px", px: 3, py: 1.5, textTransform: "none", fontWeight: 600 }}>
                    Add Your First Skill
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </StyledCard>
      </Box>
    </Box>
  );
}
export default React.memo(UserInfoCardComponent);


