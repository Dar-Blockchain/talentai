import { useQuery } from "@tanstack/react-query";
import { publicBlogApi } from "../api";
import { PublicBlogListResponse, PublicBlogPost } from "../types";

export const usePublicBlogPostsQuery = (page: number, initialData?: PublicBlogListResponse) =>
  useQuery({
    queryKey: ["public", "blog", page],
    queryFn: () => publicBlogApi.fetchPosts(page),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    initialData: page === 1 ? initialData : undefined,
  });

export const usePublicBlogPostQuery = (slug: string | undefined, initialData?: PublicBlogPost, enabled = true) =>
  useQuery({
    queryKey: ["public", "blog", "detail", slug],
    queryFn: () => publicBlogApi.fetchPostBySlug(slug as string),
    enabled: Boolean(slug) && enabled,
    initialData,
  });
