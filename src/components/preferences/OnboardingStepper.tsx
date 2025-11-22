"use client";
import * as React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Typography,
  Button,
  styled,
  CircularProgress,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import RoleSelection from "./RoleSelection";
import CandidateDetails from "./candidate/CandidateDetails";
import SelectSkills from "./candidate/SelectSkills";
import CompanyDetails from "./company/CompanyDetails";
import SkillsStack from "./company/SkillsStack";
import CandidateReview from "./candidate/CandidateReview";
import CompanyReview from "./company/CompanyReview";
import {
  candidateSteps,
  candidateStepsInfo,
  companySteps,
  companyStepsInfo,
} from "./data/onboardingData";
import {
  createOrUpdateProfile,
  selectProfile,
} from "@/store/slices/profileSlice";
import { AppDispatch } from "@/store/store";

// ---------- Custom Connector ----------
const SplitLineConnector = styled(StepConnector)<{ userType?: string }>(
  ({ userType }) => ({
    [`&.MuiStepConnector-root`]: {
      top: "22px",
      transform: "translateY(-50%)",
      position: "absolute",
      left: "calc(-50% + 22.5px)",
      right: "calc(50% + 22.5px)",
      zIndex: 0,
      padding: "0 5px",
    },
    [`& .MuiStepConnector-line`]: {
      position: "relative",
      height: "8px",
      border: 0,
      borderRadius: "8px",
      backgroundColor: "transparent",
    },
    [`& .MuiStepConnector-line::before,& .MuiStepConnector-line::after`]: {
      content: '""',
      position: "absolute",
      top: 0,
      height: "8px",
      width: "48%",
      borderRadius: "8px",
      backgroundColor: "rgba(210, 225, 238, 1)",
    },
    [`& .MuiStepConnector-line::before`]: { left: 0 },
    [`& .MuiStepConnector-line::after`]: { right: 0 },
    [`&.Mui-active .MuiStepConnector-line::before,&.Mui-active .MuiStepConnector-line::after,&.Mui-completed .MuiStepConnector-line::before,&.Mui-completed .MuiStepConnector-line::after`]:
      {
        backgroundColor:
          userType === "candidate"
            ? "rgba(232, 209, 255, 1)"
            : "rgba(223, 249, 239, 1)",
      },
  })
);

// ---------- Step Icon ----------
const StepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean; userType?: string };
}>(({ ownerState }) => ({
  zIndex: 1,
  backgroundColor:
    ownerState.active || ownerState.completed
      ? ownerState.userType === "candidate"
        ? "rgba(189, 133, 255, 1)"
        : "rgba(12, 218, 139, 1)"
      : "rgba(210, 225, 238, 1)",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 45,
  height: 45,
  borderRadius: "50%",
  fontWeight: 600,
  fontSize: "15px",
  transition: "all 0.3s ease",
}));

function CustomStepIcon(props: any) {
  const { active, completed, className, userType } = props;
  return (
    <StepIconRoot
      ownerState={{ active, completed, userType }}
      className={className}
    >
      {completed ? <Check fontSize="small" /> : props.icon}
    </StepIconRoot>
  );
}

type OnboardingStepperProps = {
  preferences: ReturnType<
    typeof import("./hooks/usePreferences").usePreferences
  >;
};

