import React from "react";
import ApplicationCard from "@/modules/company/applications/components/ApplicationCard";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { ContactTarget } from "../ContactCandidateModal";
import { TEAL } from "@/modules/company/posts/shared/constants";

interface Props {
  rows: ApplicationSummaryItem[];
  postId: string;
  page: number;
  pagination: { totalPages: number };
  onPage: (page: number) => void;
  onContact: (t: ContactTarget) => void;
  invitedIds: Set<string>;
  onInviteSuccess: (appId: string) => void;
}

const ApplicationsList: React.FC<Props> = ({
  rows, postId, page, pagination, onPage, onContact, invitedIds, onInviteSuccess,
}) => (
  <div className="flex flex-col gap-3">
    {rows.map((app: ApplicationSummaryItem) => (
      <ApplicationCard
        key={String(app.id)}
        app={app}
        postId={postId}
        onContact={onContact}
        invitedIds={invitedIds}
        onInviteSuccess={onInviteSuccess}
      />
    ))}
    {pagination.totalPages > 1 && (
      <div className="flex items-center justify-center gap-1 mt-2">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[13px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[12px] font-medium transition-colors"
            style={{
              backgroundColor: p === page ? `${TEAL}18` : "transparent",
              color:           p === page ? TEAL      : "#374151",
              fontWeight:      p === page ? 700       : 500,
            }}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === pagination.totalPages}
          onClick={() => onPage(page + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[13px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    )}
  </div>
);

export default ApplicationsList;
