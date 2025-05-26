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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MingcuteIcon from "@/components/icons/MingcuteIcon";
import EditIcon from "@/components/icons/EditIcon";
import CheckIcon from "@/components/icons/CheckIcon";

const steps = [
  {
    label: "Describe the Role",
    description: "Tell us what you need.",
  },
  {
    label: "Let AI Evaluate",
    description: "We screen, assess, and verify.",
  },
  {
    label: "Hire with Confidence",
    description: "You choose from proven talent.",
  },
];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: '25px',
  },
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  // Horizontal line styles
  [`&.${stepConnectorClasses.horizontal} .${stepConnectorClasses.line}`]: {
    height: '10px',
    border: 0,
    background:
      "linear-gradient(270deg, rgba(41, 210, 145, 0) -0.23%, rgba(41, 210, 145, 0.83) 48.27%, rgba(41, 210, 145, 0.18) 99.77%)",
    borderRadius: 2,
  },

  // Vertical line styles
  [`&.${stepConnectorClasses.vertical} .${stepConnectorClasses.line}`]: {
    width: '10px',
    border: 0,
    height: '40px',
    // height: "100%",
    background:
      "linear-gradient(270deg, rgba(41, 210, 145, 0) 0%, rgba(41, 210, 145, 0.83) 50%, rgba(41, 210, 145, 0.18) 100%)",
    borderRadius: 2,
  },
}));


const CustomStepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean; icon: any; horizontal: boolean };
}>(({ ownerState }) => {
  const isCurrentStep = ownerState.icon === 2;
  return {
    background: isCurrentStep
      ? "linear-gradient(100.42deg, rgba(41, 210, 145, 0.261) 16.09%, rgba(200, 214, 229, 0.603) 105.27%)"
      : "#fff",
    zIndex: 1,
    color: isCurrentStep ? "#fff" : "rgba(41, 210, 145, 0.83)",
    width: "4rem",
    height: "4rem",
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 30px 0px rgba(51, 51, 51, 0.1)",
    fontSize: 30,
    backdropFilter: "blur(15px)",
    transform: ownerState.horizontal ? "rotate(-10deg)" : "none",
  };
});

function CustomStepIcon(props: StepIconProps & { horizontal?: boolean }) {
  const { active, completed, className, icon } = props;
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isHorizontal = isMdUp; // horizontal only on md and up

  const icons: { [key: string]: React.ReactElement } = {
    1: <EditIcon />,
    2: <MingcuteIcon />,
    3: <CheckIcon />,
  };
  return (
    <CustomStepIconRoot
      ownerState={{ completed, active, icon, horizontal: isHorizontal }}
      className={className}
    >
      {icons[String(icon)]}
    </CustomStepIconRoot>
  );
}

export default function GradientStepper() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const orientation = isMdUp ? "horizontal" : "vertical";
  const isHorizontal = orientation === "horizontal";

  return (
    <Stepper
      activeStep={2}
      orientation={orientation}
      connector={<CustomConnector />}
      alternativeLabel={isHorizontal}
      sx={{ mt: { xs: 0, sm: 0, md: 6 }, px: isHorizontal ? 0 : 0, ml: 0 }}
    >
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel StepIconComponent={(props) => <CustomStepIcon {...props} horizontal={isHorizontal} />}>
            <Typography
              fontWeight="bold"
              sx={{ color: "#000", transform: isHorizontal ? "rotate(-10deg)" : "none" }}
            >
              {step.label}
            </Typography>
            <Typography sx={{ color: "#000", transform: isHorizontal ? "rotate(-10deg)" : "none" }}>
              {step.description}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
