import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Eye as VisibilityIcon,
  X as CloseIcon,
  Trophy as ExcellentIcon,
  TrendingUp as SatisfactoryIcon,
  TrendingDown as NeedsImprovementIcon,
  ClipboardList as AllIcon,
  MoreVertical as MoreVertIcon,
  Archive as ArchiveIcon,
  ArchiveRestore as UnarchiveIcon,
  Trash2 as DeleteForeverIcon,
  Search,
} from 'lucide-react';
import { useAdminPostAssessmentsQuery, useArchivePostAssessmentMutation, useUnarchivePostAssessmentMutation, useDeletePostAssessmentMutation } from '../queries';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Tabs, TabsList, TabsTrigger } from '@/modules/shared/ui/shadcn/tabs';
import { Pagination } from '@/modules/shared/ui/shadcn/pagination';
import { ScoreBadge, scoreTone, ADMIN_NEUTRAL, ADMIN_RADIUS, AdminPageHeading, AdminStatCard, AdminTableErrorRow, ConfirmDialog } from '@/modules/admin/shared';

interface PostInterviewAssessmentData {
  _id: string;
  post: { _id: string; jobDetails?: { title?: string; location?: string; employmentType?: string } };
  candidate: { _id: string; username?: string; email?: string };
  company: { _id: string; username?: string; email?: string };
  interviewData?: {
    finalReport?: {
      coverage?: { overall?: number; areas?: Record<string, any> };
      scores?: { overall?: number };
      recommendations?: string[];
      summary?: string;
    };
    analytics?: { duration?: number; messageCount?: number; coveragePercentage?: number };
    sessionId?: string;
    interviewType?: string;
  };
  metadata?: { skill?: string; role?: string; proficiency?: string; exportedAt?: string };
  status?: string;
  stage?: string;
  overallScore?: number;
  createdAt: string;
  updatedAt?: string;
  archived?: boolean;
}

interface PostInterviewAssessmentsProps { autoFetch?: boolean; }

const TH = 'px-4 py-3 text-left text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100';
const TD = 'px-4 py-3 text-[13px] text-slate-700 border-b border-slate-100';

const SCORE_TABS = ['All', 'Excellent (70%+)', 'Satisfactory', 'Needs Work'];

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};

