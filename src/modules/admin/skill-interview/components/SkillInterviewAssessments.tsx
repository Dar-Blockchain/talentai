import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent } from '@/modules/shared/ui/shadcn/dialog';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/modules/shared/ui/shadcn/tooltip';
import {
  DropdownMenuItem,
} from '@/modules/shared/ui/shadcn/dropdown-menu';
import { MoreOptionsMenu } from '@/modules/shared/ui/MoreOptionsMenu';
import {
  Eye as VisibilityIcon,
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
import { useAdminSkillAssessmentsQuery, useArchiveSkillAssessmentMutation, useUnarchiveSkillAssessmentMutation, useDeleteSkillAssessmentMutation } from '../queries';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Tabs, TabsList, TabsTrigger } from '@/modules/shared/ui/shadcn/tabs';
import { Pagination } from '@/modules/shared/ui/shadcn/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import { ScoreBadge, scoreTone, ADMIN_NEUTRAL, ADMIN_RADIUS, AdminPageHeading, AdminStatCard, AdminTableErrorRow, ConfirmDialog } from '@/modules/admin/shared';
import { cn } from '@/lib/utils';

interface IndicatorData { name: string; covered: boolean; evidence: string[]; quality: number; aiGenerated: boolean; reasoning?: string; }
interface AreaData { percentage: number; indicators: IndicatorData[]; weight: number; depth?: string; completed: boolean; lastUpdated?: string; aiAnalysis?: { qualityScore?: number; reasoning?: string; indicators?: string[] }; questionsAsked: number; lastQuestionTime?: string; }
interface CandidateSkill { name: string; proficiencyLevel?: number; experienceLevel?: string; ScoreTest?: number; Levelconfirmed?: number; NumberTestPassed?: number; }
interface CandidateData {
  _id: string; userId?: string; firstName?: string; lastName?: string; type?: string; user_image?: string; age?: string; gender?: string; educationLevel?: string; targetRole?: string; country?: string; language?: string;
  skills?: CandidateSkill[]; softSkills?: CandidateSkill[];
  contactInformation?: { email?: string; phone?: string; address?: string; linkedinUrl?: string; githubUrl?: string; personalWebsite?: string; location?: string };
}
interface SkillInterviewAssessmentData {
  _id: string; candidateId: CandidateData; skill?: string; category?: string; proficiency?: string; skillType?: 'technical' | 'soft';
  interviewData?: {
    finalReport?: {
      summary?: string;
      coverage?: { overall?: number; areas?: { technical_depth?: AreaData; problem_approach?: AreaData; learning_ability?: AreaData; practical_experience?: AreaData } };
      completedAreas?: string[]; nextRecommendedArea?: string; lastUpdated?: string;
      aiAnalysis?: { totalCoverage?: number; strongestAreas?: string[]; weakestAreas?: string[]; recommendedFocus?: string[] };
      recommendations?: string[];
      scores?: { communication?: number; technical_depth?: number; problem_approach?: number; learning_ability?: number; overall?: number };
      timestamp?: string;
    };
    analytics?: { duration?: number; messageCount?: number; silenceEvents?: number; coveragePercentage?: number; completedAreas?: number; totalAreas?: number; averageResponseLength?: number; interactionStyle?: string };
    sessionId?: string; status?: 'completed' | 'interrupted';
  };
  createdAt: string; updatedAt?: string; archived?: boolean;
}

interface SkillInterviewAssessmentsProps { autoFetch?: boolean; }

const TH = 'px-4 py-3 text-left text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100';
const TD = 'px-4 py-3 text-[13px] text-slate-700 border-b border-slate-100';
const SCORE_TABS = ['All', 'Excellent (70%+)', 'Satisfactory', 'Needs Work'];

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};

