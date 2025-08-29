import React from "react";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";

export type SkillBlockProps = {
  skill: any;
  type: "technical" | "soft";
  onStartTest: () => void;
  onDelete?: () => void;
  greenMain: string;
};

function SkillBlockComponent({ skill, type, onStartTest, onDelete, greenMain }: SkillBlockProps) {
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

  const proficiencyLevel = type === "technical" ? skill.proficiencyLevel : proficiencyMap[skill.experienceLevel] || 1;
  const percentage = (proficiencyLevel / 5) * 100;

  return (
    <Box sx={{ p: 3, borderRadius: "20px", background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, transition: "all 0.3s ease", border: "1px solid rgba(0, 0, 0, 0.05)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)", border: "1px solid rgba(0, 0, 0, 0.08)" } }}>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: "black", fontWeight: 600, fontSize: "1.1rem", mb: 1 }}>{skill.name}</Typography>
        {type === "soft" && (
          <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.6)", display: "block", mb: 1 }}>{skill.category}</Typography>
        )}
        <Typography variant="caption" sx={{ color: "black", ml: 1, fontWeight: 500 }}>
          {type === "technical" ? (
            <>
              {skill.Levelconfirmed && skill.Levelconfirmed > 0 ? (
                <Chip label={`${getLevelFromNumber(skill.Levelconfirmed)} Confirmed`} size="small" sx={{ ml: 1, backgroundColor: "rgba(0, 255, 157, 0.2)", color: "black", height: "20px", fontSize: "0.75rem" }} />
              ) : (
                <Chip label="No Level Confirmed" size="small" sx={{ ml: 1, backgroundColor: "rgba(255, 193, 7, 0.2)", color: "#856404", height: "20px", fontSize: "0.75rem" }} />
              )}
            </>
          ) : (
            skill.experienceLevel
          )}
        </Typography>
        <Box sx={{ height: "10px", background: "rgba(0,0,0,0.06)", borderRadius: "8px", overflow: "hidden", mt: 2, position: "relative" }}>
          <Box sx={{ width: `${percentage}%`, height: "100%", background: type === "technical" ? "linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)" : "linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)", borderRadius: "8px", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative", "&::after": { content: '""', position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)", animation: "shimmer 2s infinite" } }} />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onStartTest} sx={{ background: greenMain, color: "#000000", "&:hover": { background: greenMain } }}>
          Start Test
        </Button>
        {onDelete && (
          <IconButton onClick={onDelete} size="medium" sx={{ color: "#ff3b30", background: "rgba(255,59,48,0.08)", "&:hover": { background: "rgba(255,59,48,0.12)", transform: "scale(1.1)" } }}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default React.memo(SkillBlockComponent);


