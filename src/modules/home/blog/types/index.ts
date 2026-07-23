export interface PublicBlogPostSummary {
  _id: string;
  slug: string;
  title_en: string;
  title_fr: string;
  excerpt_en?: string;
  excerpt_fr?: string;
  coverImage_en?: string;
  coverImage_fr?: string;
  publishedAt: string;
}

export interface PublicBlogPost extends PublicBlogPostSummary {
  content_en: string;
  content_fr: string;
  /** Only present on the admin preview fetch — published posts fetched via the
   * public route are implicitly "published" and don't need this field. */
  status?: "draft" | "published";
}

export interface PublicBlogListResponse {
  data: PublicBlogPostSummary[];
  total: number;
  page: number;
  totalPages: number;
}
