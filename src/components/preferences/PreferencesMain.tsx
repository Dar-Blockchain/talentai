import React from 'react';
import { Box, Card, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { usePreferences } from './hooks/usePreferences';
import UserTypeSelection from './UserTypeSelection';
import PersonalDetails from './PersonalDetails';
import CompanyDetails from './CompanyDetails';
import SkillsSelection from './SkillsSelection';
import ExperienceLevel from './ExperienceLevel';
import ProficiencyRating from './ProficiencyRating';
import HederaQCM from './HederaQCM';
import Review from './Review';

const PreferencesMain: React.FC = () => {
  const router = useRouter();
  const {
    activeStep,
    userType,
    selectedCategory,
    isTestJobReturnUrl,
    companyDetails,
    requiredSkills,
    experienceLevel,
    firstName,
    lastName,
    skills,
    skillWarning,
    hederaExp,
    hedQcm,
    proficiency,
    steps,
    currentStep,
    handleNext,
    handleBack,
    handleUserTypeSelect,
    setSelectedCategory,
    setCompanyDetails,
    setRequiredSkills,
    setExperienceLevel,
    setFirstName,
    setLastName,
    setSkills,
    setSkillWarning,
    setHederaExp,
    setHedQcm,
    setProficiency,
    isCurrentStepValid,
  } = usePreferences();

  const GREEN_MAIN = userType === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF';

  // Create wrapper functions to match component interfaces
  const handleSetQcm = (qid: string, ans: string) => {
    setHedQcm(prev => ({ ...prev, [qid]: ans }));
  };

  const handleSetProf = (skill: string, value: number) => {
    setProficiency(prev => ({ ...prev, [skill]: value }));
  };

  // Handle profile creation/update
  const handleCreateOrUpdateProfile = async () => {
    try {
      // Get token from cookies
      const token = localStorage.getItem('api_token');

      if (!token) {
        console.error('No token found');
        return false;
      }

      if (userType === 'company') {
        // Format company profile data
        const companyProfileData = {
          name: companyDetails.name,
          industry: companyDetails.industry,
          size: companyDetails.size,
          location: companyDetails.location,
          requiredSkills: requiredSkills,
          requiredExperienceLevel: experienceLevel,
          hederaExperience: hederaExp === 'yes' ? hedQcm : undefined
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateCompanyProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(companyProfileData)
        });

        if (!response.ok) {
          throw new Error('Failed to create/update company profile');
        }

        return true;
      } else {
        // Create candidate profile with all filled data
        const profileData = {
          type: "Candidate",
          FirstName: firstName,
          LastName: lastName,
          skills: skills.map(skill => ({ skill })), // array of objects for backend
          proficiencyLevels: Object.entries(proficiency)
            .filter(([skill]) => skills.includes(skill))
            .map(([skill, level]) => ({ skill, level })),
          hederaExperience: hederaExp === 'yes' ? hedQcm : undefined
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          throw new Error('Failed to create/update profile');
        }

        return true;
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      return false;
    }
  };

  // Handle start test
  const handleStartTest = async () => {
    try {
      // Create or update profile first
      const profileCreated = await handleCreateOrUpdateProfile();

      if (!profileCreated) {
        console.error('Failed to create/update profile');
        return;
      }

      // Get returnUrl from query parameters
      const returnUrl = router.query.returnUrl as string;
      if (userType === 'company') {
        router.push('/dashboard/company');
        return;
      }

      // If there's a returnUrl, go there
      if (returnUrl) {
        console.log('Redirecting to returnUrl:', returnUrl);
        const decodedUrl = decodeURIComponent(returnUrl);
        router.push(decodedUrl);
      } else {
        // For normal sign-in, go to test page with skills and levels
        router.push({
          pathname: '/interview',
          query: {
            type: 'on-boarding',
            skills: skills.join(','),
            experienceLevel: 'Entry Level', // Default experience level
            proficiencyLevels: Object.entries(proficiency)
              .filter(([skill]) => skills.includes(skill))
              .map(([skill, level]) => `${skill}:${level}`)
              .join(',')
          }
        });
      }
    } catch (error) {
      console.error('Error in handleStartTest:', error);
    }
  };

  // Handle final step action
  const handleFinalStepAction = async () => {
    if (userType === 'company') {
      await handleCreateOrUpdateProfile();
      router.push('/dashboard/company');
    } else {
      await handleStartTest();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'Select Type':
        return (
          <UserTypeSelection
            userType={userType}
            onUserTypeSelect={handleUserTypeSelect}
            isTestJobReturnUrl={isTestJobReturnUrl}
          />
        );

      case 'Personal Details':
        return (
          <PersonalDetails
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
          />
        );

      case 'Company Details':
        return (
          <CompanyDetails
            companyDetails={companyDetails}
            setCompanyDetails={setCompanyDetails}
          />
        );

      case 'Select Skills':
      case 'Required Skills':
        return (
          <SkillsSelection
            userType={userType}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            skills={skills}
            setSkills={setSkills}
            requiredSkills={requiredSkills}
            setRequiredSkills={setRequiredSkills}
            hederaExp={hederaExp}
            setHederaExp={setHederaExp}
            skillWarning={skillWarning}
            GREEN_MAIN={GREEN_MAIN}
          />
        );

      case 'Experience Level':
        return (
          <ExperienceLevel
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
          />
        );

      case 'Hedera QCM':
        return (
          <HederaQCM
            hedQcm={hedQcm}
            setQcm={handleSetQcm}
          />
        );

      case 'Rate Proficiency':
        return (
          <ProficiencyRating
            skills={skills}
            proficiency={proficiency}
            setProf={handleSetProf}
            GREEN_MAIN={GREEN_MAIN}
          />
        );

      case 'Review':
        return (
          <Review
            userType={userType}
            firstName={firstName}
            lastName={lastName}
            skills={skills}
            proficiency={proficiency}
            companyDetails={companyDetails}
            requiredSkills={requiredSkills}
            experienceLevel={experienceLevel}
            hederaExp={hederaExp}
            GREEN_MAIN={GREEN_MAIN}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Main Content */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Card elevation={8} sx={{ 
          backgroundColor: 'white', 
          width: { xs: '100%', sm: 800 }, 
          p: 4, 
          borderRadius: 3, 
          backdropFilter: 'blur(10px)' 
        }}>
          {activeStep !== 0 && (
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'black' }}>
              Let's Deep Dive into Your Skills
            </Typography>
          )}

          {/* Step Content */}
          {renderCurrentStep()}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: GREEN_MAIN,
                color: GREEN_MAIN,
                '&:hover': {
                  borderColor: GREEN_MAIN
                }
              }}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleFinalStepAction : handleNext}
              disabled={
                activeStep === 0 && !userType ||
                !isCurrentStepValid()
              }
              sx={{
                background: GREEN_MAIN,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: GREEN_MAIN
                }
              }}
            >
              {activeStep === 0
                ? 'Get Started'
                : activeStep === steps.length - 1
                  ? (userType === 'company' ? 'Go to Dashboard' : 'Start Test')
                  : 'Next'}
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default PreferencesMain;