const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  preferences,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const profileState = useSelector(selectProfile);
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false); // ✅ Loading state

  const { userType, candidateDetails, skills, companyDetails } = preferences;
  const steps = userType === "candidate" ? candidateSteps : companySteps;
  const stepsInfo =
    userType === "candidate" ? candidateStepsInfo : companyStepsInfo;

  const companyDetailsRef = React.useRef<any>(null);
  const candidateDetailsRef = React.useRef<any>(null);
  const selectSkillsRef = React.useRef<any>(null);
  const skillStackRef = React.useRef<any>(null);

  const handleNext = () => {
    if (
      userType === "candidate" &&
      activeStep === 1 &&
      !candidateDetailsRef.current?.validate()
    )
      return;
    if (
      userType === "company" &&
      activeStep === 1 &&
      !companyDetailsRef.current?.validate()
    )
      return;
    if (
      userType === "candidate" &&
      activeStep === 2 &&
      !selectSkillsRef.current?.validate()
    )
      return;
    if (
      userType === "company" &&
      activeStep === 2 &&
      !skillStackRef.current?.validate()
    )
      return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSaveAndRedirect = async () => {
    setLoading(true);
    let profileData;

    if (userType === "company") {
      profileData = {
        ...companyDetails,
        requiredSkills: skills,
        requiredExperienceLevel: "Entry Level",
        type: "company",
      };
    } else {
      // Remove salary fields from root
      const {
        salaryMin,
        salaryMax,
        salaryCurrency,
        ...cleanedCandidateDetails
      } = candidateDetails;
      let expectedSalary = null;

      if (salaryMin || salaryMax) {
        expectedSalary = {
          min: salaryMin ? Number(salaryMin) : null,
          max: salaryMax ? Number(salaryMax) : null,
          currency: salaryCurrency || null,
        };
      }
      profileData = {
        ...cleanedCandidateDetails,
        skills: skills.map((skill) => ({
          name: skill,
          proficiency: preferences.skillProficiency || "3" // Add proficiency level
        })),
        type: "Candidate",
        expectedSalary,
      };
    }

    try {
      const resultAction = await dispatch(createOrUpdateProfile(profileData));
      if (createOrUpdateProfile.fulfilled.match(resultAction)) {
        // Redirect after successful update
        if (userType === "company") return router.push("/dashboard/company");
        const returnUrl = router.query.returnUrl as string;
        if (returnUrl) return router.push(decodeURIComponent(returnUrl));

        // Build interview parameters from onboarding data for /interview/hr
        const primarySkill = skills[0] || "Software";
        const skillProficiency = preferences.skillProficiency || "3"; // Default: Mid Level
        const targetRole = `${primarySkill} Developer`;

        router.push({
          pathname: "/interview/hr",
          query: {
            type: "hr",
            role: targetRole,
            proficiency: skillProficiency,
            company: "Target Company",
            language: "en",
            difficulty: "intermediate"
          },
        });
      } else {
        console.error("Failed to save profile:", resultAction.payload);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <Box sx={{ maxWidth: "100%" }}>
      {/* Title + Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, fontSize: "32px", lineHeight: "24px" }}
        >
          {stepsInfo[activeStep]?.title}
        </Typography>
        {activeStep === 0 && (
          <Box
            component="img"
            src={userType === "candidate" ? "/logo-purple.svg" : "/logo.svg"}
            alt="Logo"
            sx={{ height: 36 }}
          />
        )}
      </Box>
      {stepsInfo[activeStep]?.subtitle && (
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            color: "rgba(140, 140, 140, 1)",
            mt: 2,
            mb: 6,
          }}
        >
          {stepsInfo[activeStep].subtitle}
        </Typography>
      )}

      {/* Stepper */}
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<SplitLineConnector userType={userType} />}
        sx={{ position: "relative", mt: 4, mb: 4 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon {...props} userType={userType} />
              )}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "25px",
                  color:
                    activeStep >= steps.indexOf(label)
                      ? userType === "candidate"
                        ? "rgba(189, 133, 255, 1)"
                        : "rgba(12, 218, 139, 1)"
                      : "rgba(210, 225, 238, 1)",
                }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mt: 4,
        }}
      >
        {activeStep === 0 && <RoleSelection preferences={preferences} />}
        {activeStep === 1 &&
          (userType === "candidate" ? (
            <CandidateDetails
              ref={candidateDetailsRef}
              preferences={preferences}
            />
          ) : (
            <CompanyDetails ref={companyDetailsRef} preferences={preferences} />
          ))}
        {activeStep === 2 &&
          (userType === "candidate" ? (
            <SelectSkills ref={selectSkillsRef} preferences={preferences} />
          ) : (
            <SkillsStack ref={skillStackRef} preferences={preferences} />
          ))}
        {activeStep === 3 &&
          (userType === "candidate" ? (
            <CandidateReview preferences={preferences} />
          ) : (
            <CompanyReview preferences={preferences} />
          ))}
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="outlined"
          sx={{
            width: "163px",
            height: "40px",
            borderColor:
              userType === "candidate"
                ? "rgba(189, 133, 255, 1)"
                : "rgba(12, 218, 139, 1)",
            color:
              userType === "candidate"
                ? "rgba(189, 133, 255, 1)"
                : "rgba(12, 218, 139, 1)",
            borderRadius: "24px",
            px: 4,
            textTransform: "none",
          }}
        >
          Back
        </Button>
        <Button
          onClick={
            activeStep === steps.length - 1 ? handleSaveAndRedirect : handleNext
          }
          variant="contained"
          disabled={loading}
          sx={{
            width: "163px",
            height: "40px",
            backgroundColor: "rgba(25, 25, 25, 1)",
            color: "#fff",
            borderRadius: "24px",
            px: 2,
            textTransform: "none",
            "&:hover": { backgroundColor: "rgba(25, 25, 25, 0.8)" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : activeStep === steps.length - 1 ? (
            userType === "candidate" ? (
              "Start My Test"
            ) : (
              "Go to Dashboard"
            )
          ) : (
            "Next"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default OnboardingStepper;
