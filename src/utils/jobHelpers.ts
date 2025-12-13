export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "On-Site" | "Remote" | "Hybrid";
  employmentType: "Full-Time" | "Part-Time" | "Contract";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  datePosted: string;
  skills: string[];
  logo?: string;
}

export const formatSalary = (salary: Job["salary"]): string => {
  return `${salary.currency} ${salary.min.toLocaleString()} - ${
    salary.currency
  } ${salary.max.toLocaleString()}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

export const getJobTypeColor = (type: string): string => {
  switch (type) {
    case "On-Site":
      return "#e3f2fd";
    case "Remote":
      return "#e8f5e8";
    case "Hybrid":
      return "#fff3e0";
    default:
      return "#f5f5f5";
  }
};

export const getJobTypeTextColor = (type: string): string => {
  switch (type) {
    case "On-Site":
      return "#1976d2";
    case "Remote":
      return "#2e7d32";
    case "Hybrid":
      return "#f57c00";
    default:
      return "#666";
  }
};

export const transformJobData = (job: any): Job => {
  return {
    id: job._id,
    title: job.jobDetails?.title || "Untitled Position",
    company: job.user?.companyDetails?.companyName || "Company",
    location: job.jobDetails?.location || "Location not specified",
    type: job.jobDetails?.workType || job.jobDetails?.type || "On-Site",
    employmentType: job.jobDetails?.employmentType || "Full-Time",
    salary: {
      min: job.jobDetails?.salary?.min || 0,
      max: job.jobDetails?.salary?.max || 0,
      currency: job.jobDetails?.salary?.currency || "USD",
    },
    description: job.jobDetails?.description || "No description available",
    datePosted: job.createdAt || new Date().toISOString(),
    skills:
      job.skillAnalysis?.requiredSkills?.map((skill: any) =>
        typeof skill === "string" ? skill : skill.name
      ) || [],
    logo: job.user?.companyDetails?.logo || undefined,
  };
};
