'use client';

import dynamic from 'next/dynamic';
import LoadingScreen from '@/modules/shared/ui/LoadingScreen';
import InterviewHeader from '@/modules/interviews/shared/components/layout/InterviewHeader';
import {
  useCampaignSession,
  SessionShell, CampaignInterviewView, ErrorCard,
  LoginRequiredCard, IdentityGate, CampaignOverviewCard,
} from '@/modules/company/campaigns/components/session';
import { QuestionnaireAssessment } from '@/modules/interviews/questionnaire';

function CampaignSessionPage() {
  const s = useCampaignSession();

  let content: React.ReactNode;

  if (s.view === 'questionnaire' && s.campaign && s.participantId) {
    content = (
      <QuestionnaireAssessment
        campaign={s.campaign}
        participantId={s.participantId}
        onBack={() => s.setView('overview')}
        onComplete={() => s.router.push('/employee/dashboard')}
      />
    );
  } else if (s.view === 'interview' && s.interviewCampaignId) {
    content = (
      <CampaignInterviewView
        campaignId={s.interviewCampaignId}
        moduleType={s.interviewModuleType}
        onBack={() => s.setView('overview')}
      />
    );
  } else if (!s.router.isReady || s.loading) {
    content = <LoadingScreen title="Loading campaign…" />;
  } else if (s.fetchError || (!s.campaign && s.eligibility !== 'login_required')) {
    content = <ErrorCard message={s.fetchError} onHome={() => s.router.push('/')} />;
  } else if (s.showIdentity && !s.isLoggedIn) {
    content = (
      <IdentityGate
        campaign={s.campaign}
        modMeta={s.modMeta}
        name={s.name}
        email={s.email}
        nameErr={s.nameErr}
        emailErr={s.emailErr}
        onNameChange={(v) => { s.setName(v); s.setNameErr(''); }}
        onEmailChange={(v) => { s.setEmail(v); s.setEmailErr(''); }}
        onContinue={() => { if (s.validateIdentity()) s.setShowIdentity(false); }}
        onSignIn={s.signIn}
      />
    );
  } else if (s.eligibility === 'login_required' && !s.campaign) {
    content = <LoginRequiredCard onSignIn={s.signIn} />;
  } else {
    content = (
      <SessionShell>
        <CampaignOverviewCard
          campaign={s.campaign}
          modMeta={s.modMeta}
          eligibility={s.eligibility}
          remaining={s.remaining}
          isAnon={s.isAnon}
          isLoggedIn={s.isLoggedIn}
          hasIdentity={s.hasIdentity}
          name={s.name}
          email={s.email}
          joinError={s.joinError}
          joining={s.joining}
          deadlineBadge={s.deadlineBadge}
          onStart={s.handleStart}
          onSignIn={s.signIn}
          onRetry={() => { s.setJoinError(null); s.handleStart(); }}
          onViewResults={() => s.router.push(`/employee/campaigns/${s.campaignId}`)}
          onEditIdentity={() => s.setShowIdentity(true)}
        />
      </SessionShell>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <InterviewHeader />
      <div className="flex-1 flex flex-col min-h-0">{content}</div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CampaignSessionPage), { ssr: false });
