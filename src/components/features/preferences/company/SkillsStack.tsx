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
  Chip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  JOB_CATEGORIES,
  TECH_BY_ROLE,
  rolesByCategory,
  getRoleLabel,
} from "../data/jobRolesData";

type SkillsStackProps = {
  preferences: ReturnType<
    typeof import("../hooks/usePreferences").usePreferences
  >;
};

// --- Colors for UI ---
const colors = {
  gray: "rgba(156, 163, 175, 1)",
  mauve: "rgba(12, 218, 139, 1)",
  lightGray: "rgba(243, 244, 246, 1)",
};

// --- Component ---
const SkillsStack = forwardRef(({ preferences }: SkillsStackProps, ref) => {
  const [step, setStep] = useState<"roles" | "tech">("roles"); // Two-step flow
  const [activeTab, setActiveTab] = useState(JOB_CATEGORIES[0].id);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { skills, setSkills } = preferences;
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Expose validate() method to parent
  useImperativeHandle(ref, () => ({
    validate: () => {
      // Only validate tech stack (skills) at the end
      if (step === "tech" && (!skills || skills.length === 0)) {
        setError(true);
        return false;
      }
      // If on roles step, check if at least one role is selected
      if (step === "roles" && selectedRoles.length === 0) {
        setError(true);
        return false;
      }
      setError(false);
      return true;
    },
  }));

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
    setError(false);
  };

  const toggleTech = (tech: string) => {
    if (skills.includes(tech)) {
      setSkills(skills.filter((s) => s !== tech));
    } else {
      setSkills([...skills, tech]);
    }
    setError(false);
  };

  const handleContinue = () => {
    if (selectedRoles.length === 0) {
      setError(true);
      return;
    }
    setError(false);
    setStep("tech");
  };

  const handleBack = () => {
    setStep("roles");
    setSearchTerm("");
  };

  // Get all technologies for selected roles
  const getAllTechForSelectedRoles = (): string[] => {
    const techSet = new Set<string>();
    selectedRoles.forEach((roleId) => {
      const techs = TECH_BY_ROLE[roleId] || [];
      techs.forEach((t) => techSet.add(t));
    });
    return Array.from(techSet).sort();
  };

  // Filter tech by search term
  const filteredTech = getAllTechForSelectedRoles().filter((tech) =>
    tech.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STEP 1: Role Selection ---
  if (step === "roles") {
    const currentRoles = rolesByCategory[activeTab] || [];
    const filteredRoles = currentRoles.filter((role) =>
      role.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Box sx={{ width: "100%", p: 3 }}>
        {/* Title */}
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "#1F2937" }}>
          What roles are you hiring for?
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: colors.gray }}>
          Select the positions you need to fill. You'll choose the tech stack next.
        </Typography>

        {/* Selected Roles Preview */}
        {selectedRoles.length > 0 && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: colors.lightGray, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: colors.gray, mb: 1, display: "block" }}>
              Selected Roles ({selectedRoles.length}):
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedRoles.map((roleId) => (
                <Chip
                  key={roleId}
                  label={getRoleLabel(roleId)}
                  onDelete={() => toggleRole(roleId)}
                  size="small"
                  sx={{
                    backgroundColor: colors.mauve,
                    color: "#fff",
                    "& .MuiChip-deleteIcon": { color: "#fff" },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            setSearchTerm("");
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
          {JOB_CATEGORIES.map((cat) => {
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

        {/* Search Input */}
        <TextField
          placeholder="Search roles..."
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 3, mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.gray }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Role Buttons */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <Button
                  key={role.id}
                  variant="outlined"
                  onClick={() => toggleRole(role.id)}
                  sx={{
                    flex: 1,
                    minWidth: "200px",
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
                  {role.label}
                </Button>
              );
            })
          ) : (
            <Typography sx={{ color: "gray", mt: 1 }}>No roles found</Typography>
          )}
        </Box>

        {/* Continue Button */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={selectedRoles.length === 0}
            sx={{
              backgroundColor: colors.mauve,
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(10, 200, 120, 1)",
              },
              "&:disabled": {
                backgroundColor: "rgba(200, 200, 200, 1)",
                color: "#fff",
              },
            }}
          >
            Continue to Tech Stack
          </Button>
        </Box>

        {/* Error message */}
        {error && (
          <Typography sx={{ mt: 2, color: "red", fontFamily: "Poppins", fontSize: "12px", textAlign: "center" }}>
            Please select at least one role before continuing.
          </Typography>
        )}
      </Box>
    );
  }

  // --- STEP 2: Tech Stack Selection ---
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          mb: 2,
          color: colors.gray,
          textTransform: "none",
          fontWeight: 500,
          "&:hover": { color: colors.mauve },
        }}
      >
        Back to Roles
      </Button>

      {/* Title */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "#1F2937" }}>
        Select Your Tech Stack
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: colors.gray }}>
        Choose the technologies and tools you're looking for based on your selected roles.
      </Typography>

      {/* Selected Roles Summary */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: colors.lightGray, borderRadius: 2 }}>
        <Typography variant="caption" sx={{ color: colors.gray, mb: 1, display: "block" }}>
          Hiring For:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedRoles.map((roleId) => (
            <Chip
              key={roleId}
              label={getRoleLabel(roleId)}
              size="small"
              icon={<CheckCircleIcon />}
              sx={{
                backgroundColor: colors.mauve,
                color: "#fff",
                "& .MuiChip-icon": { color: "#fff" },
              }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Section Title */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        Recommended Technologies for Your Roles
      </Typography>

      {/* Search Input */}
      <TextField
        placeholder="Search technologies..."
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

      {/* Tech Stack Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {filteredTech.length > 0 ? (
          filteredTech.map((tech) => {
            const isSelected = skills.includes(tech);
            return (
              <Button
                key={tech}
                variant="outlined"
                onClick={() => toggleTech(tech)}
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
                {tech}
              </Button>
            );
          })
        ) : (
          <Typography sx={{ color: "gray", mt: 1 }}>No technologies found</Typography>
        )}
      </Box>

      {/* Helper Text */}
      <Typography sx={{ mt: 3, color: "rgba(107, 114, 128, 1)", fontSize: "12px" }}>
        Pro-tip: The more specific you are, the better your candidate matches will be!
      </Typography>

      {/* Error message */}
      {error && (
        <Typography sx={{ mt: 2, color: "red", fontFamily: "Poppins", fontSize: "12px" }}>
          Please select at least one technology before continuing.
        </Typography>
      )}
    </Box>
  );
});

export default SkillsStack;
