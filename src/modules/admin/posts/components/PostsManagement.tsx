import React, { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  DeleteForever as DeleteForeverIcon,
  Search as SearchIcon,
  WorkOutline as WorkOutlineIcon,
  CheckCircleOutline as OpenIcon,
  DraftsOutlined as DraftIcon,
  HighlightOff as ClosedIcon,
  TrackChangesOutlined as ThresholdIcon,
} from '@mui/icons-material';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Card } from '@/modules/shared/ui/shadcn/card';
import {
  ADMIN_NEUTRAL,
  ADMIN_TABLE_HEAD_CELL_SX,
  ADMIN_TABLE_ROW_SX,
  AdminPageHeading,
  AdminStatCard,
  AdminTableErrorRow,
  ConfirmDialog,
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
  open: { color: '#10B981', bg: '#ECFDF5' },
  draft: { color: '#64748B', bg: '#F1F5F9' },
  closed: { color: '#EF4444', bg: '#FEF2F2' },
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

const PostsManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { data, isLoading: loading, isError, refetch } = useAdminPostsQuery({
    page: page + 1,
    limit: rowsPerPage,
    status: statusFilter || undefined,
    search: debouncedSearchQuery || undefined,
  });

  const posts = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const stats = data?.stats;

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuPost, setMenuPost] = useState<AdminPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);
  const [thresholdTarget, setThresholdTarget] = useState<AdminPost | null>(null);
  const [thresholdValue, setThresholdValue] = useState(60);

  const archiveMutation = useArchivePostMutation();
  const unarchiveMutation = useUnarchivePostMutation();
  const deleteMutation = useDeletePostMutation();
  const updateThresholdMutation = useUpdatePostThresholdMutation();

  const handleStatusChange = useCallback((event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>, post: AdminPost) => {
    setMenuAnchor(event.currentTarget);
    setMenuPost(post);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuPost(null);
  }, []);

  const handleArchiveToggle = useCallback(() => {
    if (!menuPost) return;
    if (menuPost.archived) {
      unarchiveMutation.mutate(menuPost._id);
    } else {
      archiveMutation.mutate(menuPost._id);
    }
    closeMenu();
  }, [menuPost, archiveMutation, unarchiveMutation, closeMenu]);

  const handleDeleteRequest = useCallback(() => {
    if (!menuPost) return;
    setDeleteTarget(menuPost);
    closeMenu();
  }, [menuPost, closeMenu]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteMutation]);

  const handleEditThresholdRequest = useCallback(() => {
    if (!menuPost) return;
    setThresholdValue(menuPost.thresholdScore ?? 60);
    setThresholdTarget(menuPost);
    closeMenu();
  }, [menuPost, closeMenu]);

  const handleSaveThreshold = useCallback(() => {
    if (!thresholdTarget) return;
    updateThresholdMutation.mutate(
      { postId: thresholdTarget._id, thresholdScore: thresholdValue },
      { onSuccess: () => setThresholdTarget(null) },
    );
  }, [thresholdTarget, thresholdValue, updateThresholdMutation]);

  return (
    <div>
      <AdminPageHeading title="Posts" subtitle={`${totalCount.toLocaleString()} job posts on the platform`} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <AdminStatCard icon={WorkOutlineIcon} value={(stats?.total ?? 0).toLocaleString()} label="Total Posts" loading={loading && !stats} />
        <AdminStatCard icon={OpenIcon} value={(stats?.open ?? 0).toLocaleString()} label="Open" loading={loading && !stats} />
        <AdminStatCard icon={DraftIcon} value={(stats?.draft ?? 0).toLocaleString()} label="Draft" loading={loading && !stats} />
        <AdminStatCard icon={ClosedIcon} value={(stats?.closed ?? 0).toLocaleString()} label="Closed" loading={loading && !stats} />
        <AdminStatCard icon={ArchiveIcon} value={(stats?.archived ?? 0).toLocaleString()} label="Archived" loading={loading && !stats} />
      </div>

      <Card className="mb-6 overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-[1_1_220px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <SearchIcon style={{ fontSize: 18 }} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full text-[13px] outline-none placeholder:text-slate-400"
            />
          </div>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="post-status-filter-label">Status</InputLabel>
            <Select
              labelId="post-status-filter-label"
              id="post-status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusChange}
            >
              <SelectMenuItem value="">
                <em>All Statuses</em>
              </SelectMenuItem>
              <SelectMenuItem value="draft">Draft</SelectMenuItem>
              <SelectMenuItem value="open">Open</SelectMenuItem>
              <SelectMenuItem value="closed">Closed</SelectMenuItem>
            </Select>
          </FormControl>
          {loading && <CircularProgress size={20} sx={{ color: ADMIN_NEUTRAL }} />}
          <div className="flex-1" />
          <span className="text-[13px] text-slate-500">{totalCount.toLocaleString()} total</span>
        </div>
      </Card>

      <Card className="overflow-hidden py-0 gap-0">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Title</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Company</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Status</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Threshold</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Archived</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Created</TableCell>
                <TableCell sx={ADMIN_TABLE_HEAD_CELL_SX}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <AdminTableErrorRow message="Failed to load posts." onRetry={() => refetch()} />
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <span className="text-[13px] text-slate-500">No posts found</span>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => {
                  const tone = STATUS_TONE[post.status] ?? STATUS_TONE.draft;
                  return (
                    <TableRow key={post._id} hover sx={ADMIN_TABLE_ROW_SX}>
                      <TableCell>
                        <span className="text-[13px] font-medium text-slate-900">
                          {post.jobDetails?.title || 'Untitled Post'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-[13px] font-medium text-slate-900">{post.user?.username || 'Unknown'}</div>
                          <div className="text-[11px] text-slate-400">{post.user?.email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-transparent font-semibold capitalize"
                          style={{ background: tone.bg, color: tone.color }}
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] font-semibold" style={{ color: thresholdColor(post.thresholdScore ?? 60) }}>
                          {post.thresholdScore ?? 60}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {post.archived ? (
                          <Badge variant="outline" className="border-transparent bg-slate-100 font-medium text-slate-500">
                            Archived
                          </Badge>
                        ) : (
                          <span className="text-[12px] text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] text-slate-500">{formatDate(post.createdAt)}</span>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => openMenu(e, post)} sx={{ color: ADMIN_NEUTRAL }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Card>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleEditThresholdRequest}>
          <ListItemIcon>
            <ThresholdIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit threshold</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleArchiveToggle}>
          <ListItemIcon>
            {menuPost?.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{menuPost?.archived ? 'Unarchive' : 'Archive'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteRequest} sx={{ color: '#DC2626' }}>
          <ListItemIcon sx={{ color: '#DC2626' }}>
            <DeleteForeverIcon fontSize="small" />
          </ListItemIcon>
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
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600 }}>
          Edit CV match threshold
        </DialogTitle>
        <DialogContent>
          <p className="text-[12px] text-slate-500 mb-4">
            Candidates scoring below this threshold on &quot;{thresholdTarget?.jobDetails?.title || 'this post'}&quot; are automatically flagged for review.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Slider
                value={thresholdValue}
                onChange={(_, v) => setThresholdValue(v as number)}
                min={0}
                max={100}
                step={5}
                marks={THRESHOLD_MARKS}
                sx={{
                  color: thresholdColor(thresholdValue),
                  '& .MuiSlider-thumb': { width: 18, height: 18 },
                  '& .MuiSlider-markLabel': { fontSize: '11px', color: '#9CA3AF' },
                }}
              />
            </div>
            <div
              className="min-w-[52px] text-center rounded-lg px-3 py-1.5"
              style={{
                background: `${thresholdColor(thresholdValue)}15`,
                border: `1px solid ${thresholdColor(thresholdValue)}40`,
              }}
            >
              <span className="text-[16px] font-extrabold" style={{ color: thresholdColor(thresholdValue) }}>
                {thresholdValue}%
              </span>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setThresholdTarget(null)} sx={{ color: ADMIN_NEUTRAL }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveThreshold}
            disabled={updateThresholdMutation.isPending}
            variant="contained"
            sx={{ boxShadow: 'none' }}
          >
            {updateThresholdMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(PostsManagement);
