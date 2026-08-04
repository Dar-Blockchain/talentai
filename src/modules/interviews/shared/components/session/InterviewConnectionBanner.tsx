import React from 'react';

interface Props {
  text: string;
}

export default function InterviewConnectionBanner({ text }: Props) {
  return (
    <div className="bg-[#fefce8] border-b border-[#fde047] px-4 md:px-8 py-2.5 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#ca8a04] shrink-0" />
      <p className="font-sans text-[0.8rem] text-[#854d0e]">{text}</p>
    </div>
  );
}
