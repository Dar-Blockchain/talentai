"use client";

import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  contractTypes,
  workModes,
} from "@/components/preferences/data/candidateData";
import SalaryRange from "./SalaryRange";
import {
  generatePost,
  setEmploymentType,
  setGenerationType,
  setPromptDescription,
  setWorkMode,
  updateSalaryField,
} from "@/store/slices/postGenerationSlice";
import { AppDispatch } from "@/store/store";

const inputStyle = {
  height: 40,
  "& .MuiInputBase-root": {
    height: 40,
  },
};

const PostDescription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    promptDescription,
    salary,
    workMode,
    employmentType,
    generationType,
  } = useSelector((state: any) => state.postGeneration);

  const handleDescription = (value: string) => {
    dispatch(setPromptDescription(value));
  };

  const handleSalaryChange = (
    field: "min" | "max" | "currency",
    value: number | string
  ) => {
    dispatch(updateSalaryField({ field, value }));
  };

  const handleGenerate = (type: "quick" | "detailed") => {
    dispatch(setGenerationType(type));

    dispatch(
      generatePost({
        jobDescription: promptDescription,
        type,
        salary,
        workMode,
        contractType: employmentType,
      })
    );
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", lg: "50%" },
        minHeight: { xs: "auto", lg: "100vh" },
        flexShrink: 0,
        overflow: "hidden",
        bgcolor: "rgba(255, 255, 255, 1)",
        p: { xs: 1, sm: 2, md: 3 },
        border: "1px solid rgba(238, 240, 242, 1)",
        borderTopLeftRadius: "12px",
        borderBottomLeftRadius: "12px",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(234, 255, 247, 1)",
            width: 45,
            height: 45,
            borderRadius: "5px",
          }}
        >
          <Image
            src="/icons/pencilFile.svg"
            alt="file"
            width={25}
            height={25}
          />
        </Box>

        <Box>
          <Typography
            sx={{
              color: "rgba(41, 210, 145, 1)",
              fontWeight: 600,
              fontSize: "20px",
            }}
          >
            Create Job Post
          </Typography>

          <Typography sx={{ fontSize: "12px", color: "#546274" }}>
            Describe your ideal candidate and generate a professional job
            posting
          </Typography>
        </Box>
      </Box>

      {/* DESCRIPTION */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Image src="/icons/magic.svg" width={20} height={20} alt="" />
          <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
            Generate Job Description
          </Typography>
        </Box>

        <Typography sx={{ fontSize: "12px", opacity: 0.6 }}>
          Provide a comprehensive description of the role…
        </Typography>

        <TextField
          value={promptDescription}
          onChange={(e) => handleDescription(e.target.value)}
          placeholder="Describe the role..."
          multiline
          minRows={10}
          fullWidth
          sx={{ mt: 2 }}
        />

        {/* SALARY */}
        <SalaryRange salaryRange={salary} onSalaryChange={handleSalaryChange} />

        {/* EMPLOYMENT + WORK MODE */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* Employment type */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "rgba(136, 151, 170, 1)",
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: 13,
              }}
            >
              {" "}
              <Image
                src="/icons/bag.svg"
                alt="money"
                width={20}
                height={20}
              />{" "}
              Employment Type{" "}
            </Typography>

            <TextField
              select
              value={employmentType}
              onChange={(e) => dispatch(setEmploymentType(e.target.value))}
              fullWidth
              sx={inputStyle}
            >
              <MenuItem disabled value="">
                Employment Type
              </MenuItem>

              {contractTypes.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Work mode */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "rgba(136, 151, 170, 1)",
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: 13,
              }}
            >
              {" "}
              <Image
                src="/icons/building3.svg"
                alt="money"
                width={20}
                height={20}
              />{" "}
              Work Mode{" "}
            </Typography>

            <TextField
              select
              value={workMode}
              onChange={(e) => dispatch(setWorkMode(e.target.value))}
              fullWidth
              sx={inputStyle}
            >
              <MenuItem disabled value="">
                Work Mode
              </MenuItem>

              {workModes.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleGenerate("quick")}
            startIcon={
              <Image
                src="/icons/lightning.svg"
                alt="lightning"
                width={16}
                height={16}
              />
            }
            sx={{
              flex: 1,
              backgroundColor: "rgba(77, 217, 163, 0.08)",
              color: "rgba(77, 217, 163, 1)",
              border: "1px solid rgba(77, 217, 163, 1)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              borderRadius: "38px",
              "&:hover": { backgroundColor: "rgba(77, 217, 163, 0.01)" },
              height: 42,
              px: 3,
            }}
          >
            {" "}
            Quick Generation{" "}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleGenerate("detailed")}
            startIcon={
              <Image
                src="/icons/humble.svg"
                alt="lightning"
                width={24}
                height={24}
              />
            }
            sx={{
              flex: 1,
              backgroundColor: "rgba(106, 127, 219, 0.08)",
              color: "rgba(106, 127, 219, 1)",
              border: "1px solid rgba(106, 127, 219, 1)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              borderRadius: "38px",
              "&:hover": { backgroundColor: "rgba(106, 127, 219, 0.01)" },
              height: 42,
              px: 3,
            }}
          >
            {" "}
            Detailed Generation{" "}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PostDescription;
