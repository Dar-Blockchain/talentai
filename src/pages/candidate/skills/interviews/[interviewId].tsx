import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getCandidateLayoutSlim } from '@/modules/shared/layouts/candidate/getCandidateLayout';
import { useCandidateLayout } from '@/modules/shared/layouts/candidate/CandidateLayoutContext';
import SkillInterviewReport from '@/modules/candidate/interviews/components/SkillInterviewReport';
import type { NextPageWithLayout } from '@/pages/_app';

function SkillInterviewReportPage() {
  const { interviewId } = useRouter().query;
  useCandidateLayout('Skill Interview Report');
  return interviewId ? (
    <div className="max-w-3xl mx-auto bg-card border rounded-2xl">
      <SkillInterviewReport interviewId={interviewId as string} />
    </div>
  ) : null;
}

const Dynamic = dynamic(() => Promise.resolve(SkillInterviewReportPage), { ssr: false }) as NextPageWithLayout;
Dynamic.getLayout = getCandidateLayoutSlim;

export default Dynamic;
