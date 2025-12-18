import { Box, MenuItem, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import InputAdornment from "@mui/material/InputAdornment";
import {
  contractTypes,
  workModes,
} from "@/components/preferences/data/candidateData";
import SalaryRange from "./SalaryRange";
import { updateJobField } from "@/store/slices/postGenerationSlice";
import { updateJobDetails, updateLinkedinPost } from "@/store/slices/manualPostSlice";
import { useEffect } from "react";

const inputStyle = {
  height: 40,
  "& .MuiInputBase-root": {
    height: 40,
    fontSize: "12px",
    fontWeight: 500,
  },
};

const ManualPostForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const manualPost = useSelector((state: any) => state.manualPost);
  const {
    jobDetails: { title, employmentType, location, workMode, salary },
  } = manualPost;

  const handleSalaryChange = (
    field: "min" | "max" | "currency",
    value: number | string
  ) => {
    dispatch(
      updateJobDetails({
        salary: {
          ...salary,
          [field]: value,
        },
      })
    );
  };

  useEffect(() => {
    dispatch(
      updateJobDetails({
        field: "description",
        value: `${title} - ${employmentType} position. ${workMode} work arrangement. Competitive salary package offered.`,
      })
    );
    dispatch(
      updateLinkedinPost({
          formattedContent: {
            headline: `We're Hiring: ${title}`,
            introduction: `Exciting opportunity for a ${title}`,
            companyPitch: "Join our innovative team",
            roleOverview: `As a ${title}, you'll be at the heart of our team`,
            keyPoints: [
              `${workMode} work`,
              `${employmentType} position`,
              `Salary: ${salary?.currency}${salary?.min?.toLocaleString()} - ${
                salary?.currency
              }${salary?.max?.toLocaleString()}`,
            ],
            skillsRequired: "To be defined in recruitment pipeline",
            benefitsSection: "Competitive salary and benefits package",
            callToAction: "Apply now to join our team!",
          },
          hashtags: ["#Hiring", "#JobOpening", `#${title.replace(/\s+/g, "")}`],
          formatting: {
            emojis: {
              company: "🏢",
              location: "📍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨",
            },
          },
          finalPost: `We're Hiring: ${title}\n\n${workMode} | ${employmentType}\nSalary: ${
            salary?.currency
          }${salary?.min?.toLocaleString()} - ${
            salary?.currency
          }${salary?.max?.toLocaleString()}`,
        },
      )
    );
  }, [title, employmentType, workMode, salary]);

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        boxShadow: "0px 0px 6px rgba(0,0,0,0.06)",
        bgcolor: "rgba(253, 255, 255, 1)",
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
      }}
    >
      <Box>
        <Typography
          sx={{
            mb: 0.5,
            color: "rgba(84, 98, 116, 1)",
            fontWeight: 600,
            fontSize: "20px",
          }}
        >
          Job Details
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              lineHeight: "42px",
              fontWeight: 500,
              fontSize: "12px",
              color: "rgba(84, 98, 116, 0.53)",
            }}
          >
            Job Title
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={title || ""}
            onChange={(e: any) =>
              dispatch(
                updateJobField({ field: "title", value: e.target.value })
              )
            }
            sx={inputStyle}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              lineHeight: "42px",
              fontWeight: 500,
              fontSize: "12px",
              color: "rgba(84, 98, 116, 0.53)",
            }}
          >
            Work Mode
          </Typography>

          <TextField
            select
            value={location}
            onChange={(e: any) =>
              dispatch(
                updateJobField({
                  field: "location",
                  value: e.target.value,
                })
              )
            }
            fullWidth
            sx={inputStyle}
            FormHelperTextProps={{
              sx: {
                marginLeft: 0,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Image
                    src="/icons/building3.svg"
                    alt="money"
                    width={16}
                    height={16}
                  />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem
              disabled
              value=""
              sx={{ fontSize: "12px", fontWeight: 500 }}
            >
              Work Mode
            </MenuItem>

            {workModes.map((mode) => (
              <MenuItem
                key={mode}
                value={mode}
                sx={{ fontSize: "12px", fontWeight: 500 }}
              >
                {mode}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                lineHeight: "42px",
                fontWeight: 500,
                fontSize: "12px",
                color: "rgba(84, 98, 116, 0.53)",
              }}
            >
              Employment Type
            </Typography>

            <TextField
              select
              value={employmentType}
              onChange={(e: any) =>
                dispatch(
                  updateJobField({
                    field: "employmentType",
                    value: e.target.value,
                  })
                )
              }
              fullWidth
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image
                      src="/icons/bag.svg"
                      alt="money"
                      width={16}
                      height={16}
                    />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                },
              }}
            >
              <MenuItem
                disabled
                value=""
                sx={{ fontSize: "12px", fontWeight: 500 }}
              >
                Employment Type
              </MenuItem>

              {contractTypes.map((mode) => (
                <MenuItem
                  key={mode}
                  value={mode}
                  sx={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        <SalaryRange salaryRange={salary} onSalaryChange={handleSalaryChange} />
      </Box>
    </Box>
  );
};

export default ManualPostForm;