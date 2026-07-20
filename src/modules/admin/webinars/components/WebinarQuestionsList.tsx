import React from "react";
import { MessageSquare as QIcon } from "lucide-react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import type { WebinarQuestion } from "../types";

export function WebinarQuestionsList({ questions }: { questions: WebinarQuestion[] }) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <QIcon size={40} className="mb-2" />
        <p className="text-[14px]">No questions yet. Edit the webinar to add questions.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
      {[...questions]
        .sort((a, b) => a.order - b.order)
        .map((q, i) => (
          <div key={q.key} className="px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 text-[11px] font-black flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-bold text-slate-800">{q.label_fr}</span>
                  <Badge
                    variant="outline"
                    className="h-[18px] rounded-md border-transparent bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500"
                  >
                    {q.type}
                  </Badge>
                </div>
                <p className="text-[12px] text-slate-400 italic">{q.label_en}</p>
                {q.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {q.options.map((o) => (
                      <span
                        key={o.key}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]"
                      >
                        {o.label_fr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default WebinarQuestionsList;
