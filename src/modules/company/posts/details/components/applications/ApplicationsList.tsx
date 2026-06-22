import React from "react";
import ApplicationCard from "@/modules/company/applications/components/ApplicationCard";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { ContactTarget } from "../ContactCandidateModal";
import { SimplePagination } from "@/modules/shared/ui/shadcn/pagination-simple";

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
      <SimplePagination page={page} totalPages={pagination.totalPages} onPageChange={onPage} className="mt-2" />
    )}
  </div>
);

export default ApplicationsList;
