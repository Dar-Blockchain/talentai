import { useState } from "react";

export type UserType = "candidate" | "company" | "";

export const usePreferences = () => {
  // Basic state
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState<UserType>("candidate");
  const [selectedCategory, setSelectedCategory] = useState("development");
  const [isTestJobReturnUrl, setIsTestJobReturnUrl] = useState(false);

  // Company details
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
  });

  // Candidate details (UPDATED)
  const [candidateDetails, setCandidateDetails] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    educationLevel: "",
    location: "",
    preferredContractType: "",
    workModePreference: "",

    // Salary fields (fixed)
    salaryCurrency: "$", // $, €, £, TND...
    salaryMin: "",      // 1200
    salaryMax: "",      // 1500
  });

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillWarning, setSkillWarning] = useState<string>("");

  // Navigation
  const handleNext = () => setActiveStep((i) => i + 1);
  const handleBack = () => setActiveStep((i) => i - 1);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setActiveStep((prev) => prev + 1);
  };

  // Skill management
  const toggleSkill = (label: string) => {
    if (skills.includes(label)) {
      setSkills((prev) => prev.filter((s) => s !== label));
      setSkillWarning("");
    } else {
      if (skills.length >= 1) {
        setSkillWarning("You can only select 1 skill");
        return;
      }
      setSkills((prev) => [...prev, label]);
      setSkillWarning("");
    }
  };

  // Update candidate details
  const updateCandidateDetail = (
    field: keyof typeof candidateDetails,
    value: any
  ) => {
    setCandidateDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    // State
    activeStep,
    userType,
    selectedCategory,
    isTestJobReturnUrl,
    companyDetails,
    candidateDetails,
    skills,
    skillWarning,

    // Setters
    setActiveStep,
    setUserType,
    setSelectedCategory,
    setIsTestJobReturnUrl,
    setCompanyDetails,
    setCandidateDetails,
    updateCandidateDetail,
    setSkills,
    setSkillWarning,

    // Functions
    handleNext,
    handleBack,
    handleUserTypeSelect,
    toggleSkill,
  };
};
