import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const GREEN_MAIN = "#00FF9D";

interface JobDetailsFormProps {
  editedJob: any;
  onInputChange: (field: string, value: any) => void;
}

const JobDetailsForm: React.FC<JobDetailsFormProps> = ({
  editedJob,
  onInputChange,
}) => {
  if (!editedJob || !editedJob.jobDetails) {
    return null;
  }

  const { jobDetails } = editedJob;
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    console.log(editedJob, "editedJob in JobDetailsForm");
  }, [editedJob]);

  const handleAddSkill = () => {
    if (newSkill.trim() === "") return;
    const updatedSkills = [...(jobDetails.requiredSkills || []), newSkill.trim()];
    onInputChange("requiredSkills", updatedSkills);
    setNewSkill("");
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    const updatedSkills = (jobDetails.requiredSkills || []).filter(
      (skill: string) => skill !== skillToDelete
    );
    onInputChange("requiredSkills", updatedSkills);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* LOCATION & WORK MODE */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {/* LOCATION INPUT */}
        <TextField
          fullWidth
          label="Location"
          value={jobDetails.location || ""}
          onChange={(e) => onInputChange("location", e.target.value)}
          placeholder="e.g., New York, USA"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon sx={{ color: GREEN_MAIN }} />
              </InputAdornment>
            ),
            sx: {
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
            },
          }}
          InputLabelProps={{
            sx: {
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
        />

        {/* WORK MODE SELECT */}
        <FormControl fullWidth>
          <InputLabel
            sx={{
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Work Mode
          </InputLabel>
          <Select
            value={jobDetails.workMode || ""}
            onChange={(e) => onInputChange("workMode", e.target.value)}
            label="Work Mode"
            startAdornment={
              <InputAdornment position="start">
                <HomeWorkIcon sx={{ color: GREEN_MAIN }} />
              </InputAdornment>
            }
            sx={{
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "& .MuiSelect-icon": {
                color: GREEN_MAIN,
              },
            }}
          >
            <MenuItem value="Remote">Remote</MenuItem>
            <MenuItem value="On-site">On-site</MenuItem>
            <MenuItem value="Hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* EMPLOYMENT TYPE & EXPERIENCE LEVEL */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {/* EMPLOYMENT TYPE */}
        <FormControl fullWidth>
          <InputLabel
            sx={{
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Employment Type
          </InputLabel>
          <Select
            value={jobDetails.employmentType || ""}
            onChange={(e) => onInputChange("employmentType", e.target.value)}
            label="Employment Type"
            startAdornment={
              <InputAdornment position="start">
                <WorkIcon sx={{ color: GREEN_MAIN }} />
              </InputAdornment>
            }
            sx={{
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "& .MuiSelect-icon": {
                color: GREEN_MAIN,
              },
            }}
          >
            <MenuItem value="Full-time">Full-time</MenuItem>
            <MenuItem value="Part-time">Part-time</MenuItem>
            <MenuItem value="Contract">Contract</MenuItem>
            <MenuItem value="Internship">Internship</MenuItem>
          </Select>
        </FormControl>

        {/* EXPERIENCE LEVEL */}
        <FormControl fullWidth>
          <InputLabel
            sx={{
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Experience Level
          </InputLabel>
          <Select
            value={jobDetails.experienceLevel || ""}
            onChange={(e) => onInputChange("experienceLevel", e.target.value)}
            label="Experience Level"
            startAdornment={
              <InputAdornment position="start">
                <TrendingUpIcon sx={{ color: GREEN_MAIN }} />
              </InputAdornment>
            }
            sx={{
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "& .MuiSelect-icon": {
                color: GREEN_MAIN,
              },
            }}
          >
            <MenuItem value="Entry Level">Entry Level</MenuItem>
            <MenuItem value="Mid Level">Mid Level</MenuItem>
            <MenuItem value="Senior Level">Senior Level</MenuItem>
            <MenuItem value="Lead">Lead</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* SALARY SECTION */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <FormControl sx={{ flex: 1, minWidth: 120 }}>
          <InputLabel
            sx={{
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Currency
          </InputLabel>
          <Select
            value={
              jobDetails?.salary?.currency === "USD"
                ? "$"
                : jobDetails?.salary?.currency === "EUR"
                ? "€"
                : jobDetails?.salary?.currency === "GBP"
                ? "£"
                : ""
            }
            onChange={(e) => {
              const symbol = e.target.value
              const currency =
                symbol === "$" ? "USD" : symbol === "€" ? "EUR" : "GBP"

              onInputChange("salary", {
                ...jobDetails.salary,
                currency,
              })
            }}
            label="Currency"
            startAdornment={
              <InputAdornment position="start">
                <AttachMoneyIcon sx={{ color: GREEN_MAIN }} />
              </InputAdornment>
            }
            sx={{
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "& .MuiSelect-icon": {
                color: GREEN_MAIN,
              },
            }}
          >
            <MenuItem value="$">$ (USD)</MenuItem>
            <MenuItem value="€">€ (EUR)</MenuItem>
            <MenuItem value="£">£ (GBP)</MenuItem>
          </Select>
        </FormControl>


        <TextField
          sx={{ flex: 2 }}
          label="Minimum Salary"
          type="number"
          value={jobDetails.salary.min || ""}
          onChange={(e) =>
            onInputChange("salary", {
              ...jobDetails.salary,
              min: Number(e.target.value) || 0,
            })
          }
          InputLabelProps={{
            sx: {
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
          InputProps={{
            sx: {
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
            },
          }}
        />

        <TextField
          sx={{ flex: 2 }}
          label="Maximum Salary"
          type="number"
          value={jobDetails.salary.max || ""}
          onChange={(e) =>
            onInputChange("salary", {
              ...jobDetails.salary,
              max: Number(e.target.value) || 0,
            })
          }
          InputLabelProps={{
            sx: {
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
          InputProps={{
            sx: {
              color: "#0F172A",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: GREEN_MAIN,
                borderWidth: "2px",
              },
            },
          }}
        />
      </Box>

      {/* EXPERIENCE LEVEL */}
      <FormControl fullWidth>
        <InputLabel
          sx={{
            color: GREEN_MAIN,
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          Experience Level
        </InputLabel>
        <Select
          value={jobDetails.experienceLevel || ""}
          onChange={(e) => onInputChange("experienceLevel", e.target.value)}
          label="Experience Level"
          startAdornment={
            <InputAdornment position="start">
              <TrendingUpIcon sx={{ color: GREEN_MAIN }} />
            </InputAdornment>
          }
          sx={{
            color: "#0F172A",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: GREEN_MAIN,
              borderWidth: "2px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: GREEN_MAIN,
              borderWidth: "2px",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: GREEN_MAIN,
              borderWidth: "2px",
            },
            "& .MuiSelect-icon": {
              color: GREEN_MAIN,
            },
          }}
        >
          <MenuItem value="Internship">Internship</MenuItem>
          <MenuItem value="Junior">Junior</MenuItem>
          <MenuItem value="Mid-level">Mid-level</MenuItem>
          <MenuItem value="Senior">Senior</MenuItem>
          <MenuItem value="Lead">Lead</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default JobDetailsForm;
