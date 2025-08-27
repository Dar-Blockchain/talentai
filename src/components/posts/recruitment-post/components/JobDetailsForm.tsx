import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          fullWidth
          label="Location"
          value={editedJob.jobDetails.location}
          onChange={(e) => onInputChange("location", e.target.value)}
          InputLabelProps={{
            sx: {
              color: GREEN_MAIN,
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
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
        />
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
            value={editedJob.jobDetails.employmentType}
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
            <MenuItem value="Freelance">Freelance</MenuItem>
          </Select>
        </FormControl>
      </Box>
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
            value={editedJob.jobDetails.salary.currency}
            onChange={(e) =>
              onInputChange("salary", {
                ...editedJob.jobDetails.salary,
                currency: e.target.value,
              })
            }
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
          value={editedJob.jobDetails.salary.min}
          onChange={(e) =>
            onInputChange("salary", {
              ...editedJob.jobDetails.salary,
              min: parseInt(e.target.value) || 0,
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
          value={editedJob.jobDetails.salary.max}
          onChange={(e) =>
            onInputChange("salary", {
              ...editedJob.jobDetails.salary,
              max: parseInt(e.target.value) || 0,
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
      <TextField
        fullWidth
        label="Experience Level"
        value={editedJob.jobDetails.experienceLevel}
        onChange={(e) => onInputChange("experienceLevel", e.target.value)}
        InputLabelProps={{
          sx: {
            color: GREEN_MAIN,
            fontSize: "1rem",
            fontWeight: 600,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TrendingUpIcon sx={{ color: GREEN_MAIN }} />
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
      />
    </Box>
  );
};

export default JobDetailsForm;