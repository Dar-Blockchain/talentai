import React, { useState, useCallback, useEffect } from 'react';
import {
  Menu, MenuItem, ListItemIcon, ListItemText,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  DeleteForever as DeleteForeverIcon,
  WorkOutline as WorkOutlineIcon,
  CheckCircleOutline as OpenIcon,
  DraftsOutlined as DraftIcon,
  HighlightOff as ClosedIcon,
  TrackChangesOutlined as ThresholdIcon,
} from '@mui/icons-material';
import { Search, Loader2 } from 'lucide-react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { SimplePagination } from '@/modules/shared/ui/shadcn/pagination-simple';
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

  const [menuAnchor, setMenuAnchor]         = useState<HTMLElement | null>(null);
  const [menuPost, setMenuPost]             = useState<AdminPost | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<AdminPost | null>(null);
  const [thresholdTarget, setThresholdTarget] = useState<AdminPost | null>(null);
  const [thresholdValue, setThresholdValue] = useState(60);

  const archiveMutation          = useArchivePostMutation();
  const unarchiveMutation        = useUnarchivePostMutation();
  const deleteMutation           = useDeletePostMutation();
  const updateThresholdMutation  = useUpdatePostThresholdMutation();

  const openMenu  = useCallback((e: React.MouseEvent<HTMLElement>, post: AdminPost) => { setMenuAnchor(e.currentTarget); setMenuPost(post); }, []);
  const closeMenu = useCallback(() => { setMenuAnchor(null); setMenuPost(null); }, []);

  const handleArchiveToggle = useCallback(() => {
    if (!menuPost) return;
    menuPost.archived ? unarchiveMutation.mutate(menuPost._id) : archiveMutation.mutate(menuPost._id);
    closeMenu();
  }, [menuPost, archiveMutation, unarchiveMutation, closeMenu]);

  const handleDeleteRequest  = useCallback(() => { if (menuPost) { setDeleteTarget(menuPost); closeMenu(); } }, [menuPost, closeMenu]);
  const handleConfirmDelete  = useCallback(() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) }); }, [deleteTarget, deleteMutation]);
  const handleEditThreshold  = useCallback(() => { if (menuPost) { setThresholdValue(menuPost.thresholdScore ?? 60); setThresholdTarget(menuPost); closeMenu(); } }, [menuPost, closeMenu]);
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
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-[13px] border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-teal-400 text-slate-600 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
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
                      <IconButton size="small" onClick={(e) => openMenu(e, post)} sx={{ color: ADMIN_NEUTRAL }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
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
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="text-[12px] text-slate-600 border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-teal-400"
            >
              {[5, 10, 25].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} size="sm" />
          </div>
        </div>
      </Card>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleEditThreshold}>
          <ListItemIcon><ThresholdIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit threshold</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleArchiveToggle}>
          <ListItemIcon>{menuPost?.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}</ListItemIcon>
          <ListItemText>{menuPost?.archived ? 'Unarchive' : 'Archive'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteRequest} sx={{ color: '#DC2626' }}>
          <ListItemIcon sx={{ color: '#DC2626' }}><DeleteForeverIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete permanently</ListItemText>
        </MenuItem>
      </Menu>

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

      <Dialog open={Boolean(thresholdTarget)} onClose={() => setThresholdTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600 }}>Edit CV match threshold</DialogTitle>
        <DialogContent>
          <p className="text-[12px] text-slate-500 mb-4">
            Candidates scoring below this threshold on &quot;{thresholdTarget?.jobDetails?.title || 'this post'}&quot; are automatically flagged for review.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Slider
                value={thresholdValue}
                onChange={(_, v) => setThresholdValue(v as number)}
                min={0} max={100} step={5}
                marks={THRESHOLD_MARKS}
                sx={{
                  color: thresholdColor(thresholdValue),
                  '& .MuiSlider-thumb': { width: 18, height: 18 },
                  '& .MuiSlider-markLabel': { fontSize: '11px', color: '#9CA3AF' },
                }}
              />
            </div>
            <div className="min-w-[52px] text-center rounded-lg px-3 py-1.5" style={{ background: `${thresholdColor(thresholdValue)}15`, border: `1px solid ${thresholdColor(thresholdValue)}40` }}>
              <span className="text-[16px] font-extrabold" style={{ color: thresholdColor(thresholdValue) }}>{thresholdValue}%</span>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setThresholdTarget(null)} sx={{ color: ADMIN_NEUTRAL }}>Cancel</Button>
          <Button onClick={handleSaveThreshold} disabled={updateThresholdMutation.isPending} variant="contained" sx={{ boxShadow: 'none' }}>
            {updateThresholdMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(PostsManagement);
