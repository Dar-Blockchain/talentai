import React from 'react';
import { Progress } from '@/modules/shared/ui/shadcn/progress';
import { type Coverage, type CoverageArea } from '../../types/interview';

const scoreColor = (pct: number) =>
  pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

const TECH_LABELS: Record<string, string> = {
  reactjs: 'ReactJS', nodejs: 'Node.js', expressjs: 'ExpressJS', nextjs: 'Next.js',
  vuejs: 'Vue.js', angularjs: 'AngularJS', typescript: 'TypeScript', javascript: 'JavaScript',
  python: 'Python', java: 'Java', golang: 'Go', rust: 'Rust', ruby: 'Ruby',
  css: 'CSS', html: 'HTML', html5: 'HTML5', css3: 'CSS3',
  api: 'API', rest: 'REST', graphql: 'GraphQL', http: 'HTTP',
  sql: 'SQL', nosql: 'NoSQL', mongodb: 'MongoDB', postgresql: 'PostgreSQL',
  mysql: 'MySQL', redis: 'Redis', aws: 'AWS', gcp: 'GCP', azure: 'Azure',
  docker: 'Docker', kubernetes: 'Kubernetes', devops: 'DevOps',
  ui: 'UI', ux: 'UX', oop: 'OOP', ai: 'AI', ml: 'ML',
  blockchain: 'Blockchain', web3: 'Web3', kotlin: 'Kotlin',
  swift: 'Swift', flutter: 'Flutter',
};

function formatAreaLabel(key: string): string {
  return key
    .split('_')
    .map(w => TECH_LABELS[w.toLowerCase()] ?? (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

interface CoverageDashboardProps {
  coverage: Coverage | null;
}

const CoverageDashboard: React.FC<CoverageDashboardProps> = ({ coverage }) => {
  if (!coverage) return null;

  const overall    = Math.round(coverage.overall || 0);
  const areas      = coverage.areas ? Object.entries(coverage.areas) : [];
  const color      = scoreColor(overall);
  const scoreLabel = overall >= 80 ? 'Strong' : overall >= 50 ? 'Moderate' : 'Needs Work';

  return (
    <div className="h-full bg-white rounded-[16px] border border-[#e5e7eb] p-4 flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-sans font-bold text-[0.7rem] text-[#9ca3af] uppercase tracking-[0.1em]">
          Coverage
        </span>
        <span className="font-sans font-extrabold text-[0.88rem]" style={{ color }}>
          {overall}% · {scoreLabel}
        </span>
      </div>

      {/* Overall bar */}
      <Progress
        value={Math.min(overall, 100)}
        className="h-1 rounded-full bg-[#f3f4f6]"
        style={{ '--progress-color': color } as React.CSSProperties}
      />

      {/* Topic rows */}
      {areas.length > 0 ? (
        <div className="flex flex-col gap-2">
          {areas.map(([areaName, areaData]: [string, CoverageArea]) => {
            const pct = Math.round(areaData.percentage || 0);
            const c   = scoreColor(pct);
            return (
              <div key={areaName}>
                <div className="flex justify-between mb-1">
                  <span className="font-sans text-[0.72rem] font-semibold text-[#374151] truncate overflow-hidden">
                    {areaData.label || formatAreaLabel(areaName)}
                  </span>
                  <span className="font-sans text-[0.72rem] font-bold ml-2 shrink-0" style={{ color: c }}>
                    {pct}%
                  </span>
                </div>
                <Progress
                  value={Math.min(pct, 100)}
                  className="h-[3px] rounded-full bg-[#f3f4f6]"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="font-sans text-[0.73rem] text-[#d1d5db] text-center py-4">
          Topics appear as the interview progresses
        </p>
      )}
    </div>
  );
};

export default CoverageDashboard;
