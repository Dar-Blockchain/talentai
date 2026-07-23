export type BlogPostStatus = "draft" | "published";

export interface AdminBlogPost {
  _id: string;
  slug: string;
  title_en: string;
  title_fr: string;
  excerpt_en?: string;
  excerpt_fr?: string;
  content_en: string;
  content_fr: string;
  coverImage_en?: string;
  coverImage_fr?: string;
  status: BlogPostStatus;
  publishedAt?: string | null;
  createdBy?: { _id: string; username?: string; email?: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchAdminBlogPostsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface FetchAdminBlogPostsResponse {
  data: AdminBlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BlogPostInput {
  title_en?: string;
  title_fr?: string;
  excerpt_en?: string;
  excerpt_fr?: string;
  content_en?: string;
  content_fr?: string;
  coverImage_en?: string;
  coverImage_fr?: string;
  status: BlogPostStatus;
}
