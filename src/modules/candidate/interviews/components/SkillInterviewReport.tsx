import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download, CheckCircle2, Code2, Brain, Clock,
  MessageCircle, TrendingUp, Award, Trophy, Lightbulb,
  ThumbsUp, ThumbsDown, Wrench, User, MessageSquare,
  Target, BarChart3, ChevronDown, AlertTriangle, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { useInterviewReportQuery } from '../queries/useInterviewsQuery';

// ── Mostly-grayscale score tiers ────────────────────────────────────────────
// Darker = better, same language as SkillCard's level badges -- with two
// restrained accents at the extremes (brand mint for a strong result, warning
// amber for a weak one) so the best and worst scores are easy to spot at a
// glance, while the middle tiers stay neutral gray to keep the report calm.
const SCORE_TIER: Record<string, { text: string; bar: string; chip: string; box: string }> = {
  high: { text: 'text-primary-dark', bar: 'bg-primary',   chip: 'bg-primary-dark text-white   border-primary-dark', box: 'bg-primary-light border-primary-border' },
  mid:  { text: 'text-gray-700',     bar: 'bg-gray-600',  chip: 'bg-gray-200     text-gray-700 border-gray-300',    box: 'bg-gray-100     border-gray-200' },
  low:  { text: 'text-gray-600',     bar: 'bg-gray-400',  chip: 'bg-gray-100     text-gray-600 border-gray-200',    box: 'bg-gray-50      border-gray-200' },
  crit: { text: 'text-warning',      bar: 'bg-warning',   chip: 'bg-warning-light text-warning border-warning-border', box: 'bg-warning-light border-warning-border' },
};
const scoreTier = (s: number) => s >= 80 ? 'high' : s >= 60 ? 'mid' : s >= 40 ? 'low' : 'crit';

const areaLabel   = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const fmtDuration = (ms: number) => {
  const t = Math.floor(ms / 1000), m = Math.floor(t / 60), s = t % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Badge = ({ label, icon, className }: { label: string; icon?: React.ReactNode; className?: string }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold border',
    'bg-gray-100 text-gray-600 border-gray-200',
    className,
  )}>
    {icon}{label}
  </span>
);

