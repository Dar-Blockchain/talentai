"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import { CATEGORIES, skillsByCategory } from "../data/skillsData";

type SelectSkillsProps = {
  preferences: ReturnType<
    typeof import("../hooks/usePreferences").usePreferences
  >;
};

// --- Colors for UI ---
const colors = {
  gray: "rgba(156, 163, 175, 1)",
  mauve: "rgba(168, 85, 247, 1)",
};

// --- Component ---
const SelectSkills = forwardRef(({ preferences }: SelectSkillsProps, ref) => {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const { skills, setSkills } = preferences;

  const [selectedSkill, setSelectedSkill] = useState<string | null>(
    skills[0] || null
  );
  const [error, setError] = useState(false);

  // Expose validate() method to parent
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!skills || skills.length === 0) {
        setError(true);
        return false;
      }
      setError(false);
      return true;
    },
  }));
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => {
          setActiveTab(val);
          setSelectedSkill(null);
        }}
        variant="scrollable"
        scrollButtons="auto" // shows arrows only when needed
        allowScrollButtonsMobile // enables arrows on mobile
        textColor="inherit"
        TabIndicatorProps={{
          style: {
            backgroundColor: colors.mauve,
            height: "3px",
            borderRadius: 2,
          },
        }}
        sx={{
          "& .MuiTabs-scrollButtons.Mui-disabled": {
            opacity: 0.3,
          },
          "& .MuiTabs-flexContainer": {
            gap: 3,
            justifyContent: "flex-start", // align first tab left
          },
          // optionally remove margin around arrows
          "& .MuiTabs-scrollButtons": {
            color: colors.mauve,
          },
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <Tab
              key={cat.id}
              value={cat.id}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: isActive ? colors.mauve : colors.gray,
                  }}
                >
                  {cat.icon}
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontStyle: "normal",
                      fontSize: "15px",
                      lineHeight: "19px",
                      letterSpacing: "0px",
                    }}
                  >
                    {cat.label}
                  </Typography>
                </Box>
              }
            />
          );
        })}
      </Tabs>

      {/* Section Title */}
      <Typography
        variant="subtitle1"
        sx={{ mt: 3, mb: 2, fontWeight: 500, fontFamily: "Poppins" }}
      >
        Select your {CATEGORIES.find((c) => c.id === activeTab)?.label} skills
      </Typography>

      {/* Skills Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {skillsByCategory[activeTab].map((skill) => {
          const isSelected = selectedSkill === skill;
          return (
            <Button
              key={skill}
              variant="outlined"
              onClick={() => {
                setSelectedSkill(skill);
                setSkills([skill]);
                setError(false);
              }}
              sx={{
                flex: 1,
                minWidth: "167px",
                borderRadius: "8px",
                borderWidth: "2px",
                borderColor: isSelected
                  ? "rgba(163, 98, 239, 1)"
                  : "rgba(136, 176, 211, 1)",
                color: isSelected ? "white" : "rgba(136, 176, 211, 1)",
                backgroundColor: isSelected
                  ? "rgba(163, 98, 239, 1)"
                  : "transparent",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "14px",
                height: "47px",
                padding: "17px 24px",
                "&:hover": {
                  borderColor: "rgba(163, 98, 239, 1)",
                  backgroundColor: "rgba(163, 98, 239, 1)",
                  color: "white",
                },
              }}
            >
              {skill}
            </Button>
          );
        })}
      </Box>

      {/* Helper Text */}
      <Typography
        variant="body2"
        sx={{
          mt: 3,
          color: "rgba(107, 114, 128, 1)",
          fontFamily: "Poppins",
          fontSize: "12px",
        }}
      >
        For now you can select only one skill, you can add more skills from the
        dashboard.
      </Typography>
      {/* Error message */}
      {error && (
        <Typography
          sx={{ mt: 2, color: "red", fontFamily: "Poppins", fontSize: "12px" }}
        >
          Please select one skill before continuing.
        </Typography>
      )}
    </Box>
  );
});

export default SelectSkills;
