import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentJob } from "@/store/slices/postSlice";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Stack,
  Box,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "next/image";
import EditRecruitmentFlow from "../edit/EditRecruitmentFlow";

/* ============================
   Types
============================ */

type Step = {
  id: string;
  order: number;
  status: string;
  data: {
    label: string;
    type: string;
    subtitle?: string;
    config?: Record<string, any>;
  };
};

/* ============================
   Styles
============================ */

const accordionSx = {
  borderRadius: "12px",
  border: "1px solid rgba(98,111,134,0.12)",
  boxShadow: "none",
  "&:before": { display: "none" },
};

const tagSx = {
  fontSize: 12,
  height: 26,
  borderRadius: "6px",
  backgroundColor: "rgba(98,111,134,0.08)",
};

/* ============================
   Reusable Components
============================ */

const Tag = ({ label }: { label: string }) => (
  <Chip label={label} size="small" sx={tagSx} />
);

const ConfigSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Stack spacing={0.5}>
    <Typography
      variant="caption"
      fontWeight={600}
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}
    >
      {title}
    </Typography>

    <Stack direction="row" spacing={0.75} flexWrap="wrap">
      {children}
    </Stack>
  </Stack>
);

/* ============================
   Main Component
============================ */

const RecruitmentFlowDetails: React.FC = () => {
  const job = useSelector(selectCurrentJob);
  const [editMode, setEditMode] = useState(false);

  if (!job?.post_Steps?.length) return null;

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
      {editMode && <EditRecruitmentFlow onCancel={() => setEditMode(false)}/>}
      {!editMode && <><Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
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
          Recruitment Flow
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setEditMode(true)}
          startIcon={
            <Image src="/icons/edit.svg" alt="edit" width={20} height={20} />
          }
          sx={{
            textTransform: "none",
            fontWeight: 500,
            fontSize: "13px",
            py: 1.25,
            borderRadius: "38px",
            width: "230px",
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
          Edit Recruitment Flow
        </Button>
      </Box>
      <PipelineStepsAccordion steps={job.post_Steps} />
      </>}
    </Box>
  );
};

export default RecruitmentFlowDetails;

/* ============================
   Pipeline Steps Accordion
============================ */

function PipelineStepsAccordion({ steps }: { steps: Step[] }) {
  const sortedSteps = React.useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps]
  );

  return (
    <Stack spacing={1.5}>
      {sortedSteps.map((step) => {
        const config = step.data.config ?? {};

        return (
          <Accordion key={step.id} defaultExpanded={false} sx={accordionSx}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderRadius: "12px" }}
            >
              <Stack spacing={0.3}>
                <Typography fontWeight={600} fontSize={14}>
                  Step {step.order + 1} · {step.data.label}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {step.data.type.toUpperCase()} · {step.status.toUpperCase()}
                </Typography>
              </Stack>
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={2}>
                {/* Assessment */}
                {(config.assessmentLevel || config.passThreshold) && (
                  <ConfigSection title="Assessment">
                    {config.assessmentLevel && (
                      <Tag label={`Level · ${config.assessmentLevel}`} />
                    )}
                    {config.passThreshold && (
                      <Tag label={`Pass ≥ ${config.passThreshold}%`} />
                    )}
                  </ConfigSection>
                )}

                {/* Technical Skills */}
                {Array.isArray(config.skills) && config.skills.length > 0 && (
                  <ConfigSection title="Technical skills">
                    {config.skills.map((skill: any, i: number) => (
                      <Tag
                        key={i}
                        label={
                          skill.requiredLevel
                            ? `${skill.name} · L${skill.requiredLevel}`
                            : skill.name
                        }
                      />
                    ))}
                  </ConfigSection>
                )}

                {/* Soft Skills */}
                {Array.isArray(config.softSkills) &&
                  config.softSkills.length > 0 && (
                    <ConfigSection title="Soft skills">
                      {config.softSkills.map((skill: string, i: number) => (
                        <Tag key={i} label={skill} />
                      ))}
                    </ConfigSection>
                  )}

                {/* Categories */}
                {Array.isArray(config.categories) &&
                  config.categories.length > 0 && (
                    <ConfigSection title="Categories">
                      {config.categories.map((c: string, i: number) => (
                        <Tag key={i} label={c} />
                      ))}
                    </ConfigSection>
                  )}

                {/* Interview */}
                {(config.interviewMode || config.focusAreas) && (
                  <ConfigSection title="Interview">
                    {config.interviewMode && (
                      <Tag label={`Mode · ${config.interviewMode}`} />
                    )}
                    {config.focusAreas?.map((area: string, i: number) => (
                      <Tag key={i} label={area.replace("_", " ")} />
                    ))}
                  </ConfigSection>
                )}

                {/* Email */}
                {step.data.type === "email" && (
                  <ConfigSection title="Email">
                    {config.emailType && (
                      <Tag label={`Type · ${config.emailType}`} />
                    )}
                    {config.sendTo && <Tag label={`To · ${config.sendTo}`} />}
                    {config.subject && (
                      <Tag label={`Subject · ${config.subject}`} />
                    )}
                  </ConfigSection>
                )}

                {/* Task */}
                {step.data.type === "task" && (
                  <ConfigSection title="Task">
                    {config.taskTitle && <Tag label={config.taskTitle} />}
                    {config.deliverableType && (
                      <Tag label={`Deliverable · ${config.deliverableType}`} />
                    )}
                  </ConfigSection>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
