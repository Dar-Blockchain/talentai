import React from "react";
import { Box, Pagination } from "@mui/material";
import ApplicationCard from "@/components/features/company/applications/ApplicationCard";
import { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { ContactTarget } from "../ContactCandidateModal";
import { AssessmentTarget } from "../AssessmentDetailsModal";

const TEAL = "#0D9488";

interface Props {
  rows: ApplicationSummaryItem[];
  postId: string;
  page: number;
  pagination: { totalPages: number };
  onPage: (page: number) => void;
  onContact: (t: ContactTarget) => void;
  onAssessment: (t: AssessmentTarget) => void;
  invitedIds: Set<string>;
  onInviteSuccess: (appId: string) => void;
}

const ApplicationsList: React.FC<Props> = ({
  rows, postId, page, pagination, onPage, onContact, onAssessment, invitedIds, onInviteSuccess,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    {rows.map((app: ApplicationSummaryItem) => (
      <ApplicationCard
        key={String(app.id)}
        app={app}
        postId={postId}
        onContact={onContact}
        onAssessment={onAssessment}
        invitedIds={invitedIds}
        onInviteSuccess={onInviteSuccess}
      />
    ))}
    {pagination.totalPages > 1 && (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
        <Pagination
          count={pagination.totalPages}
          page={page}
          onChange={(_, v) => onPage(v)}
          shape="rounded"
          size="small"
          sx={{ "& .MuiPaginationItem-root": { fontWeight: 500 }, "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 } }}
        />
      </Box>
    )}
  </Box>
);

export default ApplicationsList;
