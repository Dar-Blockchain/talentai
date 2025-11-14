"use client";
import { Box, Typography, TextField, MenuItem, Stack } from "@mui/material";
import { useState, forwardRef, useImperativeHandle } from "react";
import { usePreferences } from "../hooks/usePreferences";
import { contractTypes, currencies, genders, workModes } from "../data/candidateData";

type CandidateDetailsProps = {
  preferences: ReturnType<typeof usePreferences>;
};

const CandidateDetails = forwardRef(
  ({ preferences }: CandidateDetailsProps, ref) => {
    const { candidateDetails, updateCandidateDetail } = preferences;
    const [errors, setErrors] = useState<Record<string, string>>({});

    const sanitizeName = (value: string) =>
      value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, "").replace(/^\s+/, "");

    const handleChange =
      (field: keyof typeof candidateDetails) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value = e.target.value;

        if (field === "firstName" || field === "lastName")
          value = sanitizeName(value);
        if (field === "age") value = value.replace(/[^0-9]/g, "");
        if (field === "salaryMin" || field === "salaryMax")
          value = value.replace(/[^0-9]/g, "");

        updateCandidateDetail(field, value);
        setErrors((prev) => ({ ...prev, [field]: "" }));
      };

    const validateAll = (): boolean => {
      const newErrors: Record<string, string> = {};

      // Required fields
      if (!candidateDetails.firstName)
        newErrors.firstName = "First name required";
      if (!candidateDetails.lastName) newErrors.lastName = "Last name required";
      if (!candidateDetails.age || Number(candidateDetails.age) <= 0)
        newErrors.age = "Enter a valid age";
      if (!candidateDetails.gender) newErrors.gender = "Select your gender";
      if (!candidateDetails.educationLevel)
        newErrors.educationLevel = "Education level required";

      // Optional fields validation
      if (
        candidateDetails.salaryMin &&
        isNaN(Number(candidateDetails.salaryMin))
      )
        newErrors.salaryMin = "Enter a valid number";
      if (
        candidateDetails.salaryMax &&
        isNaN(Number(candidateDetails.salaryMax))
      )
        newErrors.salaryMax = "Enter a valid number";
      if (
        candidateDetails.salaryMin &&
        candidateDetails.salaryMax &&
        Number(candidateDetails.salaryMin) > Number(candidateDetails.salaryMax)
      )
        newErrors.salaryMax = "Max salary must be >= min salary";

      if (candidateDetails.location && candidateDetails.location.trim() === "")
        newErrors.location = "Enter a valid location";

      if (
        candidateDetails.salaryCurrency &&
        !currencies.includes(candidateDetails.salaryCurrency)
      )
        newErrors.salaryCurrency = "Select a valid currency";

      if (
        candidateDetails.preferredContractType &&
        !contractTypes.includes(candidateDetails.preferredContractType)
      )
        newErrors.preferredContractType = "Select a valid contract type";

      if (
        candidateDetails.workModePreference &&
        !workModes.includes(candidateDetails.workModePreference)
      )
        newErrors.workModePreference = "Select a valid work mode";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
      validate: validateAll,
    }));

    return (
      <Box sx={{ maxWidth: 900 }}>
        <Stack direction="row" flexWrap="wrap" spacing={2} useFlexGap>
          {/* First Name */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              First Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your first name"
              variant="outlined"
              value={candidateDetails.firstName}
              onChange={handleChange("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Box>

          {/* Last Name */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Last Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your last name"
              variant="outlined"
              value={candidateDetails.lastName}
              onChange={handleChange("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Box>

          {/* Age */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Age
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your age"
              variant="outlined"
              value={candidateDetails.age}
              onChange={handleChange("age")}
              error={!!errors.age}
              helperText={errors.age}
            />
          </Box>

          {/* Gender */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Gender
            </Typography>
            <TextField
              select
              fullWidth
              value={candidateDetails.gender}
              onChange={handleChange("gender")}
              variant="outlined"
              error={!!errors.gender}
              helperText={errors.gender}
            >
              <MenuItem disabled value="">
                Select your gender
              </MenuItem>
              {genders.map((gender) => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Education Level */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Education Level
            </Typography>
            <TextField
              fullWidth
              placeholder="Highest level of education"
              variant="outlined"
              value={candidateDetails.educationLevel}
              onChange={handleChange("educationLevel")}
              error={!!errors.educationLevel}
              helperText={
                errors.educationLevel || "e.g., Bachelor's, Master's, PhD"
              }
            />
          </Box>

          {/* Optional Fields Example: Salary, Location, Contract, Work Mode */}
          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Salary Expectation
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                value={candidateDetails.salaryCurrency || ""}
                onChange={(e) =>
                  updateCandidateDetail("salaryCurrency", e.target.value)
                }
                variant="outlined"
                sx={{ width: "60%" }}
                error={!!errors.salaryCurrency}
                helperText={errors.salaryCurrency}
              >
                <MenuItem disabled value="">
                  Currency
                </MenuItem>
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                placeholder="Min"
                value={candidateDetails.salaryMin || ""}
                onChange={handleChange("salaryMin")}
                error={!!errors.salaryMin}
                helperText={errors.salaryMin || "Minimum"}
              />
              <TextField
                fullWidth
                placeholder="Max"
                value={candidateDetails.salaryMax || ""}
                onChange={handleChange("salaryMax")}
                error={!!errors.salaryMax}
                helperText={errors.salaryMax || "Maximum"}
              />
            </Stack>
          </Box>

          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Location
            </Typography>
            <TextField
              fullWidth
              placeholder="Current location"
              variant="outlined"
              value={candidateDetails.location}
              onChange={handleChange("location")}
              error={!!errors.location}
              helperText={errors.location}
            />
          </Box>

          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Contract Type
            </Typography>
            <TextField
              select
              fullWidth
              value={candidateDetails.preferredContractType}
              onChange={handleChange("preferredContractType")}
              variant="outlined"
              error={!!errors.preferredContractType}
              helperText={errors.preferredContractType}
            >
              <MenuItem disabled value="">
                Select contract type
              </MenuItem>
              {contractTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ flex: "1 1 45%", minWidth: "300px" }}>
            <Typography sx={{ mb: 0.5, fontWeight: 500, fontSize: "14px" }}>
              Work Mode
            </Typography>
            <TextField
              select
              fullWidth
              value={candidateDetails.workModePreference}
              onChange={handleChange("workModePreference")}
              variant="outlined"
              error={!!errors.workModePreference}
              helperText={errors.workModePreference}
            >
              <MenuItem disabled value="">
                Select work mode
              </MenuItem>
              {workModes.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </Box>
    );
  }
);

export default CandidateDetails;