const PostInterviewAssessments: React.FC<PostInterviewAssessmentsProps> = ({ autoFetch = true }) => {
  const [companies, setCompanies]           = useState<{ _id: string; username: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchQuery, setSearchQuery]       = useState('');
  const [debounced, setDebounced]           = useState('');
  const [scoreTab, setScoreTab]             = useState(0);
  const [page, setPage]                     = useState(1);
  const [rowsPerPage, setRowsPerPage]       = useState(10);

  const [selectedAssessment, setSelectedAssessment] = useState<PostInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen]   = useState(false);
  const [menuAnchor, setMenuAnchor]                 = useState<HTMLElement | null>(null);
  const [menuAssessment, setMenuAssessment]         = useState<PostInterviewAssessmentData | null>(null);
  const [deleteTarget, setDeleteTarget]             = useState<PostInterviewAssessmentData | null>(null);

  const archiveMutation   = useArchivePostAssessmentMutation();
  const unarchiveMutation = useUnarchivePostAssessmentMutation();
  const deleteMutation    = useDeletePostAssessmentMutation();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data, isLoading: loading, isError, refetch } = useAdminPostAssessmentsQuery(
    { page, limit: rowsPerPage, company: selectedCompany || undefined },
    autoFetch,
  );
  const results    = (data?.items ?? []) as PostInterviewAssessmentData[];
  const totalCount = data?.total ?? 0;
  const stats      = data?.stats;

  useEffect(() => {
    if (!selectedCompany && results.length > 0) {
      const map = new Map<string, { _id: string; username: string }>();
      results.forEach((a) => { if (a.company?._id && a.company?.username) map.set(a.company._id, { _id: a.company._id, username: a.company.username }); });
      setCompanies(Array.from(map.values()));
    }
  }, [results, selectedCompany]);

  const getOverallScore = (a: PostInterviewAssessmentData) =>
    a.overallScore ?? a.interviewData?.finalReport?.coverage?.overall ?? a.interviewData?.finalReport?.scores?.overall ?? 0;

  const filteredResults = useMemo(() => results.filter((a) => {
    if (debounced) {
      const q = debounced.toLowerCase();
      if (![a.candidate?.username, a.candidate?.email, a.post?.jobDetails?.title, a.company?.username].some((v) => v?.toLowerCase().includes(q))) return false;
    }
    if (scoreTab > 0) {
      const s = getOverallScore(a);
      if (scoreTab === 1 && s < 70) return false;
      if (scoreTab === 2 && (s < 50 || s >= 70)) return false;
      if (scoreTab === 3 && s >= 50) return false;
    }
    return true;
  }), [results, debounced, scoreTab]);

  const openMenu  = useCallback((e: React.MouseEvent<HTMLElement>, a: PostInterviewAssessmentData) => { setMenuAnchor(e.currentTarget); setMenuAssessment(a); }, []);
  const closeMenu = useCallback(() => { setMenuAnchor(null); setMenuAssessment(null); }, []);

  const handleArchiveToggle = useCallback(() => {
    if (!menuAssessment) return;
    menuAssessment.archived ? unarchiveMutation.mutate(menuAssessment._id) : archiveMutation.mutate(menuAssessment._id);
    closeMenu();
  }, [menuAssessment, archiveMutation, unarchiveMutation, closeMenu]);

  const handleDeleteRequest = useCallback(() => { if (menuAssessment) { setDeleteTarget(menuAssessment); closeMenu(); } }, [menuAssessment, closeMenu]);
  const handleConfirmDelete = useCallback(() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) }); }, [deleteTarget, deleteMutation]);

  return (
    <div className="space-y-6">
      <AdminPageHeading title="Post Interview Assessments" subtitle={`${totalCount.toLocaleString()} assessments recorded`} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AdminStatCard icon={AllIcon}              value={(stats?.total        ?? 0).toLocaleString()} label="Total Assessments" loading={loading && !stats} />
        <AdminStatCard icon={ExcellentIcon}        value={(stats?.excellent    ?? 0).toLocaleString()} label="Excellent (70%+)"  loading={loading && !stats} />
        <AdminStatCard icon={SatisfactoryIcon}     value={(stats?.satisfactory ?? 0).toLocaleString()} label="Satisfactory"      loading={loading && !stats} />
        <AdminStatCard icon={NeedsImprovementIcon} value={(stats?.needsWork    ?? 0).toLocaleString()} label="Needs Work"        loading={loading && !stats} />
      </div>

      {/* Filters + Tabs */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100">
          <div className="flex-[1_1_220px] flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-teal-400 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search candidate, job, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="company-filter-label">Company</InputLabel>
            <Select labelId="company-filter-label" value={selectedCompany} label="Company"
              onChange={(e: SelectChangeEvent<string>) => { setSelectedCompany(e.target.value); setPage(1); }}>
              <MenuItem value=""><em>All Companies</em></MenuItem>
              {companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.username}</MenuItem>)}
            </Select>
          </FormControl>
          {loading && <CircularProgress size={16} sx={{ color: '#0D9488' }} />}
          <div className="flex-1" />
          <span className="text-[12px] text-slate-400">{filteredResults.length} of {totalCount}</span>
        </div>
        <div className="px-4">
          <Tabs value={String(scoreTab)} onValueChange={(v) => setScoreTab(Number(v))}>
            <TabsList variant="line" className="h-11 gap-0 rounded-none bg-transparent border-b-0 w-auto">
              {SCORE_TABS.map((label, i) => (
                <TabsTrigger key={label} value={String(i)} className="rounded-none px-4 text-[13px] data-[state=active]:text-teal-600 data-[state=active]:after:bg-teal-500">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Candidate</th>
                <th className={TH}>Post / Job</th>
                <th className={TH}>Company</th>
                <th className={TH}>Score</th>
                <th className={TH}>Date</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={6} className="py-8 text-center"><AdminTableErrorRow message="Failed to load assessments." onRetry={() => refetch()} /></td></tr>
              ) : loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-[13px] text-slate-400">Loading...</td></tr>
              ) : filteredResults.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[13px] text-slate-400">No assessments found</td></tr>
              ) : filteredResults.map((a) => (
                <tr key={a._id} className="hover:bg-teal-50/40 transition-colors">
                  <td className={TD}>
                    <div className="font-medium text-slate-900">{a.candidate?.username || 'Unknown'}</div>
                    <div className="text-[11px] text-slate-400">{a.candidate?.email || a.candidate?._id || 'N/A'}</div>
                  </td>
                  <td className={TD}><span className="font-medium text-slate-900">{a.post?.jobDetails?.title || 'Untitled Post'}</span></td>
                  <td className={TD}><span className="font-medium text-slate-900">{a.company?.username || 'Unknown Company'}</span></td>
                  <td className={TD}><ScoreBadge score={getOverallScore(a)} /></td>
                  <td className={TD}><span className="text-slate-500">{formatDate(a.createdAt)}</span></td>
                  <td className={TD}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => { setSelectedAssessment(a); setDetailsDialogOpen(true); }} sx={{ color: ADMIN_NEUTRAL }}>
                        <VisibilityIcon size={18} />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={(e) => openMenu(e, a)} sx={{ color: ADMIN_NEUTRAL }}>
                      <MoreVertIcon size={18} />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[12px] text-slate-400">{totalCount.toLocaleString()} assessments</span>
          <div className="flex items-center gap-3">
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="text-[12px] text-slate-600 border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-teal-400">
              {[5, 10, 25].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <Pagination page={page} totalPages={Math.ceil(totalCount / rowsPerPage)} onPageChange={setPage} size="sm" />
          </div>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: ADMIN_RADIUS, overflow: 'hidden', boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' } }}>
        {selectedAssessment && (() => {
          const score = getOverallScore(selectedAssessment);
          const tone  = scoreTone(score);
          return (
            <>
              <div className="relative px-6 pt-6 pb-4">
                <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ position: 'absolute', top: 12, right: 12, color: '#94A3B8', '&:hover': { color: '#0D9488' } }}>
                  <CloseIcon size={18} />
                </IconButton>
                <span className="text-[11px] uppercase tracking-[1.5px] text-slate-400">Post Interview Assessment</span>
                <h2 className="text-[1.35rem] font-semibold text-slate-900 mt-1 pr-8">{selectedAssessment.post?.jobDetails?.title || 'Assessment Review'}</h2>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedAssessment.status && <Badge variant="outline" className="border-transparent bg-slate-100 font-semibold capitalize text-slate-600">{selectedAssessment.status}</Badge>}
                  {selectedAssessment.stage  && <Badge variant="outline" className="border-transparent bg-slate-100 capitalize text-slate-500">{selectedAssessment.stage}</Badge>}
                </div>
              </div>
              <DialogContent sx={{ p: 0 }}>
                <div className="px-6">
                  <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-slate-100 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tone.color}14` }}>
                      <span className="text-[1.15rem] font-extrabold" style={{ color: tone.color }}>{score.toFixed(0)}%</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-slate-900">Overall Score</span>
                      <Badge variant="outline" className="border-transparent font-semibold" style={{ background: `${tone.color}14`, color: tone.color }}>{tone.label}</Badge>
                    </div>
                  </div>
                </div>
                {selectedAssessment.interviewData?.analytics && (
                  <div className="flex gap-3 px-6 mt-5">
                    {[
                      { label: 'Duration',  val: `${Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m` },
                      { label: 'Responses', val: selectedAssessment.interviewData.analytics.messageCount || 0 },
                      { label: 'Coverage',  val: `${selectedAssessment.interviewData.analytics.coveragePercentage || 0}%` },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex-1 p-3 rounded-[10px] text-center bg-slate-50">
                        <div className="text-[1.1rem] font-bold text-slate-900">{val}</div>
                        <div className="text-[11px] text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-6 mt-5">
                  <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">People</span>
                  <div className="flex gap-3 mt-2">
                    {[
                      { label: 'Candidate', name: selectedAssessment.candidate?.username, email: selectedAssessment.candidate?.email },
                      { label: 'Company',   name: selectedAssessment.company?.username,   email: selectedAssessment.company?.email   },
                    ].map(({ label, name, email }) => (
                      <div key={label} className="flex-1 p-3 rounded-[10px] border border-slate-200">
                        <div className="text-[10.5px] uppercase text-slate-500">{label}</div>
                        <div className="text-[13px] font-semibold text-slate-900">{name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-500">{email || ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Coverage Areas</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([name, d]: [string, any]) => {
                        const pct = d.percentage || 0;
                        const c   = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={name} className="flex-[1_1_45%] p-3 rounded-[10px] text-center" style={{ background: `${c}0a`, border: `1px solid ${c}20` }}>
                            <div className="text-[13px] font-bold" style={{ color: c }}>{pct}%</div>
                            <div className="text-[11px] text-slate-500 capitalize">{name.replace(/_/g, ' ')}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="px-6 mt-5 pb-5 flex gap-2 flex-wrap">
                  {selectedAssessment.post?.jobDetails?.location && <Badge variant="outline" className="border-slate-200 text-[13px] text-slate-500">{selectedAssessment.post.jobDetails.location}</Badge>}
                  {selectedAssessment.post?.jobDetails?.employmentType && <Badge variant="outline" className="border-slate-200 text-[13px] capitalize text-slate-500">{selectedAssessment.post.jobDetails.employmentType}</Badge>}
                  {selectedAssessment.interviewData?.interviewType && <Badge variant="outline" className="border-slate-200 text-[13px] capitalize text-slate-500">{selectedAssessment.interviewData.interviewType.replace(/_/g, ' ')}</Badge>}
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-slate-400">ID: {selectedAssessment._id}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(selectedAssessment.createdAt)}</span>
                </div>
              </DialogContent>
            </>
          );
        })()}
      </Dialog>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleArchiveToggle}>
          <ListItemIcon>{menuAssessment?.archived ? <UnarchiveIcon size={18} /> : <ArchiveIcon size={18} />}</ListItemIcon>
          <ListItemText>{menuAssessment?.archived ? 'Unarchive' : 'Archive'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteRequest} sx={{ color: '#DC2626' }}>
          <ListItemIcon sx={{ color: '#DC2626' }}><DeleteForeverIcon size={18} /></ListItemIcon>
          <ListItemText>Delete permanently</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete assessment permanently?"
        description="This will permanently delete this post-interview assessment. This cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default React.memo(PostInterviewAssessments);
