import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download, CheckCircle2, Circle, Code2, Brain, Clock,
  MessageCircle, TrendingUp, Award, Trophy, Lightbulb,
  ThumbsUp, ThumbsDown, Wrench, User, MessageSquare,
  Sparkles, Target, BarChart3, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { useInterviewReportQuery } from '../queries/useInterviewsQuery';

// ── Color helpers ─────────────────────────────────────────────────────────────
const scoreColor  = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#6366f1' : s >= 40 ? '#f59e0b' : '#ef4444';
const scoreBg     = (s: number) => s >= 80 ? 'rgba(16,185,129,0.10)' : s >= 60 ? 'rgba(99,102,241,0.10)' : s >= 40 ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)';
const scoreBorder = (s: number) => s >= 80 ? 'rgba(16,185,129,0.25)' : s >= 60 ? 'rgba(99,102,241,0.25)' : s >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';
const scoreGlow   = (s: number) => s >= 80 ? 'rgba(16,185,129,0.20)' : s >= 60 ? 'rgba(99,102,241,0.20)' : s >= 40 ? 'rgba(245,158,11,0.20)' : 'rgba(239,68,68,0.20)';

const areaLabel   = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const fmtDuration = (ms: number) => {
  const t = Math.floor(ms / 1000), m = Math.floor(t / 60), s = t % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Badge = ({ label, icon, color, bg, border, className }: {
  label: string; icon?: React.ReactNode; color?: string; bg?: string; border?: string; className?: string;
}) => (
  <span
    className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold border', className)}
    style={{ color, backgroundColor: bg, borderColor: border }}
  >
    {icon}{label}
  </span>
);

const ScoreRing = ({ score, size = 130 }: { score: number; size?: number }) => {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  const cx = size / 2, cy = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}18`} strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}30`} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ * 0.35} transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ fontSize: size * 0.24, color }}>{score}</span>
        <span className="text-[0.58rem] text-gray-400 font-bold uppercase tracking-widest mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, color, height = 8 }: { value: number; color: string; height?: number }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: `${color}18` }}>
    <div className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
  </div>
);

