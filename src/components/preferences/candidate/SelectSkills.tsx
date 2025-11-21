"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CATEGORIES, skillsByCategory } from "../data/skillsData";

type SelectSkillsProps = {
  preferences: ReturnType<
    typeof import("../hooks/usePreferences").usePreferences
  >;
};

// --- Proficiency Levels ---
const PROFICIENCY_LEVELS = [
  { value: "1", label: "Entry Level" },
  { value: "2", label: "Junior" },
  { value: "3", label: "Mid Level" },
  { value: "4", label: "Senior" },
  { value: "5", label: "Expert" }
];

// --- Colors for UI ---
const colors = {
  gray: "rgba(156, 163, 175, 1)",
  mauve: "rgba(168, 85, 247, 1)",
};

// --- Component ---
const SelectSkills = forwardRef(({ preferences }: SelectSkillsProps, ref) => {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const { skills, setSkills, skillProficiency, setSkillProficiency } = preferences;

  const [selectedSkill, setSelectedSkill] = useState<string | null>(
    skills[0] || null
  );
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
          setSelectedSkill(null);
          setSearchTerm(""); // reset search when changing tab
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
          "& .MuiTabs-scrollButtons.Mui-disabled": {
            opacity: 0.3,
          },
          "& .MuiTabs-flexContainer": {
            gap: 3,
            justifyContent: "flex-start",
          },
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
          })
        ) : (
          <Typography sx={{ color: "gray", mt: 1 }}>
            No skills found
          </Typography>
        )}
      </Box>

      {/* Proficiency Level Selector (shown after skill selection) */}
      {selectedSkill && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 500,
              fontFamily: "Poppins",
              fontSize: "15px",
              color: colors.mauve,
            }}
          >
            Select your proficiency level for {selectedSkill}
          </Typography>
          <TextField
            select
            fullWidth
            value={skillProficiency}
            onChange={(e) => setSkillProficiency(e.target.value)}
            sx={{
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: colors.mauve,
                },
              },
            }}
          >
            {PROFICIENCY_LEVELS.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                {level.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

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
