import React, { useState, useCallback, useEffect } from 'react';
import {
  DropdownMenuItem,
} from '@/modules/shared/ui/shadcn/dropdown-menu';
import { MoreOptionsMenu } from '@/modules/shared/ui/MoreOptionsMenu';
import { Dialog, DialogContent, DialogFooter } from '@/modules/shared/ui/shadcn/dialog';
import { Slider } from '@/modules/shared/ui/shadcn/slider';
import { Button } from '@/modules/shared/ui/shadcn/button';
import {
  MoreVertical as MoreVertIcon,
  Archive as ArchiveIcon,
  ArchiveRestore as UnarchiveIcon,
  Trash2 as DeleteForeverIcon,
  Briefcase as WorkOutlineIcon,
  CheckCircle2 as OpenIcon,
  FileText as DraftIcon,
  XCircle as ClosedIcon,
  Target as ThresholdIcon,
  Search,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Pagination } from '@/modules/shared/ui/shadcn/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import {
  ADMIN_NEUTRAL, AdminPageHeading, AdminStatCard, AdminTableErrorRow, ConfirmDialog,
} from '@/modules/admin/shared';
import { useAdminPostsQuery, useArchivePostMutation, useUnarchivePostMutation, useDeletePostMutation, useUpdatePostThresholdMutation } from '../queries';
import { AdminPost } from '../types';

const THRESHOLD_MARKS = [
  { value: 0, label: '0%' },
  { value: 50, label: '50%' },
  { value: 100, label: '100%' },
];

const thresholdColor = (score: number) => (score >= 70 ? '#16A34A' : score >= 40 ? '#D97706' : '#DC2626');

const STATUS_TONE: Record<string, { color: string; bg: string }> = {
  open:   { color: '#10B981', bg: '#ECFDF5' },
  draft:  { color: '#0D9488', bg: '#F0FDFA' },
  closed: { color: '#EF4444', bg: '#FEF2F2' },
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return '—'; }
};

const TH = 'px-4 py-3 text-left text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100';
const TD = 'px-4 py-3 text-[13px] text-slate-700 border-b border-slate-100';

