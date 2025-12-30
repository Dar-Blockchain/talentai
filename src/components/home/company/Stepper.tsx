import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@/components/icons/EditIcon";
import MingcuteIcon from "@/components/icons/MingcuteIcon";
import CheckIcon from "@/components/icons/CheckIcon";

const steps = [
  {
    label: "Build Your Pipeline",
    description:
      "Select assessment modules. Customize pass/fail thresholds. Launch in 30 minutes.",
  },
  {
    label: " AI Agents Interview Candidates",
    description:
      "Conversational agents evaluate technical skills, soft skills, and cultural fit through natural dialogue.",
  },
  {
    label: "Review & Hire",
    description:
      "AI automatically ranks candidates. Blockchain verifies credentials. You approve the best fit.",
  },
];

// ---------- Custom Step Icon ----------
const CustomStepIconRoot = styled("div")<{
  ownerState: {
    active?: boolean;
    completed?: boolean;
    icon: any;
    horizontal: boolean;
  };
}>(({ ownerState }) => {
  const isCurrentStep = ownerState.icon === 2;
  return {
    background: isCurrentStep
      ? "linear-gradient(100.42deg, rgba(41, 210, 145, 0.261) 16.09%, rgba(200, 214, 229, 0.603) 105.27%)"
      : "#fff",
    zIndex: 1,
    width: "4rem",
    height: "4rem",
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 30px 0px rgba(51, 51, 51, 0.1)",
    fontSize: 30,
    backdropFilter: "blur(15px)",
  };
});

function CustomStepIcon(props: StepIconProps & { horizontal?: boolean }) {
  const { completed, className, icon } = props;
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isHorizontal = isMdUp;

  const icons: { [key: string]: React.ReactElement } = {
    1: <EditIcon />,
    2: <MingcuteIcon />,
    3: <CheckIcon />,
  };

  return (
    <CustomStepIconRoot
      ownerState={{ completed, icon, horizontal: isHorizontal }}
      className={className}
    >
      {icons[String(icon)]}
    </CustomStepIconRoot>
  );
}

// ---------- Connector ----------
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: "25px",
  },
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.horizontal} .${stepConnectorClasses.line}`]: {
    height: "10px",
    border: 0,
    background:
      "linear-gradient(270deg, rgba(41, 210, 145, 0) -0.23%, rgba(41, 210, 145, 0.83) 48.27%, rgba(41, 210, 145, 0.18) 99.77%)",
    borderRadius: 2,
  },
  [`&.${stepConnectorClasses.vertical} .${stepConnectorClasses.line}`]: {
    width: "10px",
    border: 0,
    height: "40px",
    background:
      "linear-gradient(270deg, rgba(41, 210, 145, 0) 0%, rgba(41, 210, 145, 0.83) 50%, rgba(41, 210, 145, 0.18) 100%)",
    borderRadius: 2,
  },
}));

// ---------- Main Component ----------
export default function GradientStepper() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const orientation = isMdUp ? "horizontal" : "vertical";
  const isHorizontal = orientation === "horizontal";

  return (
    <Stepper
      activeStep={2}
      connector={<CustomConnector />}
      alternativeLabel={isHorizontal}
      sx={{ mt: { xs: 0, sm: 0, md: 6 }, px: 0, ml: 0 }}
    >
      {steps.map((step) => (
        <Step key={step.label}>
          <StepLabel
            StepIconComponent={(props) => (
              <CustomStepIcon {...props} horizontal={isHorizontal} />
            )}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                fontWeight="bold"
                sx={{
                  color: "#000",
                  maxWidth: 200,
                  textAlign: "center",
                  mb: 1.5,
                }}
              >
                {step.label}
              </Typography>
              <Typography
                sx={{ color: "#000", maxWidth: 200, textAlign: "center" }}
              >
                {step.description}
              </Typography>
            </Box>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}