import React, { useState } from 'react';
import InterviewLanguageModal from './InterviewLanguageModal';
import InterviewIntro from './InterviewIntro';

interface InterviewIntroStepProps {
  interviewConfig: any;
  setInterviewConfig: (c: any) => void;
  jobData: any;
  onDone: () => void;
}

export default function InterviewIntroStep({
  interviewConfig,
  setInterviewConfig,
  jobData,
  onDone,
}: InterviewIntroStepProps) {
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const handleIntroNext = () => {
    const langs = jobData?.interviewLanguages as string[] | undefined;
    if (langs && langs.length > 1) { setLangPickerOpen(true); return; }
    const lang = langs?.[0] || 'en';
    setInterviewConfig({ ...interviewConfig, sessionSettings: { ...interviewConfig.sessionSettings, language: lang } });
    onDone();
  };

  const handleLangConfirm = (lang: string) => {
    setInterviewConfig({ ...interviewConfig, sessionSettings: { ...interviewConfig.sessionSettings, language: lang } });
    setLangPickerOpen(false);
    onDone();
  };

  return (
    <>
      <InterviewIntro
        interviewConfig={interviewConfig}
        jobData={jobData}
        onNext={handleIntroNext}
      />
      <InterviewLanguageModal
        open={langPickerOpen}
        languages={jobData?.interviewLanguages || []}
        onConfirm={handleLangConfirm}
        onClose={() => setLangPickerOpen(false)}
      />
    </>
  );
}
