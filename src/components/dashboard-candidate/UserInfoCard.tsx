import React, { useState, useMemo, useCallback } from "react";
import { Box, Button, Typography, Paper, Pagination, Fade, Card } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { styled } from "@mui/material/styles";
import { softSkillNames } from "@/constants/skills";
import SkillBlock from "./SkillBlock";
import { useRouter } from "next/router";
import AssessmentModal from "./AssessmentModal";

// Skill section configuration
const SKILL_SECTIONS = {
  soft: {
    title: "Soft Skills",
    color: "#FF6B6B",
    hoverColor: "#FF5252",
    underlineColor: "#FFD700",
    gradientStart: "#FF6B6B",
    gradientEnd: "#FF8E53",
    emptyMessage: "No Soft skills added yet",
    emptySubtext: "Start a soft skill test to add them to your profile",
  },
  technical: {
    title: "Technical Skills",
    color: "#2196F3",
    hoverColor: "#1976D2",
    underlineColor: "#2196F3",
    gradientStart: "#2196F3",
    gradientEnd: "#1976D2",
    emptyMessage: "No Technical skills added yet",
    emptySubtext: "Start a Technical skill test to add them to your profile",
  },
} as const;

const SKILLS_PER_PAGE = 3;

// Reusable section header component
const SkillSectionHeader: React.FC<{
  title: string;
  underlineColor: string;
  buttonColor: string;
  hoverColor: string;
  onAdd: () => void;
  disabled: boolean;
}> = ({ title, underlineColor, buttonColor, hoverColor, onAdd, disabled }) => (
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
          background: underlineColor,
          borderRadius: '2px',
        },
      }}
    >
      {title}
    </Typography>

    <Button
      onClick={onAdd}
      variant="outlined"
      startIcon={<AddIcon />}
      sx={{
        borderColor: buttonColor,
        color: buttonColor,
        borderRadius: 2,
        px: 2,
        py: 1,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        '&:hover': {
          borderColor: hoverColor,
          backgroundColor: `${buttonColor}0a`,
        },
      }}
      disabled={disabled}
    >
      Add {title.split(' ')[0]} Skill
    </Button>
  </Box>
);

// Reusable pagination component
const SkillPagination: React.FC<{
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  gradientStart: string;
  gradientEnd: string;
}> = ({ count, page, onChange, gradientStart, gradientEnd }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
    <Pagination
      count={count}
      page={page}
      onChange={onChange}
      color="primary"
      size="large"
      sx={{
        '& .MuiPaginationItem-root': {
          fontWeight: 600,
          fontSize: '1rem',
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
            color: '#fff',
            '&:hover': {
              background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
            }
          }
        }
      }}
    />
  </Box>
);

// Reusable empty state component
const EmptySkillsState: React.FC<{
  message: string;
  subtext: string;
  buttonColor: string;
  hoverColor: string;
  onAdd: () => void;
  disabled: boolean;
}> = ({ message, subtext, buttonColor, hoverColor, onAdd, disabled }) => (
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
      {message}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: '#666666',
        fontSize: '0.875rem',
        mb: 3,
      }}
    >
      {subtext}
    </Typography>
    <Button
      onClick={onAdd}
      variant="outlined"
      startIcon={<AddIcon />}
      sx={{
        borderColor: buttonColor,
        color: buttonColor,
        borderRadius: 2,
        px: 3,
        py: 1.5,
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': {
          borderColor: hoverColor,
          backgroundColor: `${buttonColor}0a`,
        },
      }}
      disabled={disabled}
    >
      Add Your First Skill
    </Button>
  </Paper>
);

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