const ProgressBar = ({ value, barClassName, height = 7 }: { value: number; barClassName: string; height?: number }) => (
  <div className="w-full rounded-full overflow-hidden bg-gray-100" style={{ height }}>
    <div className={cn('h-full rounded-full transition-all duration-700', barClassName)} style={{ width: `${Math.min(value, 100)}%` }} />
  </div>
);

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="py-5 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-2 mb-3.5">
      <div className="text-gray-400">{icon}</div>
      <h3 className="font-bold text-[0.82rem] text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const StatChip = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 min-w-0">
    <div className="text-gray-400 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wide leading-none">{label}</p>
      <p className="text-[0.82rem] font-bold text-gray-800 leading-tight mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function SkillInterviewReport({ interviewId, showDownloadButton = true }: { interviewId: string; showDownloadButton?: boolean }) {
  const { t } = useTranslation('modules/interview/skill-interview');
  const { data, isLoading, error } = useInterviewReportQuery(interviewId);
  const [showTranscript, setShowTranscript] = useState(false);

  const fr        = data?.interviewData?.finalReport;
  const analytics = data?.interviewData?.analytics;
  const coverage  = fr?.coverage;
  const overall   = coverage?.overall ?? 0;
  const isSoft    = data?.skillType === 'soft';
  const tier      = SCORE_TIER[scoreTier(overall)];

  const scoreLabel = (s: number) =>
    s >= 80 ? t('report.score_labels.excellent') :
    s >= 60 ? t('report.score_labels.good') :
    s >= 40 ? t('report.score_labels.fair') :
              t('report.score_labels.needs_work');

  const stats = [
    { label: t('report.stats.duration'),      value: analytics?.duration != null ? fmtDuration(analytics.duration) : null, icon: <Clock size={14} /> },
    { label: t('report.stats.exchanges'),     value: analytics?.messageCount ?? null,                                       icon: <MessageCircle size={14} /> },
    { label: t('report.stats.coverage'),      value: analytics?.coveragePercentage != null ? `${analytics.coveragePercentage}%` : null, icon: <Target size={14} /> },
    { label: t('report.stats.areas_covered'), value: analytics?.completedAreas != null && analytics?.totalAreas != null ? `${analytics.completedAreas}/${analytics.totalAreas}` : null, icon: <Trophy size={14} /> },
  ].filter((st) => st.value != null);

  const conversation = (data?.interviewData as any)?.conversation as any[] | undefined;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #skill-report, #skill-report * { visibility: visible !important; }
          #skill-report { position: absolute !important; left: 0; top: 0; width: 100vw; background: #fff !important; }
        }
      `}</style>

      <div id="skill-report">

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-[3px] border-gray-100 border-t-gray-400 animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading report…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div className="m-6 flex items-start gap-2.5 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm">
            <AlertTriangle size={16} className="text-gray-400 shrink-0 mt-0.5" />
            {(error as Error).message}
          </div>
        )}

        {/* ── No data ── */}
        {!data && !isLoading && !error && (
          <div className="m-6 flex items-start gap-2.5 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm">
            <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
            {t('report.no_report')}
          </div>
        )}

        {data && !isLoading && (
          <div className="px-6 py-5">

            {/* ══ HEADER ═══════════════════════════════════════════════════ */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-start gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary-light border border-primary-border flex items-center justify-center shrink-0">
                  {isSoft ? <Brain size={17} className="text-primary-dark" /> : <Code2 size={17} className="text-primary-dark" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.66rem] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                    {isSoft ? t('report.soft_skill') : t('report.technical_skill')}
                  </p>
                  <h1 className="font-black text-lg text-gray-900 leading-tight truncate">
                    {data.skill || 'Skill Assessment'}
                  </h1>
                  {data.category && <p className="text-gray-400 text-xs mt-0.5 truncate">{data.category}</p>}
                </div>
              </div>
              {showDownloadButton && (
                <Button variant="outline" size="sm" onClick={() => window.print()}
                  className="h-8 gap-1.5 px-3 text-[0.72rem] font-bold rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0">
                  <Download size={13} />
                  {t('report.download_pdf')}
                </Button>
              )}
            </div>

            {/* ══ SCORE + SUMMARY ══════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row gap-5 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3 shrink-0">
                <div className={cn('flex flex-col items-center justify-center size-20 rounded-2xl shrink-0 border', tier.box)}>
                  <span className={cn('font-black text-2xl leading-none', tier.text)}>{overall}</span>
                  <span className="text-[0.55rem] text-gray-400 font-bold uppercase tracking-wider mt-0.5">/ 100</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Badge label={scoreLabel(overall)} className={cn('text-[0.72rem] px-2.5 py-1', tier.chip)} />
                  {data.proficiency && <Badge label={data.proficiency} icon={<Award size={11} />} />}
                </div>
              </div>
              {fr?.summary && (
                <p className="text-gray-600 text-[0.85rem] leading-relaxed flex-1">{fr.summary}</p>
              )}
            </div>

            {/* ══ STATS ════════════════════════════════════════════════════ */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-5 border-b border-gray-100">
                {stats.map((st) => <StatChip key={st.label} icon={st.icon} label={st.label} value={st.value} />)}
              </div>
            )}

            {/* ══ COVERAGE AREAS ═══════════════════════════════════════════ */}
            {coverage?.areas && Object.keys(coverage.areas).length > 0 && (
              <Section icon={<BarChart3 size={15} />} title={t('report.sections.coverage_areas')}>
                <div className="flex flex-col gap-4">
                  {Object.entries(coverage.areas).map(([key, area]: [string, any]) => {
                    const pct = area?.percentage ?? 0;
                    const t2  = SCORE_TIER[scoreTier(pct)];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-semibold text-[0.8rem] text-gray-700">{areaLabel(key)}</p>
                          <span className={cn('font-black text-[0.82rem]', t2.text)}>{pct}%</span>
                        </div>
                        <ProgressBar value={pct} barClassName={t2.bar} />
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ══ STRENGTHS & WEAKNESSES ═══════════════════════════════════ */}
            {(fr?.strengths?.length > 0 || fr?.weaknesses?.length > 0) && (
              <Section icon={<ThumbsUp size={15} />} title={t('report.sections.strengths_weaknesses')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {fr.strengths?.length > 0 && (
                    <div>
                      <p className="text-[0.68rem] font-bold text-gray-500 uppercase tracking-wide mb-2">{t('report.labels.strengths')}</p>
                      <div className="flex flex-col gap-1.5">
                        {(fr.strengths as string[]).map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-primary-dark mt-0.5 shrink-0" />
                            <p className="text-[0.78rem] text-gray-600 leading-relaxed">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {fr.weaknesses?.length > 0 && (
                    <div>
                      <p className="text-[0.68rem] font-bold text-gray-500 uppercase tracking-wide mb-2">{t('report.labels.weaknesses')}</p>
                      <div className="flex flex-col gap-1.5">
                        {(fr.weaknesses as string[]).map((w, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ThumbsDown size={13} className="text-warning mt-0.5 shrink-0" />
                            <p className="text-[0.78rem] text-gray-600 leading-relaxed">{w}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ══ RECOMMENDATIONS ══════════════════════════════════════════ */}
            {fr?.recommendations?.length > 0 && (
              <Section icon={<Lightbulb size={15} />} title={t('report.sections.recommendations')}>
                <div className="flex flex-col gap-2">
                  {fr.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-primary-light text-[0.6rem] font-black text-primary-dark mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-[0.8rem] text-gray-600 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ══ DEVELOPMENT AREAS ════════════════════════════════════════ */}
            {fr?.developmentAreas?.length > 0 && (
              <Section icon={<Wrench size={15} />} title={t('report.sections.development_areas')}>
                <div className="flex flex-wrap gap-1.5">
                  {(fr.developmentAreas as string[]).map((area, i) => <Badge key={i} label={area} />)}
                </div>
              </Section>
            )}

            {/* ══ CANDIDATE PROFILE ════════════════════════════════════════ */}
            {fr?.candidateProfile && (fr.candidateProfile.revealedExpertise?.length > 0 || fr.candidateProfile.revealedGaps?.length > 0 || fr.candidateProfile.difficultyLevel) && (
              <Section icon={<User size={15} />} title={t('report.sections.candidate_profile')}>
                <div className="flex flex-col gap-3">
                  {fr.candidateProfile.difficultyLevel && (
                    <p className="text-[0.8rem] text-gray-600">
                      <span className="font-semibold text-gray-800">{t('report.labels.difficulty_level')} </span>
                      {String(fr.candidateProfile.difficultyLevel).charAt(0).toUpperCase() + String(fr.candidateProfile.difficultyLevel).slice(1)}
                    </p>
                  )}
                  {fr.candidateProfile.revealedExpertise?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[0.66rem] text-gray-500 uppercase tracking-wide mb-1.5">{t('report.labels.demonstrated')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(fr.candidateProfile.revealedExpertise as string[]).map((e, i) => <Badge key={i} label={e} />)}
                      </div>
                    </div>
                  )}
                  {fr.candidateProfile.revealedGaps?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[0.66rem] text-gray-500 uppercase tracking-wide mb-1.5">{t('report.labels.gaps')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(fr.candidateProfile.revealedGaps as string[]).map((g, i) => <Badge key={i} label={g} />)}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ══ NEXT AREA ════════════════════════════════════════════════ */}
            {fr?.nextRecommendedArea && (
              <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                <TrendingUp size={16} className="text-gray-400 shrink-0" />
                <p className="text-[0.8rem] text-gray-600">
                  <span className="font-semibold text-gray-800">{t('report.sections.next_area')}: </span>
                  {areaLabel(fr.nextRecommendedArea)}
                </p>
              </div>
            )}

            {/* ══ Q&A (collapsed by default) ═══════════════════════════════ */}
            {conversation && conversation.length > 0 && (
              <div className="pt-5">
                <button
                  onClick={() => setShowTranscript((v) => !v)}
                  className="flex items-center gap-2 w-full text-left cursor-pointer"
                >
                  <MessageSquare size={15} className="text-gray-400" />
                  <h3 className="font-bold text-[0.82rem] text-gray-800 flex-1">{t('report.sections.qa')}</h3>
                  <span className="text-[0.68rem] text-gray-400 font-medium">{conversation.length}</span>
                  <ChevronDown size={15} className={cn('text-gray-400 transition-transform', showTranscript && 'rotate-180')} />
                </button>

                {showTranscript && (
                  <div className="flex flex-col gap-2.5 mt-3.5">
                    {conversation.map((turn: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
                        <div className="flex items-start gap-2.5 p-3 bg-gray-50 border-b border-gray-100">
                          <MessageSquare size={12} className="text-gray-400 mt-0.5 shrink-0" />
                          <p className="font-semibold text-[0.78rem] text-gray-800 leading-snug">{turn.question}</p>
                        </div>
                        {turn.response && (
                          <div className="px-3 py-2.5">
                            <p className="text-[0.76rem] text-gray-600 leading-relaxed pl-[1.35rem]">{turn.response}</p>
                          </div>
                        )}
                        {(turn.evaluation?.qualityScore != null || turn.targetArea) && (
                          <div className="flex gap-1.5 px-3 pb-2.5 flex-wrap">
                            {turn.targetArea && <Badge label={areaLabel(turn.targetArea)} />}
                            {turn.evaluation?.qualityScore != null && (
                              <Badge label={t('report.stats.quality', { score: turn.evaluation.qualityScore })} />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
