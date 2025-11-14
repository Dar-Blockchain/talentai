"use client";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack } from "@mui/material";
import { companySizes, industries, locations } from "../data/companyData";

type CompanyDetailsProps = {
  preferences: ReturnType<
    typeof import("../hooks/usePreferences").usePreferences
  >;
};

const CompanyDetails = forwardRef(({ preferences }: CompanyDetailsProps, ref) => {
  const { companyDetails, setCompanyDetails } = preferences;

  const [errors, setErrors] = useState<{
    name?: boolean;
    industry?: boolean;
    size?: boolean;
    location?: boolean;
  }>({});

  const handleChange = (field: string, value: string) => {
    setCompanyDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      const newErrors: typeof errors = {
        name: !companyDetails.name,
        industry: !companyDetails.industry,
        size: !companyDetails.size,
        location: !companyDetails.location,
      };
      setErrors(newErrors);
      return !Object.values(newErrors).some(Boolean);
    },
  }));

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mb: 2, width: "100%" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "rgba(0, 0, 0, 1)", fontWeight: 600, fontSize: "18px", lineHeight: "42.99px" }}
        >
          Let's get to know you.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "rgba(0, 0, 0, 1)", fontWeight: 400, fontSize: "16px", lineHeight: "25px", textAlign: "left" }}
        >
          This information helps us find candidates who are a great fit for your team.
        </Typography>
      </Box>

      {/* Form */}
      <Box
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(209, 213, 219, 1)" },
            "&:hover fieldset": { borderColor: "rgba(209, 213, 219, 1)" },
            "&.Mui-focused fieldset": { borderColor: "rgba(209, 213, 219, 1)" },
          },
          "& .MuiInputBase-input::placeholder": { color: "rgba(156, 163, 175, 1)", opacity: 1 },
          "& .MuiFormHelperText-root": { marginLeft: 0, fontSize: "12px" },
        }}
      >
        <Stack direction="column" spacing={3} sx={{ width: "100%" }}>
          {/* Company Name */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Company Name
            </Typography>
            <TextField
              fullWidth
              value={companyDetails.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your company name"
              variant="outlined"
              error={errors.name}
              helperText={errors.name && "Company name is required"}
            />
          </Box>

          {/* Industry */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Industry
            </Typography>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={companyDetails.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              error={errors.industry}
              helperText={errors.industry && "Industry is required"}
            >
              <MenuItem disabled value="">
                What's your industry
              </MenuItem>
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Company Size */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Company Size
            </Typography>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={companyDetails.size}
              onChange={(e) => handleChange("size", e.target.value)}
              error={errors.size}
              helperText={errors.size && "Company size is required"}
            >
              <MenuItem disabled value="">
                Select company size
              </MenuItem>
              {companySizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Location */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Location
            </Typography>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={companyDetails.location}
              onChange={(e) => handleChange("location", e.target.value)}
              error={errors.location}
              helperText={errors.location && "Location is required"}
            >
              <MenuItem disabled value="">
                Where is your company located?
              </MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
});

export default CompanyDetails;
