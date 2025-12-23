import React, { useEffect } from "react";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import {
  fetchJobById,
  selectCurrentJob,
  selectCurrentJobError,
  selectCurrentJobLoading,
} from "@/store/slices/postSlice";
import {
  Box,
  Button,
  Container,
  Typography,
  Divider,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import HeaderDashboard from "@/components/HeaderDashboard";
import { ArrowBack } from "@mui/icons-material";
import { useSelector } from "react-redux";
import Image from "next/image";
import { formatSalary, getLevelFromNumber } from "@/utils/postHelpers";
import { formatDate } from "@/utils/functions";
import { getJobTypeColor, getJobTypeTextColor } from "@/utils/jobHelpers";
import {
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { SkillChip } from "../create/steps/post-details-step/PostPreview";
import { HardSkill, SoftSkill } from "@/store/slices/postGenerationSlice";

const PostBasicDetails: React.FC = () => {
  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);
  const hardSkills = job?.skillAnalysis?.requiredSkills || [];
  const softSkills = job?.skillAnalysis?.softSkills || [];
  if (!job) return;
  return (
    <Box
      sx={{
        border: "1px solid rgba(98, 111, 134, 0.18)",
        backgroundColor: "rgba(253, 253, 253, 1)",
        borderRadius: "12px",
        px: 2,
        py: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            position: "relative",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "35px",
            color: "rgba(23, 43, 77, 1)",
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "38px",
              height: "5px",
              backgroundColor: "rgba(41, 210, 145, 0.83)",
              borderRadius: "2px",
            },
          }}
        >
          {job?.jobDetails?.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={
              <Image
                src="/icons/linkedin.svg"
                alt="linkedin"
                width={20}
                height={20}
              />
            }
            sx={{
              color: "white",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              py: 1.25,
              borderRadius: "38px",
              width: "180px",
              height: "42px",
              backgroundColor: "rgba(0, 118, 178, 1)",
              "&:hover": {
                backgroundColor: "rgba(0, 118, 178, 0.8)",
              },
            }}
          >
            Share Post
          </Button>
          <Divider
            orientation="vertical"
            sx={{ height: "35px", color: "rgba(84, 98, 116, 0.26)" }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={
                <Image
                  src="/icons/edit.svg"
                  alt="edit"
                  width={20}
                  height={20}
                />
              }
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "13px",
                py: 1.25,
                borderRadius: "38px",
                width: "180px",
                height: "42px",
                backgroundColor: "rgba(241, 252, 248, 1)",
                borderColor: "rgba(77, 217, 163, 1)",
                color: "rgba(77, 217, 163, 1)",
                "&:hover": {
                  borderColor: "rgba(77, 217, 163, 1)",
                  backgroundColor: "rgba(241, 252, 248, 0.8)",
                },
              }}
            >
              Edit Details
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={
                <Image
                  src="/icons/delete.svg"
                  alt="search"
                  width={18}
                  height={18}
                />
              }
              // onClick={() => onDeleteJob(job._id)}
              sx={{
                borderColor: "rgba(224, 62, 92, 1)",
                color: "rgba(224, 62, 92, 1)",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "13px",
                py: 1.25,
                borderRadius: "38px",
                width: "180px",
                height: "42px",
                backgroundColor: "rgba(224, 62, 92, 0.08)",
                "&:hover": {
                  borderColor: "rgba(224, 62, 92, 1)",
                  backgroundColor: "rgba(224, 62, 92, 0.04)",
                },
              }}
            >
              Delete Job
            </Button>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h5"
          sx={{
            position: "relative",
            fontWeight: 500,
            fontSize: "15px",
            lineHeight: "42px",
            color: "rgba(98, 111, 134, 1)",
          }}
        >
          Job Details
        </Typography>

        {/* Job Tags */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          <Chip
            label={job.jobDetails.location}
            size="small"
            sx={{
              backgroundColor: "rgba(95, 168, 211, 0.1)",
              color: "rgba(84, 98, 116, 1)",
              fontWeight: 500,
              fontSize: "0.75rem",
              height: 24,
              border: "0.25px solid rgba(95, 168, 211, 1)",
            }}
            icon={
              <Image
                src="/icons/location2.svg"
                alt="location"
                width={13}
                height={13}
              />
            }
          />
          <Chip
            label={job.jobDetails.employmentType}
            size="small"
            sx={{
              backgroundColor: "rgba(95, 168, 211, 0.1)",
              color: "rgba(84, 98, 116, 1)",
              fontWeight: 500,
              fontSize: "0.75rem",
              height: 24,
              border: "0.25px solid rgba(95, 168, 211, 1)",
            }}
            icon={
              <Image
                src="/icons/suitcase.svg"
                alt="employment type"
                width={13}
                height={13}
              />
            }
          />
          <Chip
            label={formatSalary(job.jobDetails.salary)}
            size="small"
            sx={{
              backgroundColor: "rgba(95, 168, 211, 0.1)",
              color: "rgba(84, 98, 116, 1)",
              fontWeight: 500,
              fontSize: "0.75rem",
              height: 24,
              border: "0.25px solid rgba(95, 168, 211, 1)",
            }}
            icon={
              <Image
                src="/icons/dollar.svg"
                alt="salary"
                width={13}
                height={13}
              />
            }
          />
        </Stack>
        {/* REQUIRED SKILLS */}
        <Box sx={{ mt: 2, width: '700px' }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: '42px'
            }}
          >
            Required Skills
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {hardSkills.map((skill: HardSkill, index: number) => {
              const label = `${skill.name} (${getLevelFromNumber(
                skill.level
              )}) - ${skill.percentage}%`;
              return <SkillChip key={index} label={label} />;
            })}
            {softSkills.map((skill: SoftSkill, index: number) => {
              const label = `${skill.name} (${skill.level}/5) - ${skill.percentage}%`;

              return <SkillChip key={index} label={label} />;
            })}
          </Box>
        </Box>

        {/* DESCRIPTION */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: '42px'
            }}
          >
            Description
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(0, 0, 0, 1)",
              fontSize: "12px",
              fontWeight: 400,
              maxWidth: '600px'
            }}
          >
            {job.jobDetails.description}
          </Typography>
        </Box>

        {/* REQUIREMENTS */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            Requirements
          </Typography>
            <List
              sx={{
                ml: 0.75,
                maxWidth: "600px",
                pl: 2,
                listStyleType: "disc",
                "& .MuiListItem-root": {
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              }}
            >
  {job.jobDetails.requirements.map((req: string, index: number) => (
    <ListItem
      key={index}
      sx={{
        display: "list-item",
        pl: 0,
      }}
    >
      <ListItemText
        primary={req}
        sx={{ m: 0 }}
        primaryTypographyProps={{
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "18px",
          color: "rgba(0, 0, 0, 1)",
        }}
      />
    </ListItem>
  ))}
</List>


        </Box>
        {/* RESPONSIBILIES */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            Responsibilities
          </Typography>
                      <List
              sx={{
                ml: 0.75,
                maxWidth: "600px",
                pl: 2,
                listStyleType: "disc",
                "& .MuiListItem-root": {
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              }}
            >
  {job.jobDetails.responsibilities.map((req: string, index: number) => (
    <ListItem
      key={index}
      sx={{
        display: "list-item",
        pl: 0,
      }}
    >
      <ListItemText
        primary={req}
        sx={{ m: 0 }}
        primaryTypographyProps={{
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "18px",
          color: "rgba(0, 0, 0, 1)",
        }}
      />
    </ListItem>
  ))}
</List>
        </Box>
      </Box>
    </Box>
  );
};

export default PostBasicDetails;
