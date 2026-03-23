module.exports = {
  swagger: "2.0",
  info: {
    title: "Job Applications API",
    description: "Job Application Management - CRUD operations for job applications",
    version: "1.0.0",
    contact: {
      name: "TalentAI Support",
      email: "support@talentai.com"
    }
  },
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
    }
  },
  paths: {
    "/job-applications": {
      post: {
        tags: ["Job Applications"],
        summary: "Create a new job application",
        description: "Submit a new job application for a candidate. The matchScore will be calculated automatically by AI agent based on CV analysis and job requirements.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "body",
            name: "body",
            description: "Job application data. Note: matchScore is calculated automatically and should NOT be provided.",
            required: true,
            schema: {
              $ref: "#/definitions/JobApplicationCreate"
            }
          }
        ],
        responses: {
          201: {
            description: "Job application created successfully. matchScore has been calculated by AI matching algorithm",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "Job application created successfully (match score calculated by AI)" },
                data: { $ref: "#/definitions/JobApplication" }
              }
            }
          },
          400: {
            description: "Validation error or duplicate application",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: { type: "string" }
              }
            }
          },
          409: {
            description: "Candidate has already applied for this job",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: { type: "string" }
              }
            }
          }
        }
      },
      get: {
        tags: ["Job Applications"],
        summary: "Get all job applications",
        description: "Retrieve all job applications with pagination and filters",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            type: "integer",
            default: 1,
            description: "Page number for pagination"
          },
          {
            in: "query",
            name: "limit",
            type: "integer",
            default: 10,
            description: "Number of results per page"
          },
          {
            in: "query",
            name: "status",
            type: "string",
            enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "interview_scheduled", "interview_completed"],
            description: "Filter by application status"
          },
          {
            in: "query",
            name: "profile",
            type: "string",
            description: "Filter by profile ID"
          },
          {
            in: "query",
            name: "post",
            type: "string",
            description: "Filter by post ID"
          },
          {
            in: "query",
            name: "company",
            type: "string",
            description: "Filter by company ID"
          }
        ],
        responses: {
          200: {
            description: "Applications retrieved successfully",
            schema: {
              $ref: "#/definitions/PaginatedResponse"
            }
          }
        }
      }
    },
    "/job-applications/{applicationId}": {
      get: {
        tags: ["Job Applications"],
        summary: "Get job application detail",
        description: "Retrieve a specific job application with all details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "applicationId",
            type: "string",
            required: true,
            description: "Application ID"
          }
        ],
        responses: {
          200: {
            description: "Job application found",
            schema: { $ref: "#/definitions/JobApplication" }
          },
          404: {
            description: "Job application not found"
          }
        }
      },
      patch: {
        tags: ["Job Applications"],
        summary: "Update job application",
        description: "Update job application status and details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "applicationId",
            type: "string",
            required: true,
            description: "Application ID"
          },
          {
            in: "body",
            name: "body",
            description: "Update data",
            required: true,
            schema: {
              $ref: "#/definitions/JobApplicationUpdate"
            }
          }
        ],
        responses: {
          200: {
            description: "Job application updated successfully",
            schema: { $ref: "#/definitions/JobApplication" }
          },
          404: {
            description: "Job application not found"
          }
        }
      },
      delete: {
        tags: ["Job Applications"],
        summary: "Delete job application",
        description: "Permanently delete a job application",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "applicationId",
            type: "string",
            required: true,
            description: "Application ID"
          }
        ],
        responses: {
          200: {
            description: "Job application deleted successfully"
          },
          404: {
            description: "Job application not found"
          }
        }
      }
    },
    "/job-applications/{applicationId}/withdraw": {
      post: {
        tags: ["Job Applications"],
        summary: "Withdraw job application",
        description: "Candidate withdraws their job application",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "applicationId",
            type: "string",
            required: true,
            description: "Application ID"
          }
        ],
        responses: {
          200: {
            description: "Job application withdrawn successfully"
          },
          404: {
            description: "Job application not found"
          }
        }
      }
    },
    "/job-applications/{applicationId}/archive": {
      post: {
        tags: ["Job Applications"],
        summary: "Archive job application",
        description: "Company archives a job application",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "applicationId",
            type: "string",
            required: true,
            description: "Application ID"
          }
        ],
        responses: {
          200: {
            description: "Job application archived successfully"
          },
          404: {
            description: "Job application not found"
          }
        }
      }
    },
    "/job-applications/post/{postId}": {
      get: {
        tags: ["Job Applications"],
        summary: "Get applications for a post",
        description: "Get all applications for a specific job post (public endpoint)",
        parameters: [
          {
            in: "path",
            name: "postId",
            type: "string",
            required: true,
            description: "Post ID"
          },
          {
            in: "query",
            name: "page",
            type: "integer",
            default: 1,
            description: "Page number"
          },
          {
            in: "query",
            name: "limit",
            type: "integer",
            default: 10,
            description: "Results per page"
          },
          {
            in: "query",
            name: "search",
            type: "string",
            description: "Search by candidate name"
          }
        ],
        responses: {
          200: {
            description: "Applications retrieved successfully",
            schema: {
              $ref: "#/definitions/PaginatedResponse"
            }
          }
        }
      }
    },
    "/job-applications/candidate/my": {
      get: {
        tags: ["Job Applications"],
        summary: "Get my applications (candidate)",
        description: "Get all applications submitted by the authenticated candidate",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            type: "integer",
            default: 1
          },
          {
            in: "query",
            name: "limit",
            type: "integer",
            default: 10
          },
          {
            in: "query",
            name: "status",
            type: "string",
            enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "interview_scheduled", "interview_completed"]
          }
        ],
        responses: {
          200: {
            description: "Candidate applications retrieved successfully",
            schema: {
              $ref: "#/definitions/PaginatedResponse"
            }
          }
        }
      }
    },
    "/job-applications/company/my": {
      get: {
        tags: ["Job Applications"],
        summary: "Get received applications (company)",
        description: "Get all applications received by the authenticated company",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            type: "integer",
            default: 1
          },
          {
            in: "query",
            name: "limit",
            type: "integer",
            default: 10
          },
          {
            in: "query",
            name: "post",
            type: "string",
            description: "Filter by post ID"
          },
          {
            in: "query",
            name: "status",
            type: "string",
            enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "interview_scheduled", "interview_completed"]
          },
          {
            in: "query",
            name: "search",
            type: "string",
            description: "Search by candidate name"
          }
        ],
        responses: {
          200: {
            description: "Company applications retrieved successfully",
            schema: {
              $ref: "#/definitions/PaginatedResponse"
            }
          }
        }
      }
    },
    "/job-applications/company/my/stats": {
      get: {
        tags: ["Job Applications"],
        summary: "Get application statistics (company)",
        description: "Get statistics about applications received by the authenticated company",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Statistics retrieved successfully",
            schema: {
              $ref: "#/definitions/ApplicationStats"
            }
          }
        }
      }
    }
  },
  definitions: {
    JobApplication: {
      type: "object",
      required: ["profile", "post", "company"],
      properties: {
        _id: {
          type: "string",
          description: "Unique application ID"
        },
        profile: {
          type: "object",
          description: "Candidate profile",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            profilePicture: { type: "string" }
          }
        },
        post: {
          type: "object",
          description: "Job post",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" }
          }
        },
        company: {
          type: "object",
          description: "Company",
          properties: {
            _id: { type: "string" },
            companyName: { type: "string" },
            email: { type: "string" }
          }
        },
        cvAnalysis: {
          type: "string",
          description: "CV analysis reference ID"
        },
        status: {
          type: "string",
          enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "interview_scheduled", "interview_completed"],
          default: "applied",
          description: "Current application status"
        },
        applicationMessage: {
          type: "string",
          description: "Candidate's message when applying"
        },
        matchScore: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Match score between candidate and job"
        },
        appliedAt: {
          type: "string",
          format: "date-time",
          description: "Timestamp when application was submitted"
        },
        viewedAt: {
          type: "string",
          format: "date-time",
          description: "Timestamp when company viewed application"
        },
        shortlistedAt: {
          type: "string",
          format: "date-time",
          description: "Timestamp when candidate was shortlisted"
        },
        interviewAssessment: {
          type: "string",
          description: "Interview assessment reference ID"
        },
        assessmentScore: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Score from interview assessment"
        },
        companyNotes: {
          type: "string",
          description: "Internal notes from company"
        },
        rejectionReason: {
          type: "string",
          description: "Reason for rejection if rejected"
        },
        isWithdrawn: {
          type: "boolean",
          default: false,
          description: "Whether application was withdrawn"
        },
        withdrawnAt: {
          type: "string",
          format: "date-time",
          description: "Timestamp when withdrawn"
        },
        isArchived: {
          type: "boolean",
          default: false,
          description: "Whether application is archived"
        },
        createdAt: {
          type: "string",
          format: "date-time"
        },
        updatedAt: {
          type: "string",
          format: "date-time"
        }
      }
    },
    JobApplicationCreate: {
      type: "object",
      required: ["profile", "post", "company"],
      properties: {
        profile: {
          type: "string",
          description: "Candidate profile ID"
        },
        post: {
          type: "string",
          description: "Job post ID"
        },
        company: {
          type: "string",
          description: "Company user ID"
        },
        cvAnalysis: {
          type: "string",
          description: "CV analysis ID (optional)"
        },
        applicationMessage: {
          type: "string",
          description: "Optional message from candidate"
        }
      }
    },
    JobApplicationUpdate: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "interview_scheduled", "interview_completed"],
          description: "Update status"
        },
        companyNotes: {
          type: "string",
          description: "Update company notes"
        },
        rejectionReason: {
          type: "string",
          description: "Set rejection reason if rejecting"
        },
        interviewAssessment: {
          type: "string",
          description: "Link interview assessment"
        },
        assessmentScore: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Set assessment score"
        },
        matchScore: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Update match score"
        }
      }
    },
    PaginatedResponse: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: true
        },
        message: {
          type: "string",
          example: "Applications retrieved successfully"
        },
        data: {
          type: "array",
          items: {
            $ref: "#/definitions/JobApplication"
          }
        },
        pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 25 },
            pages: { type: "integer", example: 3 },
            hasNextPage: { type: "boolean", example: true },
            hasPrevPage: { type: "boolean", example: false }
          }
        }
      }
    },
    ApplicationStats: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: true
        },
        message: {
          type: "string",
          example: "Statistics retrieved successfully"
        },
        data: {
          type: "object",
          properties: {
            totalApplications: { type: "integer" },
            byStatus: {
              type: "object",
              properties: {
                applied: { type: "integer" },
                viewed: { type: "integer" },
                shortlisted: { type: "integer" },
                rejected: { type: "integer" },
                accepted: { type: "integer" },
                interview_scheduled: { type: "integer" },
                interview_completed: { type: "integer" }
              }
            },
            averageMatchScore: { type: "number" }
          }
        }
      }
    }
  }
};
