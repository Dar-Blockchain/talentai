import React from "react";
import { Box, Button, CircularProgress, Typography, Paper } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import AddIcon from "@mui/icons-material/Add";

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
    <StyledCard>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Skills & Expertise Section */}
        <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#000000',
                fontSize: '1.5rem',
                mb: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '120px',
                  height: '3px',
                  background: '#8310FF',
                  borderRadius: '2px',
                },
              }}
            >
              Skills & Expertise
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#000000',
                fontSize: '1rem',
                mb: 1,
                fontWeight: 400,
              }}
            >
              Showcase your technical and soft skills to potential employers
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#000000',
                fontSize: '1rem',
                mb: 1,
                fontWeight: 400,
              }}
            >
              💪 Keep growing Your skills
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 400,
              }}
            >
              Start by taking skill assessments to build your profile and track your progress
            </Typography>
          </Box>
          
          {/* Overall Score Circle */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 4 }}>
            <Box sx={{ position: 'relative', width: 120, height: 120 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={120}
                thickness={4}
                sx={{ 
                  position: 'absolute', 
                  color: 'rgba(0, 0, 0, 0.1)',
                }}
              />
              <CircularProgress
                variant="determinate"
                value={profile ? Number(profile.overallScore) : 0}
                size={120}
                thickness={4}
                sx={{
                  position: 'absolute',
                  color: 'transparent',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                    stroke: 'url(#scoreGradient)',
                  },
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#000000',
                    fontSize: '1.75rem',
                    lineHeight: 1,
                  }}
                >
                  {profile ? Number(profile.overallScore).toFixed(2) : "0.00"}
                </Typography>
              </Box>
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="100%" stopColor="#FF8E53" />
                  </linearGradient>
                </defs>
              </svg>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                fontSize: '0.875rem',
                fontWeight: 400,
                mt: 1,
              }}
            >
              Overall Score
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Soft Skills Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#000000',
              fontSize: '1.25rem',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: '80px',
                height: '3px',
                background: '#FFD700',
                borderRadius: '2px',
              },
            }}
          >
            Soft Skills
          </Typography>
          
          <Button
            onClick={() => setAddSoftSkillDialogOpen(true)}
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              borderColor: '#FF6B6B',
              color: '#FF6B6B',
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#FF5252',
                backgroundColor: 'rgba(255, 107, 107, 0.04)',
              },
            }}
          >
            Add Soft Skill
          </Button>
        </Box>
        
        {profile?.softSkills?.length ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {profile.softSkills.map((skill: any) => (
              <SkillBlock
                key={`${skill.name}-${skill.category}`}
                skill={skill}
                type="soft"
                onStartTest={() => handleStartTest("soft", skill)}
                onDelete={() => handleDeleteSoftSkill(skill.name, skill.category)}
              />
            ))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#000000',
                fontSize: '1rem',
                mb: 1,
              }}
            >
              No Soft skills added yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                fontSize: '0.875rem',
                mb: 3,
              }}
            >
              Start a soft skill test to add them to your profile
            </Typography>
            <Button
              onClick={() => setAddSoftSkillDialogOpen(true)}
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                borderColor: '#FF6B6B',
                color: '#FF6B6B',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#FF5252',
                  backgroundColor: 'rgba(255, 107, 107, 0.04)',
                },
              }}
            >
              Add Your First Skill
            </Button>
          </Paper>
        )}
      </Box>

      {/* Technical Skills Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#000000',
              fontSize: '1.25rem',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: '80px',
                height: '3px',
                background: '#2196F3',
                borderRadius: '2px',
              },
            }}
          >
            Technical Skills
          </Typography>
          
          <Button
            onClick={() => setAddSkillDialogOpen(true)}
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              borderColor: '#2196F3',
              color: '#2196F3',
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#1976D2',
                backgroundColor: 'rgba(33, 150, 243, 0.04)',
              },
            }}
          >
            Add Technical Skill
          </Button>
        </Box>
        
        {profile.skills?.filter((skill: any) => !softSkillNames.includes(skill.name))?.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  onClick={() => setVisibleSkills((prev) => prev + 3)} 
                  variant="outlined" 
                  sx={{ 
                    color: '#2196F3', 
                    borderColor: '#2196F3', 
                    borderRadius: 2, 
                    px: 3, 
                    py: 1, 
                    textTransform: 'none', 
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#1976D2',
                      backgroundColor: 'rgba(33, 150, 243, 0.04)',
                    },
                  }}
                >
                  Load More
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#000000',
                fontSize: '1rem',
                mb: 1,
              }}
            >
              No Soft skills added yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                fontSize: '0.875rem',
                mb: 3,
              }}
            >
              Start a soft skill test to add them to your profile
            </Typography>
            <Button
              onClick={() => setAddSkillDialogOpen(true)}
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                borderColor: '#2196F3',
                color: '#2196F3',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#1976D2',
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                },
              }}
            >
              Add Your First Skill
            </Button>
          </Paper>
        )}
      </Box>
      </Box>
    </StyledCard>
  );
}
export default React.memo(UserInfoCardComponent);


