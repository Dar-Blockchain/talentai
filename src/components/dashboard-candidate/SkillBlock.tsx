import React, { useState } from "react";
import { Box, Button, Chip, IconButton, Typography, Paper, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";

export type SkillBlockProps = {
  skill: any;
  type: "technical" | "soft";
  onStartTest: () => void;
  onDelete?: () => void;
  greenMain: string;
  profile: any;
};

function SkillBlockComponent({ profile, skill, type, onStartTest, onDelete, greenMain }: SkillBlockProps) {
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
      5: "Expert",
    };
    return levelMap[level] || "Entry Level";
  };

  // Use ScoreTest if available, otherwise fallback to proficiency level
  const scoreTest = skill.ScoreTest || 0;
  const percentage = scoreTest; // ScoreTest is already a percentage
  
  // Keep proficiency level for level badges
  const proficiencyLevel = type === "technical" ? skill.proficiencyLevel : proficiencyMap[skill.experienceLevel] || 1;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: '#ffffff',
        border: '1px solid #E0E0E0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            sx={{
              color: '#000000',
              fontWeight: 600,
              fontSize: '1.125rem',
            }}
          >
            {skill.name}
          </Typography>
          <Tooltip
            title={scoreTest > 0 ? `Test Score: ${percentage.toFixed(1)}%` : 'No test score yet'}
            arrow
            placement="top"
          >
            <Chip
              label={`${percentage.toFixed(1)}%`}
              size="small"
              sx={{
                backgroundColor: scoreTest > 0 ? '#8310FF' : '#CCCCCC',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 22,
                borderRadius: 1,
                cursor: 'help',
              }}
            />
          </Tooltip>
        </Box>
        
        {type === "soft" && (
          <Typography
            variant="body2"
            sx={{
              color: '#666666',
              fontSize: '0.875rem',
              mb: 1,
            }}
          >
            {skill.category}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {type === "technical" ? (
            <>
              {skill.Levelconfirmed && skill.Levelconfirmed > 0 ? (
                <Chip
                  label={`${getLevelFromNumber(skill.Levelconfirmed)} Confirmed`}
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Chip
                  label="No Level Confirmed"
                  size="small"
                  sx={{
                    backgroundColor: '#FF9800',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              )}
            </>
          ) : (
            <Chip
              label={skill.experienceLevel}
              size="small"
              sx={{
                backgroundColor: '#FF6B6B',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                borderRadius: 1,
              }}
            />
          )}
        </Box>
        
        <Box
          sx={{
            height: '8px',
            background: '#f0f0f0',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              background: type === "technical" 
                ? 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)' 
                : 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)',
              borderRadius: 2,
              transition: 'width 0.8s ease',
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStartTest}
          sx={{
            background: type === "technical" ? '#2196F3' : '#FF6B6B',
            color: '#ffffff',
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            '&:hover': {
              background: type === "technical" ? '#1976D2' : '#FF5252',
              transform: 'translateY(-1px)',
            },
          }}
          disabled={profile.quota >= 5}
        >
          Start Test
        </Button>
        
        {onDelete && (
          <IconButton
            onClick={onDelete}
            size="medium"
            sx={{
              color: '#ff3b30',
              background: 'rgba(255, 59, 48, 0.08)',
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(255, 59, 48, 0.12)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}

export default React.memo(SkillBlockComponent);


