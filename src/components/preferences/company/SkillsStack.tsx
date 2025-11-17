"use client";

import { forwardRef, useState, useImperativeHandle } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CATEGORIES, skillsByCategory } from "../data/skillsData";

type SkillsStackProps = {
  preferences: ReturnType<
    typeof import("../hooks/usePreferences").usePreferences
  >;
};

// --- Colors for UI ---
const colors = {
  gray: "rgba(156, 163, 175, 1)",
  mauve: "rgba(12, 218, 139, 1)",
};

// --- Component ---
const SkillsStack = forwardRef(({ preferences }: SkillsStackProps, ref) => {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const { skills, setSkills } = preferences;
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
    setError(false);
  };

  // Filter skills by search term
  const filteredSkills = skillsByCategory[activeTab].filter((skill) =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => {
          setActiveTab(val);
          setSearchTerm(""); // reset search on tab change
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        TabIndicatorProps={{
          style: {
            backgroundColor: colors.mauve,
            height: "3px",
            borderRadius: 2,
          },
        }}
        sx={{
          "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: 0.3 },
          "& .MuiTabs-flexContainer": { gap: 3, justifyContent: "flex-start" },
          "& .MuiTabs-scrollButtons": { color: colors.mauve },
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
                  <Typography sx={{ fontWeight: 500, fontSize: "15px" }}>
                    {cat.label}
                  </Typography>
                </Box>
              }
            />
          );
        })}
      </Tabs>

      {/* Section Title */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 500 }}>
        Select your {CATEGORIES.find((c) => c.id === activeTab)?.label} skills
      </Typography>

      {/* Search Input with Icon */}
      <TextField
        placeholder="Search skills..."
        fullWidth
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.gray }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Skills Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => {
            const isSelected = skills.includes(skill);
            return (
              <Button
                key={skill}
                variant="outlined"
                onClick={() => toggleSkill(skill)}
                sx={{
                  flex: 1,
                  minWidth: "167px",
                  borderRadius: "8px",
                  borderWidth: "2px",
                  borderColor: isSelected ? colors.mauve : "rgba(136, 176, 211, 1)",
                  color: isSelected ? "white" : "rgba(136, 176, 211, 1)",
                  backgroundColor: isSelected ? colors.mauve : "transparent",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "14px",
                  height: "47px",
                  padding: "17px 24px",
                  "&:hover": {
                    borderColor: colors.mauve,
                    backgroundColor: colors.mauve,
                    color: "white",
                  },
                }}
              >
                {skill}
              </Button>
            );
          })
        ) : (
          <Typography sx={{ color: "gray", mt: 1 }}>No skills found</Typography>
        )}
      </Box>

      {/* Helper Text */}
      <Typography sx={{ mt: 3, color: "rgba(107, 114, 128, 1)", fontSize: "12px" }}>
        Pro-tip: The more specific you are, the better your matches will be!
      </Typography>

      {/* Error message */}
      {error && (
        <Typography sx={{ mt: 2, color: "red", fontFamily: "Poppins", fontSize: "12px" }}>
          Please select at least one skill before continuing.
        </Typography>
      )}
    </Box>
  );
});

export default SkillsStack;
