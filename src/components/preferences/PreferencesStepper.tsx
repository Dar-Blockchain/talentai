import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import CodeIcon from '@mui/icons-material/Code';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PersonIcon from '@mui/icons-material/Person';
import BugReportIcon from '@mui/icons-material/BugReport';

interface PreferencesStepperProps {
  steps: string[];
  activeStep: number;
  userType: string;
}

// Extended StepIconProps to include userType
interface CustomStepIconProps extends StepIconProps {
  userType: string;
}

/**
 * Custom step icon component that displays different icons based on user type and step
 */
function ColorlibStepIcon(props: CustomStepIconProps) {
  const { active, completed, icon, userType } = props;
  
  // Company flow icons
  const companyIcons: Record<string, React.ReactElement> = {
    1: <BusinessIcon />,        // Company Details
    2: <DesignServicesIcon />,  // Required Skills
    3: <AnalyticsIcon />,       // Experience Level
    4: <CheckCircleIcon />      // Review
  };
  
  // Candidate flow icons
  const candidateIcons: Record<string, React.ReactElement> = {
    1: <PersonIcon />,          // Personal Details
    2: <CodeIcon />,            // Select Skills
    3: <BugReportIcon />,       // Hedera QCM (if applicable)
    4: <StarIcon />,            // Rate Proficiency
    5: <CheckCircleIcon />      // Review
  };
  
  // Select type icon (initial step)
  const selectTypeIcon = <BusinessIcon />;
  
  const icons = userType === 'company' ? companyIcons : candidateIcons;
  
  const bg = active || completed
    ? userType === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF'
    : 'black';
    
  return (
    <Box sx={{
      background: bg,
      color: '#fff',
      width: 50,
      height: 50,
      display: 'flex',
      borderRadius: '50%',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: active ? '0 4px 10px rgba(0,0,0,0.25)' : 'none',
      zIndex: 1,
    }}>
      {icons[String(icon)] || selectTypeIcon}
    </Box>
  );
}

/**
 * Preferences stepper component that shows the current step in the preferences flow
 */
const PreferencesStepper = ({ steps, activeStep, userType }: PreferencesStepperProps) => {
  const GREEN_MAIN = userType === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF';
  const FADE_OPACITY = 0.3;

  // Custom connector with dynamic colors based on user type
  const ColorlibConnector = styled(StepConnector)(({ theme }: any) => {
    const primary = GREEN_MAIN;
    const faded = `rgba(${parseInt(primary.slice(1, 3), 16)},${parseInt(primary.slice(3, 5), 16)},${parseInt(primary.slice(5, 7), 16)},${FADE_OPACITY})`;

    return {
      [`&.${stepConnectorClasses.root}`]: {
        margin: '0 8px',
      },
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: 'transparent',
        height: 4,
        position: 'relative',
      },
      [`& .${stepConnectorClasses.line}::before,
        & .${stepConnectorClasses.line}::after`]: {
        content: '""',
        position: 'absolute',
        top: 0,
        width: 62,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.grey[300],
      },
      [`& .${stepConnectorClasses.line}::before`]: { left: 0 },
      [`& .${stepConnectorClasses.line}::after`]: { right: 0 },
      [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}::before,
        &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}::after`]: {
        backgroundColor: primary,
      },
      [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}::before`]: {
        backgroundColor: primary,
      },
      [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}::after`]: {
        backgroundColor: faded,
      },
    };
  });

  // Only show stepper when there are multiple steps AND not on the first step
  if (steps.length <= 1 || activeStep === 0) {
    return null;
  }

  return (
    <Stepper 
      alternativeLabel 
      activeStep={activeStep} 
      connector={<ColorlibConnector />} 
      sx={{ my: 4 }}
    >
      {steps.map(label => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={(props) => (
              <ColorlibStepIcon {...props} userType={userType} />
            )}
            sx={{
              '& .MuiStepLabel-label.Mui-active': { color: `${GREEN_MAIN} !important` },
              '& .MuiStepLabel-label.Mui-completed': { color: `${GREEN_MAIN} !important` }
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default PreferencesStepper;
