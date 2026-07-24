import React from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Plus as AddIcon } from "lucide-react";
import { QuestionEditor } from "./QuestionEditor";
import type { WebinarFormValues, WebinarQuestionDraft } from "../../types";

export function WebinarQuestionsStep({
  questions,
  lang,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
}: {
  questions: WebinarQuestionDraft[];
  lang: WebinarFormValues["lang"];
  onAdd: () => void;
  onUpdate: (idx: number, q: WebinarQuestionDraft) => void;
  onDelete: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
}) {
  return (
    <div className="space-y-3">
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-2 opacity-40"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-[14px] font-medium">No questions yet</p>
          <p className="text-[12px] mt-0.5">Add questions below</p>
        </div>
      ) : (
        questions.map((q, idx) => (
          <QuestionEditor
            key={q.key}
            q={q}
            idx={idx}
            lang={lang}
            onChange={(nq) => onUpdate(idx, nq)}
            onDelete={() => onDelete(idx)}
            onMoveUp={() => onMove(idx, -1)}
            onMoveDown={() => onMove(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === questions.length - 1}
          />
        ))
      )}
      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full rounded-xl border-2 border-dashed border-teal-200 text-teal-600 text-[13px] font-semibold hover:bg-teal-50"
      >
        <AddIcon size={16} /> Add question
      </Button>
    </div>
  );
}

export default WebinarQuestionsStep;
