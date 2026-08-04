export type StatusFilter = "all" | "active" | "draft" | "expired";
export type SortOption   = "newest" | "oldest" | "title-asc" | "title-desc";
export type PostStatus   = "open" | "active" | "draft" | "closed" | "expired";

export interface PaginationInfo {
  totalPages: number;
  total?: number;
}

export interface JobPost {
  _id: string;
  status: string;
  creationType: "ai" | "manual";
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
  applicationsCount?: number;
}
