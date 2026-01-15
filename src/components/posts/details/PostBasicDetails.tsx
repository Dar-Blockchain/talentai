import React from "react";
import { selectCurrentJob } from "@/store/slices/postSlice";
import {
  Box,
  Button,
  Typography,
  Divider,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { CalendarMonth, PlayArrow } from "@mui/icons-material";
import { useSelector } from "react-redux";
import Image from "next/image";
import {
  formatSalary,
  getLevelFromNumber,
  getPostSkills,
  getSoftSkillLevelLabel,
  Skill,
} from "@/utils/postHelpers";
import { formatDate } from "@/utils/functions";
import { SkillChip } from "../create/steps/post-details-step/PostPreview";
import DeletePostModal from "../delete/DeletePostModal";
import { useDeletePost } from "../delete/useDeletePost";
import { useToast } from "@/hooks/useToast";
import { RootState } from "@/store/store";

interface Props {
  canEdit: boolean;
  onEdit: () => void;
}

const PostBasicDetails: React.FC<Props> = ({ canEdit, onEdit }) => {
  const { showToast } = useToast();
  const job = useSelector(selectCurrentJob);
  const profile = useSelector(
    (state: RootState) => state.user.connectedUser.profile
  );

  const displaySkills = React.useMemo(() => getPostSkills(job), [job]);

  const deletePost = useDeletePost({
    postId: job?._id,
    redirectTo: "/dashboard/company",
    onSuccess: () =>
      showToast({
        message: "Post deleted successfully",
        severity: "success",
      }),
    onError: () => () =>
      showToast({
        message: "Failed to delete post",
        severity: "success",
      }),
  });

  const handlePassInterview = (jobId: string) => {
    if (typeof window !== "undefined") {
      window.open(
        `${window.location.origin}/interview/hr?jobId=${jobId}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

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
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
          {job?.status === "draft" && (
            <Chip
              label="📝 Draft"
              size="small"
              sx={{
                backgroundColor: "rgba(156, 163, 175, 0.1)",
                color: "#6B7280",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                border: "1px solid #9CA3AF",
              }}
            />
          )}{" "}
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* <Button
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
              </Button> */}
          {!canEdit && (
            <Tooltip
              title={
                profile.quota >= 5
                  ? "You’ve reached your monthly interview limit. Please try again next month."
                  : ""
              }
              disableHoverListener={profile.quota >= 5}
            >
              <Button
                variant="outlined"
                fullWidth
                // startIcon={<PlayArrow />}
                onClick={() => handlePassInterview(job?._id)}
                sx={{
                  borderColor: "rgba(16, 185, 129, 1)",
                  color: "rgba(16, 185, 129, 1)",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  borderRadius: "38px",
                  maxWidth: "250px",
                  height: "42px",
                  py: 1.25,
                  px: 3,
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  "&:hover": {
                    borderColor: "rgba(5, 150, 105, 1)",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                  },
                }}
              >
                Pass Interview
              </Button>
            </Tooltip>
          )}
          {/* <Divider
                orientation="vertical"
                sx={{ height: "35px", color: "rgba(84, 98, 116, 0.26)" }}
              /> */}
          {canEdit && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={onEdit}
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
                onClick={deletePost.handleOpen}
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
          )}
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
          {job?.jobDetails?.workMode && <Chip
            label={job?.jobDetails?.workMode}
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
          />}
          <Chip
            label={job?.jobDetails?.employmentType}
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
            label={formatSalary(job?.jobDetails?.salary)}
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
          <Chip
            label={formatDate(job?.createdAt)}
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
              <CalendarMonth
                sx={{
                  color: "rgba(95, 168, 211, 1)!important",
                  width: "16px",
                  height: "16px",
                }}
              />
            }
          />
        </Stack>
        {/* REQUIRED SKILLS */}
        <Box sx={{ mt: 2, width: "700px" }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(98, 111, 134, 1)",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: "42px",
            }}
          >
            Required Skills
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {displaySkills.map((skill: Skill, index: number) => {
              const level =
                skill.type === "soft"
                  ? getSoftSkillLevelLabel(Number(skill.level) || 1)
                  : getLevelFromNumber(skill.level || 1);
              const label = `${skill.name} (${level}) - ${skill.importance}%`;
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
              lineHeight: "42px",
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
              maxWidth: "600px",
            }}
          >
            {job?.jobDetails?.description}
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
            {job?.jobDetails?.requirements.map((req: string, index: number) => (
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
            {job?.jobDetails?.responsibilities.map(
              (req: string, index: number) => (
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
              )
            )}
          </List>
        </Box>
      </Box>
      <DeletePostModal
        open={deletePost.open}
        onClose={deletePost.handleClose}
        onDelete={deletePost.handleDelete}
        isDeleting={deletePost.isDeleting}
      />
    </Box>
  );
};

export default PostBasicDetails;
