import React, { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { Box, Alert } from "@mui/material";
import Cookies from "js-cookie";
import JobDescriptionInput from "./components/JobDescriptionInput";
import JobPreview from "./components/JobPreview";
import { JobPost, PostDetailsRef, SalaryRange } from "./types";

const CLEAN_BACKGROUND = "#ffffff";

interface PostDetailsProps {
  onReadyChange?: (ready: boolean) => void;
}

const PostDetails = forwardRef<PostDetailsRef, PostDetailsProps>(({ onReadyChange }, ref) => {
  const [jobDescription, setJobDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState<SalaryRange>({
    currency: "$",
    min: "",
    max: "",
  });
  const [contractType, setContractType] = useState("");
  const [workMode, setWorkMode] = useState("");
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

  useEffect(() => {
    onReadyChange?.(generatedJob !== null && !isSaving);
  }, [generatedJob, isSaving, onReadyChange]);

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

    // Modify the handle generate job function to reset the sharing state ONLY after successful generation
    const handleGenerateJob = async (type: 'quick' | 'detailed') => {
      try {
        if (type === 'quick') {
          setIsQuickGenerating(true);
        } else {
          setIsDetailedGenerating(true);
        }
        setJobPostError("");

        const token = Cookies.get('api_token');

        // Format salary range, contract type, and work mode for description
        const salaryText = `\n\nSalary Range: ${salaryRange.currency}${salaryRange.min.toLocaleString()} - ${salaryRange.currency}${salaryRange.max.toLocaleString()}`;
        const contractTypeText = contractType ? `\nContract Type: ${contractType}` : '';
        const workModeText = workMode ? `\nWork Mode: ${workMode}` : '';
        const descriptionWithDetails = jobDescription + salaryText + contractTypeText + workModeText;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}linkedinPost/generate-job-post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            description: descriptionWithDetails,
            type,
            contractType: contractType || undefined,
            workMode: workMode || undefined
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate job post');
        }
  
        const data = await response.json();
  
        // Transform the API response into our required structure
        // Clean location field if it contains work mode keywords
        let cleanedLocation = data.jobDetails.location;
        const workModeKeywords = ['remote', 'on-site', 'onsite', 'hybrid'];
        if (workModeKeywords.some(keyword => cleanedLocation?.toLowerCase().includes(keyword))) {
          cleanedLocation = 'Not specified';
        }

        const jobPost = {
          jobDetails: {
            title: data.jobDetails.title,
            description: data.jobDetails.description,
            requirements: data.jobDetails.requirements,
            responsibilities: data.jobDetails.responsibilities,
            location: cleanedLocation,
            employmentType: data.jobDetails.employmentType || contractType,
            workMode: workMode || data.jobDetails.workMode, // Prioritize user selection
            experienceLevel: data.jobDetails.experienceLevel,
            salary: data.jobDetails.salary
          },
          skillAnalysis: {
            requiredSkills: data.skillAnalysis.requiredSkills.map((skill: any) => ({
              name: skill.name,
              level: skill.level.toString(),
              importance: skill.importance || "Required",
              category: skill.category || (skill.name.includes('React') || skill.name.includes('JavaScript') ? 'Frontend' :
                skill.name.includes('Git') ? 'Version Control' :
                  'General'),
              percentage: skill.percentage
            })),
            softSkills: data.skillAnalysis.softSkills?.map((skill: any) => ({
              name: skill.name,
              importance: skill.importance,
              percentage: skill.percentage
            })) || [],
            suggestedSkills: {
              technical: data.skillAnalysis.suggestedSkills.technical.map((skill: any) => ({
                name: skill.name,
                reason: skill.reason,
                category: skill.category,
                priority: skill.priority
              })),
              frameworks: data.skillAnalysis.suggestedSkills.frameworks.map((framework: any) => ({
                name: framework.name,
                relatedTo: framework.relatedTo,
                priority: framework.priority
              })),
              tools: data.skillAnalysis.suggestedSkills.tools.map((tool: any) => ({
                name: tool.name,
                purpose: tool.purpose,
                category: tool.category
              }))
            },
            skillSummary: {
              mainTechnologies: data.skillAnalysis.requiredSkills.map((skill: any) => skill.name),
              complementarySkills: data.skillAnalysis.suggestedSkills.technical.map((skill: any) => skill.name),
              learningPath: data.skillAnalysis.skillSummary.learningPath,
              stackComplexity: data.skillAnalysis.skillSummary.stackComplexity
            }
          },
          linkedinPost: {
            formattedContent: {
              headline: `🌟 We're Hiring: ${data.jobDetails.title} 🌟`,
              introduction: "Are you passionate about building interactive web applications? We've got an exciting opportunity for you!",
              companyPitch: "Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.",
              roleOverview: `As a ${data.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.`,
              keyPoints: [
                "🔹 Develop cutting-edge web applications",
                "🔹 Work with a team of talented developers",
                `🔹 ${data.jobDetails.location} work`,
                `🔹 Salary range: ${data.jobDetails.salary.currency}${data.jobDetails.salary.min}-${data.jobDetails.salary.max}`
              ],
              skillsRequired: `💻 Required Skills: ${data.skillAnalysis.requiredSkills.map((skill: any) => skill.name).join(', ')}.`,
              benefitsSection: "🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.",
              callToAction: "✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test"
            },
            hashtags: [
              "#Hiring",
              "#TechJobs",
              `#${data.jobDetails.title.replace(/\s+/g, '')}`,
              "#RemoteWork",
              "#TechCareers"
            ],
            formatting: {
              emojis: {
                company: "🏢",
                location: "📍",
                salary: "💰",
                requirements: "📋",
                skills: "💻",
                benefits: "🎯",
                apply: "✨"
              }
            },
            finalPost: `🌟 We're Hiring: ${data.jobDetails.title} 🌟
  
  Are you passionate about building interactive web applications? We've got an exciting opportunity for you!
  
  Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.
  
  As a ${data.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.
  
  🔹 Develop cutting-edge web applications
  🔹 Work with a team of talented developers
  🔹 ${data.jobDetails.location} work
  🔹 Salary range: ${data.jobDetails.salary.currency}${data.jobDetails.salary.min}-${data.jobDetails.salary.max}
  
  💻 Required Skills: ${data.skillAnalysis.requiredSkills.map((skill: any) => skill.name).join(', ')}.
  
  🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.
  
  ✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/
  
  #Hiring #TechJobs #${data.jobDetails.title.replace(/\s+/g, '')} #RemoteWork #TechCareers`
          }
        };
  
        // Log the transformed job post data
        console.log('Generated Job Post:', jobPost);
  
        setGeneratedJob(jobPost);
  
        // NOW reset the LinkedIn sharing status since we have a new job post
        setHasSharedToLinkedIn(false);
  
      } catch (error) {
        console.error('Error generating job:', error);
        setJobPostError(error instanceof Error ? error.message : 'Failed to generate job post');
      } finally {
        if (type === 'quick') {
          setIsQuickGenerating(false);
        } else {
          setIsDetailedGenerating(false);
        }
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
    setEditedJob((prev) =>
      prev
        ? {
            ...prev,
            jobDetails: {
              ...prev.jobDetails,
              salary: {
                ...prev.jobDetails.salary,
                ...value,
              },
            },
          }
        : null
    );
  } else if (field === "requirements") {
    setEditedJob((prev) =>
      prev
        ? {
            ...prev,
            jobDetails: {
              ...prev.jobDetails,
              requirements: Array.isArray(value)
                ? value
                : value
                    .split("\n")
                    .filter((item: string) => item.trim() !== ""),
            },
          }
        : null
    );
  } else if (field === "responsibilities") {
    setEditedJob((prev) =>
      prev
        ? {
            ...prev,
            jobDetails: {
              ...prev.jobDetails,
              responsibilities: Array.isArray(value)
                ? value
                : value
                    .split("\n")
                    .filter((item: string) => item.trim() !== ""),
            },
          }
        : null
    );
  } else if (field === "skills") {
    // Update requiredSkills in skillAnalysis
    setEditedJob((prev) =>
      prev
        ? {
            ...prev,
            skillAnalysis: {
              ...prev.skillAnalysis,
              requiredSkills: value,
            },
          }
        : null
    );
  } else if (field === "softSkills") {
    // Update softSkills in skillAnalysis
    setEditedJob((prev) =>
      prev
        ? {
            ...prev,
            skillAnalysis: {
              ...prev.skillAnalysis,
              softSkills: value,
            },
          }
        : null
    );
  } else {
    setEditedJob((prev) =>
      prev
        ? {
            ...prev,
            jobDetails: {
              ...prev.jobDetails,
              [field]: value,
            },
          }
        : null
    );
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
          workMode: jobDataToUse.jobDetails.workMode,
          experienceLevel: jobDataToUse.jobDetails.experienceLevel,
          salary: jobDataToUse.jobDetails.salary,
        },
        skillAnalysis: {
          requiredSkills: jobDataToUse.skillAnalysis.requiredSkills || [],
          softSkills: jobDataToUse.skillAnalysis.softSkills || [],
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

   // Function to get job title
   const getJobTitle = (): string | undefined => {
     return generatedJob?.jobDetails?.title;
   };

   // Function to get job skills
   const getJobSkills = (): string[] => {
     if (!generatedJob?.skillAnalysis) return [];
     
     const skills: string[] = [];
     
     // Add required skills
     if (generatedJob.skillAnalysis.requiredSkills) {
       skills.push(...generatedJob.skillAnalysis.requiredSkills.map(skill => skill.name));
     }
     
     // Add main technologies from skill summary
     if (generatedJob.skillAnalysis.skillSummary?.mainTechnologies) {
       skills.push(...generatedJob.skillAnalysis.skillSummary.mainTechnologies);
     }
     
     // Add technical skills
     if (generatedJob.skillAnalysis.suggestedSkills?.technical) {
       skills.push(...generatedJob.skillAnalysis.suggestedSkills.technical.map(skill => skill.name));
     }
     
     // Add frameworks
     if (generatedJob.skillAnalysis.suggestedSkills?.frameworks) {
       skills.push(...generatedJob.skillAnalysis.suggestedSkills.frameworks.map(framework => framework.name));
     }
     
     // Remove duplicates and return
     return [...new Set(skills)];
   };

   const getJobData = (): JobPost | null => {
     return updatedJobData || generatedJob;
   };

   // Expose functions to parent component
   useImperativeHandle(ref, () => ({
     saveJob,
     canProceed,
     getJobTitle,
     getJobSkills,
     getJobData
   }));

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 2, sm: 3 },
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: CLEAN_BACKGROUND,
        minHeight: { xs: "auto", lg: "100vh" },
        overflow: { xs: "visible", lg: "hidden" },
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      }}
    >
      {/* Job Description Input Panel */}
      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          height: { xs: "auto", lg: "auto" },
          minHeight: { xs: "auto", lg: "100vh" },
          flexShrink: 0,
        }}
      >
        <JobDescriptionInput
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          salaryRange={salaryRange}
          onSalaryChange={handleSalaryChange}
          contractType={contractType}
          onContractTypeChange={setContractType}
          workMode={workMode}
          onWorkModeChange={setWorkMode}
          onGenerateJob={handleGenerateJob}
          isQuickGenerating={isQuickGenerating}
          isDetailedGenerating={isDetailedGenerating}
          isSalaryRangeValid={isSalaryRangeValid}
        />
      </Box>

      {/* Job Preview Panel */}
      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          height: { xs: "auto", lg: "auto" },
          minHeight: { xs: "300px", lg: "auto" },
          p: { xs: 1, sm: 2, md: 3 },
          overflowY: "visible",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          position: "relative",
          flexShrink: 0,
          display: "block", // Always visible on all screen sizes
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