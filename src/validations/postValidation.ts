type ToastFn = (params: { message: string; severity: "error" | "success" | "info" | "warning" }) => void;

/* =========================
   AI POST – STEP 0
========================= */
export const validateAIPostStep0 = (
  generatedPost: any,
  showToast: ToastFn
): boolean => {
  const jobDetails = generatedPost?.jobDetails;
  const hardSkills = generatedPost?.skillAnalysis?.requiredSkills || [];
  const softSkills = generatedPost?.skillAnalysis?.softSkills || [];

  if (!jobDetails?.title?.trim()) {
    showToast({ message: "Job title is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.experienceLevel) {
    showToast({ message: "Experience level is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.description?.trim()) {
    showToast({ message: "Job description is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.employmentType) {
    showToast({ message: "Employment type is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.location?.trim()) {
    showToast({ message: "Work mode is required", severity: "error" });
    return false;
  }

  if (!validateSalary(jobDetails?.salary, showToast)) return false;

  if (!hardSkills.length) {
    showToast({ message: "At least one hard skill is required", severity: "error" });
    return false;
  }

  if (!softSkills.length) {
    showToast({ message: "At least one soft skill is required", severity: "error" });
    return false;
  }

  const total = [...hardSkills, ...softSkills].reduce(
    (sum, s) => sum + (s.percentage || 0),
    0
  );

  if (total !== 100) {
    showToast({
      message: `Total skill percentage must equal 100%. Current total: ${total}%`,
      severity: "error",
    });
    return false;
  }

  if (!jobDetails?.requirements?.length) {
    showToast({ message: "At least one requirement is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.responsibilities?.length) {
    showToast({ message: "At least one responsibility is required", severity: "error" });
    return false;
  }

  return true;
};

/* =========================
   MANUAL POST – STEP 0
========================= */
export const validateManualPostStep0 = (
  manualPost: any,
  showToast: ToastFn
): boolean => {
  const jobDetails = manualPost?.jobDetails;

  if (!jobDetails?.title?.trim()) {
    showToast({ message: "Job title is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.employmentType) {
    showToast({ message: "Employment type is required", severity: "error" });
    return false;
  }

  if (!jobDetails?.location?.trim()) {
    showToast({ message: "Work mode is required", severity: "error" });
    return false;
  }

  return validateSalary(jobDetails?.salary, showToast);
};

/* =========================
   SHARED SALARY VALIDATION
========================= */
const validateSalary = (salary: any, showToast: ToastFn): boolean => {
  if (!salary?.min || !salary?.max || !salary?.currency) {
    showToast({
      message: "Salary minimum, maximum, and currency are required",
      severity: "error",
    });
    return false;
  }

  const min = Number(salary.min);
  const max = Number(salary.max);

  if (isNaN(min) || isNaN(max)) {
    showToast({ message: "Salary must be a valid number", severity: "error" });
    return false;
  }

  if (min <= 0 || max <= 0) {
    showToast({ message: "Salary must be greater than 0", severity: "error" });
    return false;
  }

  if (min > max) {
    showToast({
      message: "Minimum salary cannot be greater than maximum salary",
      severity: "error",
    });
    return false;
  }

  return true;
};
