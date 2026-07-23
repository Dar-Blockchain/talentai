import React, { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import {
  MoreVertical as MoreVertIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  Eye as PublishIcon,
  EyeOff as UnpublishIcon,
  ExternalLink as PreviewIcon,
  Plus as PlusIcon,
  Search,
  Loader2,
  Newspaper,
} from "lucide-react";
import { AdminPageHeading, AdminTableErrorRow, ConfirmDialog } from "@/modules/admin/shared";
import { emitToast } from "@/utils/toastEmitter";
import {
  useAdminBlogPostsQuery, useDeleteBlogPostMutation, usePublishBlogPostMutation, useUnpublishBlogPostMutation,
} from "../queries";
import { AdminBlogPost } from "../types";
import BlogPostFormDialog from "./BlogPostFormDialog";

const STATUS_TONE: Record<string, { color: string; bg: string }> = {
  published: { color: "#10B981", bg: "#ECFDF5" },
  draft: { color: "#0D9488", bg: "#F0FDFA" },
};

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
};

const TH = "px-4 py-3 text-left text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100";
const TD = "px-4 py-3 text-[13px] text-slate-700 border-b border-slate-100";

const BlogManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data, isLoading: loading, isError, refetch } = useAdminBlogPostsQuery({
    page,
    limit: rowsPerPage,
    status: statusFilter || undefined,
    search: debounced || undefined,
  });

  const posts = data?.data ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null);

  const deleteMutation = useDeleteBlogPostMutation();
  const publishMutation = usePublishBlogPostMutation();
  const unpublishMutation = useUnpublishBlogPostMutation();

  const handleCreate = useCallback(() => { setEditingPost(null); setFormOpen(true); }, []);
  const handleEdit = useCallback((post: AdminBlogPost) => { setEditingPost(post); setFormOpen(true); }, []);
  const handlePreview = useCallback((post: AdminBlogPost) => {
    window.open(`/blog/${post.slug}?preview=1`, "_blank", "noopener,noreferrer");
  }, []);
  const handleDeleteRequest = useCallback((post: AdminBlogPost) => setDeleteTarget(post), []);
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => { emitToast({ message: "Post deleted.", severity: "success" }); setDeleteTarget(null); },
      onError: (err) => emitToast({ message: err instanceof Error ? err.message : "Failed to delete post.", severity: "error" }),
    });
  }, [deleteTarget, deleteMutation]);

  const handleToggleStatus = useCallback((post: AdminBlogPost) => {
    const mutation = post.status === "published" ? unpublishMutation : publishMutation;
    mutation.mutate(post._id, {
      onError: (err) => emitToast({ message: err instanceof Error ? err.message : "Failed to update post status.", severity: "error" }),
    });
  }, [publishMutation, unpublishMutation]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <AdminPageHeading title="Blog" subtitle={`${totalCount.toLocaleString()} posts on the landing page blog`} />
        <Button onClick={handleCreate} variant="default" className="shadow-none gap-2">
          <PlusIcon size={16} /> New post
        </Button>
      </div>

      <Card className="overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_220px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-teal-400 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full text-[13px] outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}
          >
            <SelectTrigger size="sm" className="text-[13px] text-slate-600 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          {loading && <Loader2 size={16} className="animate-spin text-teal-500" />}
          <div className="flex-1" />
          <span className="text-[12px] text-slate-400">{totalCount.toLocaleString()} total</span>
        </div>
      </Card>

      <Card className="overflow-hidden py-0 gap-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Status</th>
                <th className={TH}>Published</th>
                <th className={TH}>Updated</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={5} className="py-8 text-center"><AdminTableErrorRow message="Failed to load blog posts." onRetry={() => refetch()} /></td></tr>
              ) : loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-[13px] text-slate-400">Loading...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Newspaper size={28} />
                    <span className="text-[13px]">No blog posts yet</span>
                  </div>
                </td></tr>
              ) : posts.map((post) => {
                const tone = STATUS_TONE[post.status] ?? STATUS_TONE.draft;
                return (
                  <tr key={post._id} className="hover:bg-teal-50/40 transition-colors">
                    <td className={TD}>
                      <span className="font-medium text-slate-900">{post.title_en || post.title_fr || "Untitled post"}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {post.title_en && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide border border-slate-200 rounded px-1">EN</span>}
                        {post.title_fr && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide border border-slate-200 rounded px-1">FR</span>}
                      </div>
                    </td>
                    <td className={TD}>
                      <Badge variant="outline" className="border-transparent font-semibold capitalize" style={{ background: tone.bg, color: tone.color }}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className={TD}><span className="text-slate-500">{formatDate(post.publishedAt)}</span></td>
                    <td className={TD}><span className="text-slate-500">{formatDate(post.updatedAt)}</span></td>
                    <td className={TD}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-1.5 hover:bg-slate-100 text-slate-500">
                            <MoreVertIcon size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(post)} className="gap-2">
                            <EditIcon size={16} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePreview(post)} className="gap-2">
                            <PreviewIcon size={16} /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(post)} className="gap-2">
                            {post.status === "published" ? <UnpublishIcon size={16} /> : <PublishIcon size={16} />}
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRequest(post)} variant="destructive" className="gap-2">
                            <DeleteIcon size={16} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[12px] text-slate-400">{totalCount.toLocaleString()} posts</span>
          <div className="flex items-center gap-3">
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}
            >
              <SelectTrigger size="sm" className="text-[12px] text-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
              </SelectContent>
            </Select>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size="sm" />
          </div>
        </div>
      </Card>

      <BlogPostFormDialog open={formOpen} post={editingPost} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete blog post?"
        description={`This will permanently delete "${deleteTarget?.title_en || deleteTarget?.title_fr || "this post"}". This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default React.memo(BlogManagement);