function UserInfoCardComponent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>()
  const { profile } = useSelector(selectProfile);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedSkillType, setSelectedSkillType] = useState<'soft' | 'technical' | ''>('');

  const [technicalSkillsPage, setTechnicalSkillsPage] = useState(1);
  const [softSkillsPage, setSoftSkillsPage] = useState(1);
  const [deletingSkills, setDeletingSkills] = useState<Set<string>>(new Set());

  // Memoize filtered technical skills
  const technicalSkills = useMemo(
    () => profile?.skills?.filter((skill: any) => !softSkillNames.includes(skill.name)) || [],
    [profile?.skills, softSkillNames]
  );

    const handleStartTest = useCallback(
    (type?: "technical" | "soft", skill?: any) => {
      if (type && skill) {
        if (type === "technical") {
          // Use default proficiency level of 1 if not defined
          const proficiencyLevel = skill.proficiencyLevel || 1;
          // Navigate to new HR interview route
          router.push(
            `/interview/hr/?type=technical&skill=${encodeURIComponent(
              skill.name
            )}&proficiency=${proficiencyLevel}`
          );
        } else {
          const proficiencyMap: { [key: string]: number } = {
            "Entry Level": 1,
            Junior: 2,
            "Mid Level": 3,
            Senior: 4,
            Expert: 5,
          };
          // Navigate to new HR interview route
          router.push(
            `/interview/hr/?type=soft&skill=${encodeURIComponent(
              skill.name
            )}&category=${encodeURIComponent(skill.category)}&proficiency=${
              proficiencyMap[skill.experienceLevel] || 1
            }`
          );
        }
      }
    },
    [router]
  );

  // Generic delete handler with optimistic update and fade animation
  const handleDeleteSkill = useCallback(async (
    endpoint: string,
    payload: Record<string, string>,
    skillName: string
  ) => {
    // Optimistically mark skill as deleting (triggers fade out)
    setDeletingSkills(prev => new Set(prev).add(skillName));

    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        console.error("Authentication token not found");
        setDeletingSkills(prev => {
          const next = new Set(prev);
          next.delete(skillName);
          return next;
        });
        return;
      }

      // Wait for fade animation to complete before making API call
      setTimeout(async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (response.ok) {
            // Refresh profile to get updated data
            await dispatch(getMyProfile());
          } else {
            // On error, remove from deleting set to restore skill
            setDeletingSkills(prev => {
              const next = new Set(prev);
              next.delete(skillName);
              return next;
            });
          }
        } catch (error) {
          console.error("Error deleting skill:", error);
          // On error, remove from deleting set to restore skill
          setDeletingSkills(prev => {
            const next = new Set(prev);
            next.delete(skillName);
            return next;
          });
        }
      }, 300); // Match fade animation duration
    } catch (error) {
      console.error("Error deleting skill:", error);
      setDeletingSkills(prev => {
        const next = new Set(prev);
        next.delete(skillName);
        return next;
      });
    }
  }, [dispatch, getMyProfile]);

  const deleteTechnicalSkill = useCallback((skillName: string) => {
    handleDeleteSkill("profiles/deleteHardSkill", { skillToDelete: skillName }, skillName);
  }, [handleDeleteSkill]);

  const deleteSoftSkill = useCallback((skillName: string) => {
    handleDeleteSkill("profiles/deleteSoftSkills", { softSkillToDelete: skillName }, skillName);
  }, [handleDeleteSkill]);

  // Paginated skills
  const paginatedSoftSkills = useMemo(
    () => profile?.softSkills?.slice(
      (softSkillsPage - 1) * SKILLS_PER_PAGE,
      softSkillsPage * SKILLS_PER_PAGE
    ) || [],
    [profile?.softSkills, softSkillsPage]
  );

  const paginatedTechnicalSkills = useMemo(
    () => technicalSkills.slice(
      (technicalSkillsPage - 1) * SKILLS_PER_PAGE,
      technicalSkillsPage * SKILLS_PER_PAGE
    ),
    [technicalSkills, technicalSkillsPage]
  );

  const softConfig = SKILL_SECTIONS.soft;
  const techConfig = SKILL_SECTIONS.technical;

  return (
    <StyledCard>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Skills & Expertise Header */}
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

              <Typography variant="body1" sx={{ color: '#000000', fontSize: '1rem', mb: 1, fontWeight: 400 }}>
                Showcase your technical and soft skills to potential employers
              </Typography>

              <Typography variant="body1" sx={{ color: '#000000', fontSize: '1rem', mb: 1, fontWeight: 400 }}>
                💪 Keep growing Your skills
              </Typography>

              <Typography variant="body1" sx={{ color: '#000000', fontSize: '1rem', fontWeight: 400 }}>
                Start by taking skill assessments to build your profile and track your progress
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Soft Skills Section */}
        <Box>
          <SkillSectionHeader
            title={softConfig.title}
            underlineColor={softConfig.underlineColor}
            buttonColor={softConfig.color}
            hoverColor={softConfig.hoverColor}
            onAdd={() => {setSelectedSkillType('soft'); setTestModalOpen(true);}}
            disabled={profile?.quota >= 5}
          />

          {profile?.softSkills?.length ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {paginatedSoftSkills.map((skill: any) => (
                  <Fade
                    key={`${skill.name}-${skill.category}`}
                    in={!deletingSkills.has(skill.name)}
                    timeout={300}
                    unmountOnExit
                  >
                    <Box>
                      <SkillBlock
                        profile={profile}
                        skill={skill}
                        type="soft"
                        onStartTest={() => handleStartTest("soft", skill)}
                        onDelete={() => deleteSoftSkill(skill.name)}
                        allSkills={profile?.skills || []}
                      />
                    </Box>
                  </Fade>
                ))}
              </Box>

              {profile.softSkills.length > SKILLS_PER_PAGE && (
                <SkillPagination
                  count={Math.ceil(profile.softSkills.length / SKILLS_PER_PAGE)}
                  page={softSkillsPage}
                  onChange={(event, value) => setSoftSkillsPage(value)}
                  gradientStart={softConfig.gradientStart}
                  gradientEnd={softConfig.gradientEnd}
                />
              )}
            </>
          ) : (
            <EmptySkillsState
              message={softConfig.emptyMessage}
              subtext={softConfig.emptySubtext}
              buttonColor={softConfig.color}
              hoverColor={softConfig.hoverColor}
            onAdd={() => {setSelectedSkillType('soft'); setTestModalOpen(true);}}
              disabled={profile?.quota >= 5}
            />
          )}
        </Box>

        {/* Technical Skills Section */}
        <Box>
          <SkillSectionHeader
            title={techConfig.title}
            underlineColor={techConfig.underlineColor}
            buttonColor={techConfig.color}
            hoverColor={techConfig.hoverColor}
            
            onAdd={() => {setSelectedSkillType('technical'); setTestModalOpen(true)}}
            disabled={profile?.quota >= 5}
          />

          {technicalSkills.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {paginatedTechnicalSkills.map((skill: any) => (
                  <Fade
                    key={skill.name}
                    in={!deletingSkills.has(skill.name)}
                    timeout={300}
                    unmountOnExit
                  >
                    <Box>
                      <SkillBlock
                        profile={profile}
                        skill={skill}
                        type="technical"
                        onStartTest={() => handleStartTest("technical", skill)}
                        onDelete={() => deleteTechnicalSkill(skill.name)}
                        allSkills={technicalSkills}
                      />
                    </Box>
                  </Fade>
                ))}
              </Box>

              {technicalSkills.length > SKILLS_PER_PAGE && (
                <SkillPagination
                  count={Math.ceil(technicalSkills.length / SKILLS_PER_PAGE)}
                  page={technicalSkillsPage}
                  onChange={(event, value) => setTechnicalSkillsPage(value)}
                  gradientStart={techConfig.gradientStart}
                  gradientEnd={techConfig.gradientEnd}
                />
              )}
            </>
          ) : (
            <EmptySkillsState
              message={techConfig.emptyMessage}
              subtext={techConfig.emptySubtext}
              buttonColor={techConfig.color}
              hoverColor={techConfig.hoverColor}
            onAdd={() => {setSelectedSkillType('technical'); setTestModalOpen(true);}}
              disabled={profile?.quota >= 5}
            />
          )}
        </Box>
      </Box>
      <AssessmentModal
        type={selectedSkillType}
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />
    </StyledCard>
  );
}

export default React.memo(UserInfoCardComponent);
