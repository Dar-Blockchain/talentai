import React from "react";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlined            from "@mui/icons-material/PersonOutlined";

export const QuestionBubble: React.FC<{ question: string }> = ({ question }) => (
  <div className="flex gap-2.5 items-start mb-2.5">
    <div className="w-[26px] h-[26px] rounded-full bg-violet-700 flex items-center justify-center shrink-0">
      <ChatBubbleOutlineOutlined style={{ fontSize: 12, color: "#fff" }} />
    </div>
    <div className="flex-1 px-3.5 py-3 rounded-[4px_14px_14px_14px] bg-violet-50 border border-violet-100">
      <p className="text-[0.78rem] text-violet-800 leading-[1.7] italic">{question}</p>
    </div>
  </div>
);

export const ResponseBubble: React.FC<{ response: string }> = ({ response }) => (
  <div className="flex gap-2.5 items-start flex-row-reverse mb-3">
    <div className="w-[26px] h-[26px] rounded-full bg-slate-100 flex items-center justify-center shrink-0">
      <PersonOutlined style={{ fontSize: 13, color: "#6B7280" }} />
    </div>
    <div className="flex-1 px-3.5 py-3 rounded-[14px_4px_14px_14px] bg-white border border-slate-200">
      <p className="text-[0.82rem] text-slate-800 leading-[1.75]">{response}</p>
    </div>
  </div>
);
