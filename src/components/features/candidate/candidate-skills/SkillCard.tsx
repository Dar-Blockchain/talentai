import React, { useCallback } from "react";
import { Typography, Box, LinearProgress, Button, Tooltip } from "@mui/material";
import { formatDistanceToNowStrict } from "date-fns";
import TimeOutlineIcon from "@/components/icons/TimeOutlineIcon";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/router";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

interface SkillCardProps {
  type: "technical" | "soft";
  skill: any;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, type }) => {
  const router = useRouter();
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile)
  const scoreTest = skill.ScoreTest || 0;
  const updatedAt = skill?.updatedAt
    ? formatDistanceToNowStrict(new Date(skill.updatedAt), { addSuffix: true })
    : "";

  //0->19, 20->39, 40->59, 60->79, 80->100

  const getLevelColor = (level: number) => {
    const levelMap: { [key: number]: any } = {
      1: "rgba(186, 200, 222, 1)",
      2: "rgba(251, 146, 60, 1)",
      3: "rgba(255, 180, 65, 1)",
      4: "rgba(11, 82, 198, 1)",
      5: "rgba(62, 180, 137, 1)",
    };
    return levelMap[level] || "rgba(156, 163, 175, 1)";
  };

  const getLevelFromNumber = (level: number): string => {
    const levelMap: { [key: number]: string } = {
      1: "Entry Level",
      2: "Junior",
      3: "Mid Level",
      4: "Senior",
      5: "Expert",
    };
    return levelMap[level] || "No Level";
  };

  const handleStartTest = useCallback(() => {
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
  }, [router]);

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid rgba(19, 151, 107, 0.22)",
        borderRadius: "8px",
        height: "120px",
        boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(62, 70, 82, 1)",
            fontSize: "17px",
            fontWeight: 600,
          }}
        >
          {skill?.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: getLevelColor(skill?.Levelconfirmed),
            fontSize: "16px",
            fontWeight: 400,
          }}
        >
          {scoreTest}%
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <TimeOutlineIcon />{" "}
        <Typography
          variant="body2"
          sx={{
            color: "rgba(84, 98, 116, 1)",
            fontWeight: 400,
            fontSize: "11px",
          }}
        >
          {updatedAt}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(84, 98, 116, 1)",
              fontWeight: 400,
              fontSize: "11px",
            }}
          >
            {getLevelFromNumber(skill?.Levelconfirmed)}
          </Typography>

<Tooltip
  title={
    profile.quota >= 5
      ? "You have passed your 5 tests for this month. Please wait for the next month."
      : ""
  }
  arrow
  disableHoverListener={profile.quota < 5} // only enable tooltip when disabled
>
  <span> {/* span needed because disabled buttons don't trigger tooltip */}
    <Button
      onClick={handleStartTest}
      variant="outlined"
      endIcon={<ChevronRightIcon />}
      disabled
      sx={{
        border: "none",
        background: "none",
        color: skill?.Levelconfirmed
          ? getLevelColor(skill?.Levelconfirmed)
          : "rgba(62, 180, 137, 1)",
        textDecoration: "unset",
        fontSize: "11px",
        fontWeight: 500,
        padding: 0,
        "& .MuiButton-endIcon": {
          marginLeft: 0,
          color: skill?.Levelconfirmed
            ? getLevelColor(skill?.Levelconfirmed)
            : "rgba(62, 180, 137, 1)",
        },
        "&.Mui-disabled": {
          color: "rgba(156, 163, 175, 1)",
          border: "none",
          "& .MuiButton-endIcon": {
            color: "rgba(156, 163, 175, 1)",
            transform: "none",
          },
        },
        "&:hover": {
          background: "none",
          textDecoration: "unset",
          fontWeight: 600,
          "& .MuiButton-endIcon": {
            transform: "scale(1.15)",
          },
        },
      }}
    >
      {!skill?.Levelconfirmed ? "Verify Skill" : "Pass Test Again"}
    </Button>
  </span>
</Tooltip>

        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(Math.max(scoreTest, 0), 100)}
          sx={{
            height: 7,
            borderRadius: 3,
            backgroundColor: "rgba(243, 245, 247, 1)",
            overflow: "hidden",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              backgroundColor: getLevelColor(skill?.Levelconfirmed),
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default SkillCard;