const SkillInterviewAssessments: React.FC<SkillInterviewAssessmentsProps> = ({ autoFetch = true }) => {
  const [selectedSkill, setSelectedSkill]   = useState('');
  const [skillsLoaded, setSkillsLoaded]     = useState(false);
  const [skills, setSkills]                 = useState<string[]>([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [debounced, setDebounced]           = useState('');
  const [scoreTab, setScoreTab]             = useState(0);
  const [page, setPage]                     = useState(1);
  const [rowsPerPage, setRowsPerPage]       = useState(10);

  const [selectedAssessment, setSelectedAssessment] = useState<SkillInterviewAssessmentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget]             = useState<SkillInterviewAssessmentData | null>(null);

  const archiveMutation   = useArchiveSkillAssessmentMutation();
  const unarchiveMutation = useUnarchiveSkillAssessmentMutation();
  const deleteMutation    = useDeleteSkillAssessmentMutation();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data, isLoading: loading, isError, refetch } = useAdminSkillAssessmentsQuery(
    { page, limit: rowsPerPage, skill: selectedSkill || undefined },
    autoFetch,
  );
  const results    = (data?.results ?? []) as SkillInterviewAssessmentData[];
  const totalCount = data?.total ?? 0;
  const stats      = data?.stats;

  useEffect(() => {
    if (!skillsLoaded && results.length > 0) {
      const s = new Set<string>();
      results.forEach((a) => { if (a.skill) s.add(a.skill); });
      setSkills(Array.from(s).sort());
      setSkillsLoaded(true);
    }
  }, [results, skillsLoaded]);

  const getName  = (a: SkillInterviewAssessmentData) =>
    (a.candidateId?.firstName || a.candidateId?.lastName)
      ? `${a.candidateId.firstName || ''} ${a.candidateId.lastName || ''}`.trim()
      : 'Unknown Candidate';
  const getEmail = (a: SkillInterviewAssessmentData) => a.candidateId?.contactInformation?.email || 'No email';
  const getLoc   = (a: SkillInterviewAssessmentData) => a.candidateId?.contactInformation?.location || a.candidateId?.country || 'Unknown';
  const getScore = (a: SkillInterviewAssessmentData) =>
    a.interviewData?.finalReport?.scores?.overall ?? a.interviewData?.finalReport?.coverage?.overall ?? 0;

  const filteredResults = useMemo(() => results.filter((a) => {
    if (debounced) {
      const q = debounced.toLowerCase();
      if (![getName(a), getEmail(a), a.skill].some((v) => v?.toLowerCase().includes(q))) return false;
    }
    if (scoreTab > 0) {
      const s = getScore(a);
      if (scoreTab === 1 && s < 70) return false;
      if (scoreTab === 2 && (s < 50 || s >= 70)) return false;
      if (scoreTab === 3 && s >= 50) return false;
    }
    return true;
  }), [results, debounced, scoreTab]);

  const handleArchiveToggle = useCallback((a: SkillInterviewAssessmentData) => {
    a.archived ? unarchiveMutation.mutate(a._id) : archiveMutation.mutate(a._id);
  }, [archiveMutation, unarchiveMutation]);

  const handleDeleteRequest = useCallback((a: SkillInterviewAssessmentData) => { setDeleteTarget(a); }, []);
  const handleConfirmDelete = useCallback(() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) }); }, [deleteTarget, deleteMutation]);

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <AdminPageHeading title="Skill Interview Assessments" subtitle={`${totalCount.toLocaleString()} assessments recorded`} />

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
              placeholder="Search candidate, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>
          <Select
            value={selectedSkill || "all"}
            onValueChange={(v) => { setSelectedSkill(v === "all" ? "" : v); setPage(1); }}
          >
            <SelectTrigger size="sm" className="min-w-[180px] text-[13px] text-slate-600 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {skills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {loading && <Spinner className="size-4" style={{ color: '#0D9488' }} />}
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
                <th className={TH}>Skill</th>
                <th className={TH}>Proficiency</th>
                <th className={TH}>Score</th>
                <th className={TH}>Type</th>
                <th className={TH}>Date</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={7} className="py-8 text-center"><AdminTableErrorRow message="Failed to load assessments." onRetry={() => refetch()} /></td></tr>
              ) : loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-slate-400">Loading...</td></tr>
              ) : filteredResults.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-[13px] text-slate-400">No assessments found</td></tr>
              ) : filteredResults.map((a) => (
                <tr key={a._id} className="hover:bg-teal-50/40 transition-colors">
                  <td className={TD}>
                    <div className="font-medium text-slate-900">{getName(a)}</div>
                    <div className="text-[11px] text-slate-400">{getEmail(a)}</div>
                  </td>
                  <td className={TD}><Badge variant="outline" className="border-transparent bg-teal-50 text-teal-700 font-semibold">{a.skill || 'N/A'}</Badge></td>
                  <td className={TD}><Badge variant="outline" className="border-slate-200 text-slate-500">{a.proficiency || 'N/A'}</Badge></td>
                  <td className={TD}><ScoreBadge score={getScore(a)} /></td>
                  <td className={TD}><span className="capitalize text-slate-500">{a.skillType || 'N/A'}</span></td>
                  <td className={TD}><span className="text-slate-500">{formatDate(a.createdAt)}</span></td>
                  <td className={cn(TD, "flex items-center gap-0.5")}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => { setSelectedAssessment(a); setDetailsDialogOpen(true); }} className="rounded-md p-1.5 hover:bg-slate-100" style={{ color: ADMIN_NEUTRAL }}>
                          <VisibilityIcon size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                    <MoreOptionsMenu icon={MoreVertIcon} iconSize={18} className="rounded-md text-[#0D9488] hover:bg-slate-100">
                        <DropdownMenuItem onClick={() => handleArchiveToggle(a)} className="gap-2">
                          {a.archived ? <UnarchiveIcon size={18} /> : <ArchiveIcon size={18} />}
                          {a.archived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRequest(a)} variant="destructive" className="gap-2">
                          <DeleteForeverIcon size={18} /> Delete permanently
                        </DropdownMenuItem>
                    </MoreOptionsMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-[12px] text-slate-400">{totalCount.toLocaleString()} assessments</span>
          <div className="flex items-center gap-3">
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger size="sm" className="text-[12px] text-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
              </SelectContent>
            </Select>
            <Pagination page={page} totalPages={Math.ceil(totalCount / rowsPerPage)} onPageChange={setPage} size="sm" />
          </div>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={(next) => { if (!next) setDetailsDialogOpen(false); }}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden" style={{ borderRadius: ADMIN_RADIUS, boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' }}>
        {selectedAssessment && (() => {
          const score = getScore(selectedAssessment);
          const tone  = scoreTone(score);
          return (
            <>
              <div className="relative px-6 pt-6 pb-4">
                <span className="text-[11px] uppercase tracking-[1.5px] text-slate-400">Skill Interview Assessment</span>
                <h2 className="text-[1.35rem] font-semibold text-slate-900 mt-1 pr-8">{selectedAssessment.skill || 'Assessment Review'}</h2>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedAssessment.proficiency && <Badge variant="outline" className="border-transparent bg-slate-100 font-semibold text-slate-600">{selectedAssessment.proficiency}</Badge>}
                  {selectedAssessment.category    && <Badge variant="outline" className="border-transparent bg-slate-100 text-slate-500">{selectedAssessment.category}</Badge>}
                </div>
              </div>
              <div>
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
                      { label: 'Duration', val: `${Math.floor((selectedAssessment.interviewData.analytics.duration || 0) / 60000)}m` },
                      { label: 'Messages', val: selectedAssessment.interviewData.analytics.messageCount || 0 },
                      { label: 'Coverage', val: `${selectedAssessment.interviewData.analytics.coveragePercentage || 0}%` },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex-1 p-3 rounded-[10px] text-center bg-slate-50">
                        <div className="text-[1.1rem] font-bold text-slate-900">{val}</div>
                        <div className="text-[11px] text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-6 mt-5">
                  <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Candidate</span>
                  <div className="mt-1.5 p-3 rounded-[10px] border border-slate-200">
                    <div className="text-[13px] font-semibold text-slate-900">{getName(selectedAssessment)}</div>
                    <div className="text-[11px] text-slate-500">{getEmail(selectedAssessment)}</div>
                    {(selectedAssessment.candidateId?.targetRole || selectedAssessment.candidateId?.educationLevel || getLoc(selectedAssessment) !== 'Unknown') && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {selectedAssessment.candidateId?.targetRole && <Badge variant="outline" className="border-transparent bg-emerald-50 text-emerald-600">{selectedAssessment.candidateId.targetRole}</Badge>}
                        {selectedAssessment.candidateId?.educationLevel && <Badge variant="outline" className="border-slate-200 text-slate-500">{selectedAssessment.candidateId.educationLevel}</Badge>}
                        {getLoc(selectedAssessment) !== 'Unknown' && <Badge variant="outline" className="border-slate-200 text-slate-500">{getLoc(selectedAssessment)}</Badge>}
                      </div>
                    )}
                  </div>
                </div>
                {selectedAssessment.interviewData?.finalReport?.scores && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Score Breakdown</span>
                    <div className="mt-1.5 flex flex-col gap-2">
                      {([
                        ['Communication',   selectedAssessment.interviewData.finalReport.scores.communication],
                        ['Technical Depth', selectedAssessment.interviewData.finalReport.scores.technical_depth],
                        ['Problem Approach',selectedAssessment.interviewData.finalReport.scores.problem_approach],
                        ['Learning Ability',selectedAssessment.interviewData.finalReport.scores.learning_ability],
                      ] as [string, number | undefined][]).filter(([, v]) => v !== undefined).map(([label, v]) => {
                        const c = (v ?? 0) >= 70 ? '#10b981' : (v ?? 0) >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                            <span className="text-[13px] font-medium text-slate-900">{label}</span>
                            <span className="text-[13px] font-bold" style={{ color: c }}>{v}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedAssessment.interviewData?.finalReport?.coverage?.areas && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Coverage Areas</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {Object.entries(selectedAssessment.interviewData.finalReport.coverage.areas).map(([name, d]) => {
                        const pct = (d as AreaData).percentage || 0;
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
                {selectedAssessment.interviewData?.finalReport?.aiAnalysis && (
                  (selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas?.length ?? 0) > 0 ||
                  (selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas?.length ?? 0) > 0
                ) && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">AI Analysis</span>
                    <div className="flex gap-4 mt-1.5">
                      {selectedAssessment.interviewData?.finalReport?.aiAnalysis?.strongestAreas?.length ? (
                        <div className="flex-1">
                          <span className="text-[11px] font-semibold text-emerald-600">Strengths</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {selectedAssessment.interviewData.finalReport.aiAnalysis.strongestAreas.map((a, i) => (
                              <Badge key={i} variant="outline" className="border-transparent bg-emerald-50 text-emerald-600">{a.replace(/_/g, ' ')}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {selectedAssessment.interviewData?.finalReport?.aiAnalysis?.weakestAreas?.length ? (
                        <div className="flex-1">
                          <span className="text-[11px] font-semibold text-red-600">Improve</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {selectedAssessment.interviewData.finalReport.aiAnalysis.weakestAreas.map((a, i) => (
                              <Badge key={i} variant="outline" className="border-transparent bg-red-50 text-red-600">{a.replace(/_/g, ' ')}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                {selectedAssessment.interviewData?.finalReport?.summary && (
                  <div className="px-6 mt-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Summary</span>
                    <p className="text-[13px] text-slate-600 leading-[1.7] mt-1.5">{selectedAssessment.interviewData.finalReport.summary}</p>
                  </div>
                )}
                {selectedAssessment.interviewData?.finalReport?.recommendations?.length ? (
                  <div className="px-6 mt-5 pb-5">
                    <span className="text-[10.5px] uppercase tracking-[1.2px] text-slate-500">Recommendations</span>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {selectedAssessment.interviewData.finalReport.recommendations.map((r, i) => (
                        <p key={i} className="text-[13px] text-slate-600 flex items-start gap-2 leading-[1.5]">
                          <span className="font-bold text-slate-500">&bull;</span> {r}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-slate-400">ID: {selectedAssessment._id}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(selectedAssessment.createdAt)}</span>
                </div>
              </div>
            </>
          );
        })()}
      </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete assessment permanently?"
        description="This will permanently delete this skill interview assessment. This cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
    </TooltipProvider>
  );
};

export default React.memo(SkillInterviewAssessments);
