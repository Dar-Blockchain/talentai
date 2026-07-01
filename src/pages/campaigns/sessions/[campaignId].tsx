'use client';

import dynamic from 'next/dynamic';
import LoadingScreen from '@/modules/shared/ui/LoadingScreen';
import {
  useCampaignSession,
  SessionShell, QuestionnaireView, CampaignInterviewView, ErrorCard,
  LoginRequiredCard, IdentityGate, CampaignOverviewCard,
} from '@/modules/company/campaigns/components/session';

function CampaignSessionPage() {
  const s = useCampaignSession();

  if (s.view === 'questionnaire' && s.campaign && s.participantId) {
    return (
      <QuestionnaireView
        campaign={s.campaign}
        participantId={s.participantId}
        onBack={() => s.setView('overview')}
        onComplete={() => s.router.push('/employee/dashboard')}
      />
    );
  }

  if (s.view === 'interview' && s.interviewCampaignId) {
    return (
      <CampaignInterviewView
        campaignId={s.interviewCampaignId}
        moduleType={s.interviewModuleType}
        onBack={() => s.setView('overview')}
      />
    );
  }

  if (!s.router.isReady || s.loading) {
    return <LoadingScreen title="Loading campaign…" />;
  }

  if (s.fetchError || (!s.campaign && s.eligibility !== 'login_required')) {
    return <ErrorCard message={s.fetchError} onHome={() => s.router.push('/')} />;
  }

  if (s.showIdentity && !s.isLoggedIn) {
    return (
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
  }

  if (s.eligibility === 'login_required' && !s.campaign) {
    return <LoginRequiredCard onSignIn={s.signIn} />;
  }

  return (
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

export default dynamic(() => Promise.resolve(CampaignSessionPage), { ssr: false });
