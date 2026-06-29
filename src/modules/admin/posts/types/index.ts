export interface AdminPost {
  _id: string;
  jobDetails: {
    title: string;
    location?: string;
    employmentType?: string;
  };
  user?: {
    _id: string;
    username?: string;
    email?: string;
  };
  status: "draft" | "open" | "closed";
  archived: boolean;
  archivedAt?: string | null;
  createdAt: string;
}

export interface FetchAdminPostsParams {
  page?: number;
  limit?: number;
  status?: string;
  archived?: boolean;
  search?: string;
}

export interface FetchAdminPostsResponse {
  data: AdminPost[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
