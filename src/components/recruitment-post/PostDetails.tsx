import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Box, Alert } from "@mui/material";
import Cookies from "js-cookie";
import JobDescriptionInput from "./components/JobDescriptionInput";
import JobPreview from "./components/JobPreview";
import { JobPost, PostDetailsRef, SalaryRange } from "./types";

const GRADIENT_BACKGROUND = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";

const PostDetails = forwardRef<PostDetailsRef>((props, ref) => {
  const [jobDescription, setJobDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState<SalaryRange>({
    currency: "$",
    min: "",
    max: "",
  });
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [isDetailedGenerating, setIsDetailedGenerating] = useState(false);
  const [generatedJob, setGeneratedJob] = useState<JobPost | null>(null);
  const [jobPostError, setJobPostError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<JobPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSharedToLinkedIn, setHasSharedToLinkedIn] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [linkedinCopySuccess, setLinkedinCopySuccess] = useState(false);
  const [updatedJobData, setUpdatedJobData] = useState<JobPost | undefined>(
    undefined
  );
  const [postedJobId, setPostedJobId] = useState<string | null>(null);
  const [jobPostDialog, setJobPostDialog] = useState(false);

  // Helper Functions
  const isSalaryRangeValid = (): boolean => {
    return (
      !!salaryRange.min &&
      !!salaryRange.max &&
      parseInt(salaryRange.max) >= parseInt(salaryRange.min)
    );
  };

  const handleSalaryChange = (
    field: "min" | "max" | "currency",
    value: string
  ): void => {
    setSalaryRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateJob = async (type: "quick" | "detailed"): Promise<void> => {
    try {
      if (type === "quick") {
        setIsQuickGenerating(true);
      } else {
        setIsDetailedGenerating(true);
      }
      setJobPostError("");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock generated job data
      const mockJob: JobPost = {
        jobDetails: {
          title: "Senior Full Stack Developer",
          description:
            "We are seeking a talented Senior Full Stack Developer to join our dynamic team...",
          requirements: [
            "5+ years experience with React.js",
            "Strong TypeScript skills",
            "Experience with Node.js",
          ],
          responsibilities: [
            "Lead development of core features",
            "Mentor junior developers",
            "Design scalable services",
          ],
          location: "Remote",
          employmentType: "Full-time",
          experienceLevel: "Senior",
          salary: {
            min: parseInt(salaryRange.min),
            max: parseInt(salaryRange.max),
            currency: salaryRange.currency,
          },
        },
        skillAnalysis: {
          requiredSkills: [
            {
              name: "React.js",
              level: "5",
              importance: "Required",
              category: "Frontend",
              experienceLevel: "Senior",
            },
            {
              name: "TypeScript",
              level: "4",
              importance: "Required",
              category: "Language",
              experienceLevel: "Senior",
            },
            {
              name: "Node.js",
              level: "4",
              importance: "Required",
              category: "Backend",
              experienceLevel: "Senior",
            },
          ],
          suggestedSkills: {
            technical: [
              {
                name: "Docker",
                reason: "Containerization",
                category: "DevOps",
                priority: "High",
              },
            ],
            frameworks: [
              { name: "Next.js", relatedTo: "React", priority: "Medium" },
            ],
            tools: [
              {
                name: "Git",
                purpose: "Version Control",
                category: "Development",
              },
            ],
          },
          skillSummary: {
            mainTechnologies: ["React.js", "TypeScript", "Node.js"],
            complementarySkills: ["Docker", "Next.js"],
            learningPath: ["JavaScript", "React.js", "TypeScript"],
            stackComplexity: "Intermediate",
          },
        },
        linkedinPost: {
          formattedContent: {
            headline: "🌟 We're Hiring: Senior Full Stack Developer 🌟",
            introduction:
              "Are you passionate about building interactive web applications?",
            companyPitch: "Join a team where innovation drives us forward.",
            roleOverview:
              "As a Senior Full Stack Developer, you'll be at the heart of our engineering process.",
            keyPoints: [
              "🔹 Develop cutting-edge web applications",
              "🔹 Work with a team of talented developers",
              "🔹 Remote work",
              `🔹 Salary range: ${salaryRange.currency}${salaryRange.min}-${salaryRange.max}`,
            ],
            skillsRequired: "💻 Required Skills: React.js, TypeScript, Node.js",
            benefitsSection:
              "🎯 We offer a vibrant culture and mentorship opportunities.",
            callToAction: "✨ Ready to make a difference? Apply now!",
          },
          hashtags: ["#Hiring", "#TechJobs", "#RemoteWork"],
          formatting: {
            emojis: {
              company: "🏢",
              location: "🌍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨",
            },
          },
          finalPost:
            "🌟 We're Hiring: Senior Full Stack Developer 🌟\n\nAre you passionate about building interactive web applications? Join our dynamic team!",
        },
      };

      setGeneratedJob(mockJob);
      setEditedJob(mockJob);
    } catch (error) {
      setJobPostError("Failed to generate job post. Please try again.");
    } finally {
      setIsQuickGenerating(false);
      setIsDetailedGenerating(false);
    }
  };

  const handleEdit = (): void => {
    setIsEditing(true);
    setEditedJob(generatedJob ? { ...generatedJob } : null);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleSave = (): void => {
    if (editedJob) {
      setGeneratedJob(editedJob);
    }
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleInputChange = (field: string, value: any): void => {
    if (!editedJob || !editedJob.jobDetails) return;

    if (field === "salary") {
      setEditedJob((prev) => prev ? ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          salary: {
            ...prev.jobDetails.salary,
            ...value,
          },
        },
      }) : null);
    } else if (field === "requirements") {
      setEditedJob((prev) => prev ? ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          requirements: Array.isArray(value)
            ? value
            : value.split("\n").filter((item: string) => item.trim() !== ""),
        },
      }) : null);
    } else if (field === "responsibilities") {
      setEditedJob((prev) => prev ? ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          responsibilities: Array.isArray(value)
            ? value
            : value.split("\n").filter((item: string) => item.trim() !== ""),
        },
      }) : null);
    } else {
      // Handle direct jobDetails fields like title, description, location, employmentType, experienceLevel
      setEditedJob((prev) => prev ? ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          [field]: value,
        },
      }) : null);
    }
  };

  const handleShareLinkedIn = async (): Promise<void> => {
    setIsPosting(true);
    // Simulate LinkedIn sharing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setHasSharedToLinkedIn(true);
    setLinkedinCopySuccess(true);
    setIsPosting(false);

    setTimeout(() => setLinkedinCopySuccess(false), 3000);
  };

  // Update the saveJob function to handle the job data properly
  const saveJob = async (): Promise<{ success: boolean; jobId?: string }> => {
    setIsSaving(true);
    try {
      // Use the updated job data if available, otherwise use the generated job
      const jobDataToUse = updatedJobData || generatedJob;

      if (!jobDataToUse) {
        throw new Error("No job data available");
      }

      const jobPostData = {
        jobDetails: {
          title: jobDataToUse.jobDetails.title,
          description: jobDataToUse.jobDetails.description,
          requirements: jobDataToUse.jobDetails.requirements,
          responsibilities: jobDataToUse.jobDetails.responsibilities,
          location: jobDataToUse.jobDetails.location,
          employmentType: jobDataToUse.jobDetails.employmentType,
          experienceLevel: jobDataToUse.jobDetails.experienceLevel,
          salary: jobDataToUse.jobDetails.salary,
        },
        skillAnalysis: {
          requiredSkills: jobDataToUse.skillAnalysis.requiredSkills || [],
          suggestedSkills: {
            technical: (
              jobDataToUse.skillAnalysis.suggestedSkills?.technical || []
            )
              .map((skill: any) => {
                console.log("Technical skill:", skill);
                const skillName =
                  typeof skill === "string" ? skill : skill?.name || "";
              if (!skillName) {
                  console.error("Invalid technical skill:", skill);
                return null;
              }
              return {
                name: skillName,
                reason: `Required ${skillName} knowledge`,
                  category: "Technical",
                  priority: "High",
                };
              })
              .filter(Boolean),
            frameworks: (
              jobDataToUse.skillAnalysis.suggestedSkills?.frameworks || []
            )
              .map((skill: any) => {
                console.log("Framework skill:", skill);
                const skillName =
                  typeof skill === "string" ? skill : skill?.name || "";
              if (!skillName) {
                  console.error("Invalid framework skill:", skill);
                return null;
              }
              return {
                name: skillName,
                  relatedTo: "Python",
                  priority: "Medium",
                };
              })
              .filter(Boolean),
            tools: (jobDataToUse.skillAnalysis.suggestedSkills?.tools || [])
              .map((skill: any) => {
                console.log("Tool skill:", skill);
                const skillName =
                  typeof skill === "string" ? skill : skill?.name || "";
              if (!skillName) {
                  console.error("Invalid tool skill:", skill);
                return null;
              }
              return {
                name: skillName,
                purpose: `Development tool: ${skillName}`,
                  category: "Development Tools",
              };
              })
              .filter(Boolean),
          },
          skillSummary: {
            mainTechnologies:
              jobDataToUse.skillAnalysis.skillSummary?.mainTechnologies || [],
            complementarySkills:
              jobDataToUse.skillAnalysis.skillSummary?.complementarySkills ||
              [],
            learningPath:
              jobDataToUse.skillAnalysis.skillSummary?.learningPath || [],
            stackComplexity:
              jobDataToUse.skillAnalysis.skillSummary?.stackComplexity ||
              "Moderate",
          },
        },
        linkedinPost: {
          formattedContent: {
            headline: `🌟 We're Hiring: ${jobDataToUse.jobDetails.title} 🌟`,
            introduction:
              "Are you passionate about building interactive web applications? We've got an exciting opportunity for you!",
            companyPitch:
              "Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.",
            roleOverview: `As a ${jobDataToUse.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.`,
            keyPoints: [
              "🔹 Develop cutting-edge web applications",
              "🔹 Work with a team of talented developers",
              `🔹 ${jobDataToUse.jobDetails.location} work`,
              `🔹 Salary range: ${jobDataToUse.jobDetails.salary.currency}${jobDataToUse.jobDetails.salary.min}-${jobDataToUse.jobDetails.salary.max}`,
            ],
            skillsRequired: `💻 Required Skills: ${jobDataToUse.skillAnalysis.requiredSkills
              .map(
                (skill: {
                  name: string;
                  level: string;
                  importance: string;
                  category: string;
                }) => skill.name
              )
              .join(", ")}.`,
            benefitsSection:
              "🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.",
            callToAction:
              "✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test",
          },
          hashtags: [
            "#Hiring",
            "#TechJobs",
            `#${jobDataToUse.jobDetails.title.replace(/\s+/g, "")}`,
            "#RemoteWork",
            "#TechCareers",
          ],
          formatting: {
            emojis: {
              company: "🏢",
              location: "📍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨",
            },
          },
          finalPost: `🌟 We're Hiring: ${jobDataToUse.jobDetails.title} 🌟

Are you passionate about building interactive web applications? We've got an exciting opportunity for you!

Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.

As a ${
            jobDataToUse.jobDetails.title
          }, you'll be at the heart of our engineering process, building software that matters.

🔹 Develop cutting-edge web applications
🔹 Work with a team of talented developers
🔹 ${jobDataToUse.jobDetails.location} work
🔹 Salary range: ${jobDataToUse.jobDetails.salary.currency}${
            jobDataToUse.jobDetails.salary.min
          }-${jobDataToUse.jobDetails.salary.max}

💻 Required Skills: ${jobDataToUse.skillAnalysis.requiredSkills
            .map(
              (skill: {
                name: string;
                level: string;
                importance: string;
                category: string;
              }) => skill.name
            )
            .join(", ")}.

🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.

✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test

#Hiring #TechJobs #${jobDataToUse.jobDetails.title.replace(
            /\s+/g,
            ""
          )} #RemoteWork #TechCareers`,
        },
      };

      // Log the complete job post data
      console.log("Job Post Data:", jobPostData);

      const token = Cookies.get("api_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/save-post`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
          body: JSON.stringify(jobPostData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save job");
      }

            const savedJob = await response.json();
      // Store the posted job ID for the success dialog
      const jobId = savedJob.data?._id || savedJob._id;
      setPostedJobId(jobId);
      console.log("Job saved successfully:", savedJob);

      // Close the dialog after successful save
      setJobPostDialog(false);
      setJobDescription("");
      setGeneratedJob(null);
      setUpdatedJobData(undefined); // Reset updated job data
      return { success: true, jobId };
    } catch (error) {
       console.error("Error saving job:", error);
       return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

   // Function to check if user can proceed to next step
   const canProceed = (): boolean => {
     return generatedJob !== null && !isSaving;
   };

   // Expose functions to parent component
   useImperativeHandle(ref, () => ({
     saveJob,
     canProceed
   }));

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 3,
        p: 3,
        background: GRADIENT_BACKGROUND,
        minHeight: "100vh",
      }}
    >
      {/* Job Description Input Panel */}
      <JobDescriptionInput
        jobDescription={jobDescription}
        onJobDescriptionChange={setJobDescription}
        salaryRange={salaryRange}
        onSalaryChange={handleSalaryChange}
        onGenerateJob={handleGenerateJob}
        isQuickGenerating={isQuickGenerating}
        isDetailedGenerating={isDetailedGenerating}
        isSalaryRangeValid={isSalaryRangeValid}
      />

      {/* Job Preview Panel */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "50%", md: "auto" },
          p: { xs: 2, sm: 3 },
          overflowY: "auto",
        }}
      >
        {jobPostError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: "rgba(211,47,47,0.1)",
              color: "#ff8a80",
              border: "1px solid rgba(211,47,47,0.3)",
              "& .MuiAlert-icon": {
                color: "#ff8a80",
              },
            }}
          >
            {jobPostError}
          </Alert>
        )}
        
        <JobPreview
          generatedJob={generatedJob}
          editedJob={editedJob}
          isEditing={isEditing}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onInputChange={handleInputChange}
          onShareLinkedIn={handleShareLinkedIn}
          isPosting={isPosting}
          hasSharedToLinkedIn={hasSharedToLinkedIn}
          linkedinCopySuccess={linkedinCopySuccess}
          jobPostError={jobPostError}
        />
      </Box>
    </Box>
  );
 });

PostDetails.displayName = "PostDetails";

export default PostDetails;