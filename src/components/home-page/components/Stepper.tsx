import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MingcuteIcon from '@/components/icons/MingcuteIcon';
import EditIcon from '@/components/icons/EditIcon';
import CheckIcon from '@/components/icons/CheckIcon';

const steps = [
  {
    label: 'Describe the Role',
    description: 'Tell us what you need.',
  },
  {
    label: 'Let AI Evaluate',
    description: 'We screen, assess, and verify.',
  },
  {
    label: 'Hire with Confidence',
    description: 'You choose from proven talent.',
  },
];

const CustomConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 32,
  },
  [`& .${stepConnectorClasses.line}`]: {
    border: '7px solid',
    borderImageSource: 'linear-gradient(270deg, rgba(41, 210, 145, 0) -0.23%, rgba(41, 210, 145, 0.83) 48.27%, rgba(41, 210, 145, 0.18) 99.77%)',
    borderImageSlice: 1,
    borderRadius: 1,
  },
}));

const CustomStepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean, icon: any };
}>(({ ownerState }) => {
      const isCurrentStep = ownerState.icon === 2;
return ({
  background: isCurrentStep
    ? 'linear-gradient(100.42deg, rgba(41, 210, 145, 0.261) 16.09%, rgba(200, 214, 229, 0.603) 105.27%)'
    : '#fff',
  zIndex: 1,
  color: isCurrentStep ? '#fff' : 'rgba(41, 210, 145, 0.83)',
  width: "4rem",
  height: "4rem",
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 4px 30px 0px rgba(51, 51, 51, 0.1)',
  fontSize: 30,
  backdropFilter: "blur(15px)",
  transform: 'rotate(-10deg)'
})});

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, className, icon } = props;
  const icons: { [key: string]: React.ReactElement } = {
    1: <EditIcon />,
    2: <MingcuteIcon />,
    3: <CheckIcon />,
  };
  return (
    <CustomStepIconRoot ownerState={{ completed, active, icon }} className={className}>
      {icons[String(icon)]}
    </CustomStepIconRoot>
  );
}

export default function GradientStepper() {
  return (
    <Stepper activeStep={2} alternativeLabel connector={<CustomConnector />} sx={{mt: 6}}>
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel StepIconComponent={CustomStepIcon}>
            <Typography fontWeight="bold" sx={{color: '#000', transform: 'rotate(-10deg)'}}>
              {step.label}
            </Typography>
            <Typography sx={{color: '#000', transform: 'rotate(-10deg)'}}>
              {step.description}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
