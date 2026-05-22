export type PostStatus = "open" | "active" | "draft" | "closed" | "expired";

export interface JobPost {
  _id: string;
  status: string;
  creationType: "ai" | "pipeline" | "manual";
  createdAt: string;
  expirationDate?: string;
  jobDetails: {
    title?: string;
    description?: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
  };
  user?: { _id: string };
}
