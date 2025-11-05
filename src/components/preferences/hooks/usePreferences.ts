import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';

export type UserType = 'candidate' | 'company' | '';

export const usePreferences = () => {
  const router = useRouter();
  
  // Basic state
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState<UserType>('');
  const [selectedCategory, setSelectedCategory] = useState('development');
  const [isTestJobReturnUrl, setIsTestJobReturnUrl] = useState(false);

  // Company specific states
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    industry: '',
    size: '',
    location: ''
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');

  // Candidate specific states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillWarning, setSkillWarning] = useState<string>('');
  const [hederaExp, setHederaExp] = useState<'yes' | 'no' | ''>('');
  const [hedQcm, setHedQcm] = useState<Record<string, string>>({});
  const [proficiency, setProficiency] = useState<Record<string, number>>(() => {
    const defaultProficiency: Record<string, number> = {};
    // Initialize with default value of 1 for all skills
    ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Hedera', 'Solidity', 'Ethereum', 'Machine Learning', 'Deep Learning', 'SEO', 'Content Marketing', 'Manual Testing', 'Project Management'].forEach(skill => {
      defaultProficiency[skill] = 1;
    });
    return defaultProficiency;
  });

  // Get steps based on user type and Hedera experience
  const steps = useMemo(() => {
    const baseSteps = ['Select Type'];
    if (userType) {
      if (userType === 'company') {
        baseSteps.push('Company Details', 'Required Skills', 'Review');
      } else {
        baseSteps.push('Personal Details', 'Select Skills');
        if (hederaExp === 'yes') baseSteps.push('Hedera QCM');
        baseSteps.push('Rate Proficiency', 'Review');
      }
    }
    return baseSteps;
  }, [userType, hederaExp]);

  // Calculate actual step content to show
  const currentStep = useMemo(() => {
    if (activeStep === 0) return 'Select Type';
    return steps[activeStep];
  }, [steps, activeStep]);

  // Navigation functions
  const handleNext = () => setActiveStep(i => i + 1);
  const handleBack = () => setActiveStep(i => i - 1);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setActiveStep(prev => prev + 1);
  };

  // Skill management
  const toggleSkill = (label: string) => {
    if (skills.includes(label)) {
      setSkills(prev => prev.filter(s => s !== label));
      setSkillWarning('');
    } else {
      if (skills.length >= 1) {
        setSkillWarning('You can only select 1 skill');
        return;
      }
      setSkills(prev => [...prev, label]);
      setSkillWarning('');
    }
  };

  const toggleRequiredSkill = (label: string) => {
    if (requiredSkills.includes(label)) {
      setRequiredSkills(prev => prev.filter(s => s !== label));
    } else {
      setRequiredSkills(prev => [...prev, label]);
    }
  };

  // Proficiency management
  const setProf = (skill: string, value: number) =>
    setProficiency(prev => ({ ...prev, [skill]: value }));

  // QCM management
  const setQcm = (qid: string, ans: string) =>
    setHedQcm(prev => ({ ...prev, [qid]: ans }));

  // Validation
  const isCurrentStepValid = () => {
    if (userType === 'company') {
      switch (currentStep) {
        case 'Company Details':
          return companyDetails.name && companyDetails.industry && companyDetails.size && companyDetails.location;
        case 'Required Skills':
          return requiredSkills.length > 0;
        default:
          return true;
      }
    } else if (userType === 'candidate') {
      switch (currentStep) {
        case 'Personal Details':
          return firstName.trim() !== '' && lastName.trim() !== '';
        case 'Select Skills':
          return skills.length > 0;
        default:
          return true;
      }
    }
    return true;
  };

  return {
    // State
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

    // Setters
    setActiveStep,
    setUserType,
    setSelectedCategory,
    setIsTestJobReturnUrl,
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

    // Functions
    handleNext,
    handleBack,
    handleUserTypeSelect,
    toggleSkill,
    toggleRequiredSkill,
    setProf,
    setQcm,
    isCurrentStepValid,
  };
};