const SectionHeader = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h3 className="font-bold text-[0.95rem] text-gray-800">{children}</h3>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function SkillInterviewReport({ interviewId }: { interviewId: string }) {
  const { t } = useTranslation('modules/interview/skill-interview');
  const { data, isLoading, error } = useInterviewReportQuery(interviewId);

  const fr        = data?.interviewData?.finalReport;
  const analytics = data?.interviewData?.analytics;
  const coverage  = fr?.coverage;
  const overall   = coverage?.overall ?? 0;
  const isSoft    = data?.skillType === 'soft';
  const color     = scoreColor(overall);

  const scoreLabel = (s: number) =>
    s >= 80 ? t('report.score_labels.excellent') :
    s >= 60 ? t('report.score_labels.good') :
    s >= 40 ? t('report.score_labels.fair') :
              t('report.score_labels.needs_work');

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #skill-report, #skill-report * { visibility: visible !important; }
          #skill-report { position: absolute !important; left: 0; top: 0; width: 100vw; background: #fff !important; }
        }
      `}</style>

      <div id="skill-report" className="max-w-4xl mx-auto">

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading your report…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠️ {(error as Error).message}
          </div>
        )}

        {/* ── No data ── */}
        {!data && !isLoading && !error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            ℹ️ {t('report.no_report')}
          </div>
        )}

        {data && !isLoading && (
          <>
            {/* ══ HERO ══════════════════════════════════════════════════════ */}
            <div className="relative rounded-3xl overflow-hidden mb-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)` }}>

              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, #818cf8 0%, transparent 70%)` }} />

              <div className="relative z-10 p-7 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                        {isSoft ? <Brain size={13} className="text-indigo-300" /> : <Code2 size={13} className="text-indigo-300" />}
                      </div>
                      <span className="text-indigo-300 text-[0.75rem] font-semibold uppercase tracking-widest">
                        {isSoft ? t('report.soft_skill') : t('report.technical_skill')}
                      </span>
                    </div>
                    <h1 className="text-white font-black text-2xl md:text-3xl leading-tight">
                      {data.skill || 'Skill Assessment'}
                    </h1>
                    {data.category && (
                      <p className="text-white/50 text-sm mt-1">{data.category}</p>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => window.print()}
                    className="px-4 py-2.5 h-auto rounded-xl text-[0.8rem] font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white shrink-0">
                    <Download size={14} />
                    {t('report.download_pdf')}
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-2xl" style={{ background: scoreGlow(overall) }}>
                      <ScoreRing score={overall} size={140} />
                    </div>
                    <Badge label={scoreLabel(overall)}
                      color={color} bg={scoreBg(overall)} border={scoreBorder(overall)}
                      className="text-[0.78rem] px-3 py-1.5" />
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    {fr?.summary && (
                      <p className="text-white/70 text-[0.88rem] leading-relaxed max-w-lg">{fr.summary}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {data.proficiency && (
                        <Badge label={data.proficiency} icon={<Award size={11} />}
                          color="#fbbf24" bg="rgba(251,191,36,0.15)" border="rgba(251,191,36,0.3)" />
                      )}
                    </div>
                    {analytics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {analytics.duration != null && (
                          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Clock size={14} className="text-white/40" />
                            <p className="text-[0.62rem] text-white/40 font-semibold uppercase tracking-wider">{t('report.stats.duration')}</p>
                            <p className="text-white font-black text-[0.95rem]">{fmtDuration(analytics.duration)}</p>
                          </div>
                        )}
                        {analytics.messageCount != null && (
                          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                            <MessageCircle size={14} className="text-white/40" />
                            <p className="text-[0.62rem] text-white/40 font-semibold uppercase tracking-wider">{t('report.stats.exchanges')}</p>
                            <p className="text-white font-black text-[0.95rem]">{analytics.messageCount}</p>
                          </div>
                        )}
                        {analytics.coveragePercentage != null && (
                          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Target size={14} className="text-white/40" />
                            <p className="text-[0.62rem] text-white/40 font-semibold uppercase tracking-wider">{t('report.stats.coverage')}</p>
                            <p className="font-black text-[0.95rem]" style={{ color }}>{analytics.coveragePercentage}%</p>
                          </div>
                        )}
                        {analytics.completedAreas != null && analytics.totalAreas != null && (
                          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Trophy size={14} className="text-white/40" />
                            <p className="text-[0.62rem] text-white/40 font-semibold uppercase tracking-wider">{t('report.stats.areas_covered')}</p>
                            <p className="text-white font-black text-[0.95rem]">{analytics.completedAreas}/{analytics.totalAreas}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ══ COVERAGE AREAS ════════════════════════════════════════════ */}
            {coverage?.areas && Object.keys(coverage.areas).length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<BarChart3 size={14} className="text-indigo-500" />}>
                  {t('report.sections.coverage_areas')}
                </SectionHeader>
                <div className="flex flex-col gap-5">
                  {Object.entries(coverage.areas).map(([key, area]: [string, any]) => {
                    const pct = area?.percentage ?? 0;
                    const col = scoreColor(pct);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-[0.88rem] text-gray-800">{areaLabel(key)}</p>
                          <div className="flex items-center gap-3">
                            {area?.questionsAsked != null && (
                              <span className="text-[0.68rem] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                {t('report.area_question', { count: area.questionsAsked })}
                              </span>
                            )}
                            <span className="font-black text-[0.95rem]" style={{ color: col }}>{pct}%</span>
                          </div>
                        </div>
                        <ProgressBar value={pct} color={col} height={10} />
                        {area?.aiAnalysis?.reasoning && (
                          <p className="text-[0.74rem] text-gray-400 leading-relaxed mt-2 italic">{area.aiAnalysis.reasoning}</p>
                        )}
                        {area?.indicators?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {(area.indicators as any[])
                              .filter((ind: any, i: number, arr: any[]) =>
                                arr.findIndex((x: any) => (x.name || x) === (ind.name || ind)) === i)
                              .map((ind: any, idx: number) => {
                                const name = (ind.name || ind as string)
                                  .replace(/^AI-detected:\s*/i, '').replace(/_/g, ' ')
                                  .replace(/\b\w/g, (c: string) => c.toUpperCase());
                                return (
                                  <span key={idx} className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-medium border',
                                    ind.covered ? 'text-emerald-600 border-emerald-200' : 'text-gray-400 bg-gray-50 border-gray-100'
                                  )} style={ind.covered ? { backgroundColor: 'rgba(16,185,129,0.08)' } : undefined}>
                                    {ind.covered
                                      ? <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                                      : <Circle size={10} className="text-gray-300 shrink-0" />}
                                    {name}
                                  </span>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ SCORE BREAKDOWN ═══════════════════════════════════════════ */}
            {fr?.scores && Object.values(fr.scores).some((v) => v != null) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<Target size={14} className="text-indigo-500" />}>
                  {t('report.sections.score_breakdown')}
                </SectionHeader>
                <div className="flex flex-col gap-4">
                  {Object.entries(fr.scores).filter(([, v]) => v != null).map(([key, val]: [string, any]) => {
                    const pct = Math.round(val);
                    const col = scoreColor(pct);
                    return (
                      <div key={key} className="flex items-center gap-4">
                        <span className="text-[0.78rem] text-gray-600 font-medium w-36 shrink-0">{areaLabel(key)}</span>
                        <div className="flex-1"><ProgressBar value={pct} color={col} height={8} /></div>
                        <span className="text-[0.82rem] font-black w-9 text-right" style={{ color: col }}>{pct}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ AI ANALYSIS ═══════════════════════════════════════════════ */}
            {fr?.aiAnalysis && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<Sparkles size={14} className="text-indigo-500" />}>
                  {t('report.sections.ai_analysis')}
                </SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {fr.aiAnalysis.strongestAreas?.length > 0 && (
                    <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50">
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsUp size={14} className="text-emerald-500" />
                        <p className="font-bold text-[0.78rem] text-emerald-600">{t('report.labels.strongest')}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fr.aiAnalysis.strongestAreas.map((area: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-white text-emerald-600 border border-emerald-200">{areaLabel(area)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {fr.aiAnalysis.weakestAreas?.length > 0 && (
                    <div className="p-4 rounded-2xl border border-red-100 bg-red-50">
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsDown size={14} className="text-red-400" />
                        <p className="font-bold text-[0.78rem] text-red-500">{t('report.labels.improve')}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fr.aiAnalysis.weakestAreas.map((area: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-white text-red-500 border border-red-200">{areaLabel(area)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {fr.aiAnalysis.recommendedFocus?.length > 0 && (
                    <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={14} className="text-indigo-400" />
                        <p className="font-bold text-[0.78rem] text-indigo-500">{t('report.labels.recommended_focus')}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fr.aiAnalysis.recommendedFocus.map((area: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-white text-indigo-500 border border-indigo-200">{areaLabel(area)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STRENGTHS & WEAKNESSES ════════════════════════════════════ */}
            {(fr?.strengths?.length > 0 || fr?.weaknesses?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {fr.strengths?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <ThumbsUp size={15} className="text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-[0.88rem] text-gray-800">{t('report.labels.strengths')}</h3>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {(fr.strengths as string[]).map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <p className="text-[0.8rem] text-gray-600 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {fr.weaknesses?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <ThumbsDown size={15} className="text-red-400" />
                      </div>
                      <h3 className="font-bold text-[0.88rem] text-gray-800">{t('report.labels.weaknesses')}</h3>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {(fr.weaknesses as string[]).map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                          <p className="text-[0.8rem] text-gray-600 leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ RECOMMENDATIONS ═══════════════════════════════════════════ */}
            {fr?.recommendations?.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<Lightbulb size={14} className="text-indigo-500" />}>
                  {t('report.sections.recommendations')}
                </SectionHeader>
                <div className="flex flex-col gap-2.5">
                  {fr.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 border border-indigo-200 text-[0.65rem] font-black text-indigo-600 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-[0.82rem] text-gray-700 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ DEVELOPMENT AREAS ══════════════════════════════════════════ */}
            {fr?.developmentAreas?.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<Wrench size={14} className="text-amber-500" />}>
                  {t('report.sections.development_areas')}
                </SectionHeader>
                <div className="flex flex-col gap-2.5">
                  {(fr.developmentAreas as string[]).map((area, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl border border-amber-100 bg-amber-50">
                      <ChevronRight size={15} className="text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-[0.82rem] text-gray-700 leading-relaxed">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ CANDIDATE PROFILE ══════════════════════════════════════════ */}
            {fr?.candidateProfile && (fr.candidateProfile.revealedExpertise?.length > 0 || fr.candidateProfile.revealedGaps?.length > 0 || fr.candidateProfile.difficultyLevel) && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<User size={14} className="text-indigo-500" />}>
                  {t('report.sections.candidate_profile')}
                </SectionHeader>
                <div className="flex flex-col gap-5">
                  {fr.candidateProfile.difficultyLevel && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <User size={15} className="text-indigo-400" />
                      <p className="text-[0.82rem] text-gray-700">
                        <span className="font-semibold text-gray-900">{t('report.labels.difficulty_level')} </span>
                        {String(fr.candidateProfile.difficultyLevel).charAt(0).toUpperCase() + String(fr.candidateProfile.difficultyLevel).slice(1)}
                      </p>
                    </div>
                  )}
                  {fr.candidateProfile.revealedExpertise?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[0.75rem] text-emerald-600 uppercase tracking-wider mb-2.5">{t('report.labels.demonstrated')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(fr.candidateProfile.revealedExpertise as string[]).map((e, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-[0.72rem] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {fr.candidateProfile.revealedGaps?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[0.75rem] text-amber-500 uppercase tracking-wider mb-2.5">{t('report.labels.gaps')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(fr.candidateProfile.revealedGaps as string[]).map((g, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-[0.72rem] font-semibold bg-amber-50 text-amber-600 border border-amber-200">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ Q&A ═══════════════════════════════════════════════════════ */}
            {(data?.interviewData as any)?.conversation?.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<MessageSquare size={14} className="text-indigo-500" />}>
                  {t('report.sections.qa')}
                </SectionHeader>
                <div className="flex flex-col gap-3">
                  {((data?.interviewData as any).conversation as any[]).map((turn: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="flex items-start gap-3 p-4 bg-gray-50 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare size={11} className="text-indigo-500" />
                        </div>
                        <p className="font-semibold text-[0.82rem] text-gray-800 leading-snug">{turn.question}</p>
                      </div>
                      {turn.response && (
                        <div className="px-4 py-3 bg-white">
                          <p className="text-[0.78rem] text-gray-600 leading-relaxed pl-9">{turn.response}</p>
                        </div>
                      )}
                      {(turn.evaluation?.qualityScore != null || turn.targetArea) && (
                        <div className="flex gap-1.5 px-4 pb-3 flex-wrap">
                          {turn.targetArea && (
                            <Badge label={areaLabel(turn.targetArea)}
                              color="#6366f1" bg="rgba(99,102,241,0.08)" border="rgba(99,102,241,0.18)" />
                          )}
                          {turn.evaluation?.qualityScore != null && (
                            <Badge label={t('report.stats.quality', { score: turn.evaluation.qualityScore })}
                              color={scoreColor(turn.evaluation.qualityScore * 10)}
                              bg={scoreBg(turn.evaluation.qualityScore * 10)}
                              border={scoreBorder(turn.evaluation.qualityScore * 10)}
                              className="font-bold" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ NEXT AREA ══════════════════════════════════════════════════ */}
            {fr?.nextRecommendedArea && (
              <div className="flex items-center gap-5 p-6 rounded-3xl mb-4 border"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)', borderColor: 'rgba(99,102,241,0.2)' }}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">{t('report.sections.next_area')}</p>
                  <p className="font-black text-[1.1rem] text-gray-800">{areaLabel(fr.nextRecommendedArea)}</p>
                </div>
              </div>
            )}

            {/* ══ SESSION ANALYTICS ══════════════════════════════════════════ */}
            {analytics && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 mb-4 shadow-sm">
                <SectionHeader icon={<BarChart3 size={14} className="text-indigo-500" />}>
                  {t('report.sections.session_analytics')}
                </SectionHeader>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: t('report.stats.duration'),      value: analytics.duration != null ? fmtDuration(analytics.duration) : null,                                                                    icon: <Clock size={16} className="text-indigo-400" /> },
                    { label: t('report.stats.exchanges'),     value: analytics.messageCount,                                                                                                                   icon: <MessageCircle size={16} className="text-indigo-400" /> },
                    { label: t('report.stats.coverage'),      value: analytics.coveragePercentage != null ? `${analytics.coveragePercentage}%` : null,                                                        icon: <Target size={16} className="text-indigo-400" /> },
                    { label: t('report.stats.areas_covered'), value: analytics.completedAreas != null && analytics.totalAreas != null ? `${analytics.completedAreas} / ${analytics.totalAreas}` : null,       icon: <Trophy size={16} className="text-amber-400" /> },
                    { label: t('report.stats.avg_response'),  value: analytics.averageResponseLength != null ? `${analytics.averageResponseLength} words` : null,                                              icon: <MessageSquare size={16} className="text-indigo-400" /> },
                    { label: t('report.stats.style'),         value: analytics.interactionStyle,                                                                                                               icon: <User size={16} className="text-indigo-400" /> },
                    { label: t('report.stats.silence'),       value: analytics.silenceEvents,                                                                                                                  icon: <Award size={16} className="text-indigo-400" /> },
                  ].filter(({ value }) => value != null).map(({ label, value, icon }) => (
                    <div key={label} className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      {icon}
                      <p className="text-[0.62rem] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                      <p className="text-[0.92rem] font-black text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