const PostsManagement: React.FC = () => {
  const [searchQuery, setSearchQuery]     = useState('');
  const [debounced, setDebounced]         = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [page, setPage]                   = useState(1);
  const [rowsPerPage, setRowsPerPage]     = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data, isLoading: loading, isError, refetch } = useAdminPostsQuery({
    page,
    limit: rowsPerPage,
    status: statusFilter || undefined,
    search: debounced || undefined,
  });

  const posts      = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const stats      = data?.stats;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const [deleteTarget, setDeleteTarget]     = useState<AdminPost | null>(null);
  const [thresholdTarget, setThresholdTarget] = useState<AdminPost | null>(null);
  const [thresholdValue, setThresholdValue] = useState(60);

  const archiveMutation          = useArchivePostMutation();
  const unarchiveMutation        = useUnarchivePostMutation();
  const deleteMutation           = useDeletePostMutation();
  const updateThresholdMutation  = useUpdatePostThresholdMutation();

  const handleArchiveToggle = useCallback((post: AdminPost) => {
    post.archived ? unarchiveMutation.mutate(post._id) : archiveMutation.mutate(post._id);
  }, [archiveMutation, unarchiveMutation]);

  const handleDeleteRequest  = useCallback((post: AdminPost) => { setDeleteTarget(post); }, []);
  const handleConfirmDelete  = useCallback(() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) }); }, [deleteTarget, deleteMutation]);
  const handleEditThreshold  = useCallback((post: AdminPost) => { setThresholdValue(post.thresholdScore ?? 60); setThresholdTarget(post); }, []);
  const handleSaveThreshold  = useCallback(() => { if (thresholdTarget) updateThresholdMutation.mutate({ postId: thresholdTarget._id, thresholdScore: thresholdValue }, { onSuccess: () => setThresholdTarget(null) }); }, [thresholdTarget, thresholdValue, updateThresholdMutation]);

  return (
    <div className="space-y-6">
      <AdminPageHeading title="Posts" subtitle={`${totalCount.toLocaleString()} job posts on the platform`} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <AdminStatCard icon={WorkOutlineIcon} value={(stats?.total    ?? 0).toLocaleString()} label="Total Posts" loading={loading && !stats} />
        <AdminStatCard icon={OpenIcon}        value={(stats?.open     ?? 0).toLocaleString()} label="Open"        loading={loading && !stats} />
        <AdminStatCard icon={DraftIcon}       value={(stats?.draft    ?? 0).toLocaleString()} label="Draft"       loading={loading && !stats} />
        <AdminStatCard icon={ClosedIcon}      value={(stats?.closed   ?? 0).toLocaleString()} label="Closed"      loading={loading && !stats} />
        <AdminStatCard icon={ArchiveIcon}     value={(stats?.archived ?? 0).toLocaleString()} label="Archived"    loading={loading && !stats} />
      </div>

      {/* Filters */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_220px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-teal-400 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by job title..."
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {loading && <Loader2 size={16} className="animate-spin text-teal-500" />}
          <div className="flex-1" />
          <span className="text-[12px] text-slate-400">{totalCount.toLocaleString()} total</span>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Company</th>
                <th className={TH}>Status</th>
                <th className={TH}>Threshold</th>
                <th className={TH}>Archived</th>
                <th className={TH}>Created</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={7} className="py-8 text-center"><AdminTableErrorRow message="Failed to load posts." onRetry={() => refetch()} /></td></tr>
              ) : loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-slate-400">Loading...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-slate-400">No posts found</td></tr>
              ) : posts.map((post) => {
                const tone = STATUS_TONE[post.status] ?? STATUS_TONE.draft;
                return (
                  <tr key={post._id} className="hover:bg-teal-50/40 transition-colors">
                    <td className={TD}><span className="font-medium text-slate-900">{post.jobDetails?.title || 'Untitled Post'}</span></td>
                    <td className={TD}>
                      <div className="font-medium text-slate-900">{post.user?.username || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-400">{post.user?.email || ''}</div>
                    </td>
                    <td className={TD}>
                      <Badge variant="outline" className="border-transparent font-semibold capitalize" style={{ background: tone.bg, color: tone.color }}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className={TD}>
                      <span className="font-semibold" style={{ color: thresholdColor(post.thresholdScore ?? 60) }}>{post.thresholdScore ?? 60}%</span>
                    </td>
                    <td className={TD}>
                      {post.archived
                        ? <Badge variant="outline" className="border-transparent bg-slate-100 font-medium text-slate-500">Archived</Badge>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className={TD}><span className="text-slate-500">{formatDate(post.createdAt)}</span></td>
                    <td className={TD}>
                      <MoreOptionsMenu icon={MoreVertIcon} iconSize={18} className="rounded-md text-[#0D9488] hover:bg-slate-100">
                          <DropdownMenuItem onClick={() => handleEditThreshold(post)} className="gap-2">
                            <ThresholdIcon size={18} /> Edit threshold
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveToggle(post)} className="gap-2">
                            {post.archived ? <UnarchiveIcon size={18} /> : <ArchiveIcon size={18} />}
                            {post.archived ? 'Unarchive' : 'Archive'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRequest(post)} variant="destructive" className="gap-2">
                            <DeleteForeverIcon size={18} /> Delete permanently
                          </DropdownMenuItem>
                      </MoreOptionsMenu>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete post permanently?"
        description={`This will permanently delete "${deleteTarget?.jobDetails?.title || 'this post'}" along with all its job applications and interview assessments. This cannot be undone.`}
        confirmLabel="Delete permanently"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Dialog open={Boolean(thresholdTarget)} onOpenChange={(next) => { if (!next) setThresholdTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <h2 className="text-[16px] font-semibold text-slate-900">Edit CV match threshold</h2>
          <p className="text-[12px] text-slate-500">
            Candidates scoring below this threshold on &quot;{thresholdTarget?.jobDetails?.title || 'this post'}&quot; are automatically flagged for review.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Slider
                value={[thresholdValue]}
                onValueChange={(v) => setThresholdValue(v[0])}
                min={0} max={100} step={5}
                className="[&_[data-slot=slider-range]]:bg-[var(--threshold-color)] [&_[data-slot=slider-thumb]]:border-[var(--threshold-color)]"
                style={{ ['--threshold-color' as string]: thresholdColor(thresholdValue) }}
              />
              <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
                {THRESHOLD_MARKS.map((m) => <span key={m.value}>{m.label}</span>)}
              </div>
            </div>
            <div className="min-w-[52px] text-center rounded-lg px-3 py-1.5" style={{ background: `${thresholdColor(thresholdValue)}15`, border: `1px solid ${thresholdColor(thresholdValue)}40` }}>
              <span className="text-[16px] font-extrabold" style={{ color: thresholdColor(thresholdValue) }}>{thresholdValue}%</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setThresholdTarget(null)} variant="ghost" style={{ color: ADMIN_NEUTRAL }}>Cancel</Button>
            <Button onClick={handleSaveThreshold} disabled={updateThresholdMutation.isPending} variant="default" className="shadow-none">
              {updateThresholdMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(PostsManagement);
