import React from "react";
import { Box } from "@mui/material";
import PostBasicDetails from "./PostBasicDetails";
import RecruitmentFlowDetails from "./RecruitmentFlowDetails";
import EditPostDetails from "./EditPostDetails";

type EditMode = "post" | null;

interface Props {
  activeEdit: EditMode;
  isOwner: boolean;
  creationType?: string;
  job: any;
  onEditPost: () => void;
  onCancelEdit: () => void;
  onSaveSuccess: () => void;
}

const JobDetailContent: React.FC<Props> = ({
  activeEdit,
  isOwner,
  creationType,
  job,
  onEditPost,
  onCancelEdit,
  onSaveSuccess,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {activeEdit === "post" && (
      <EditPostDetails key="edit-post" job={job} onCancel={onCancelEdit} onSaveSuccess={onSaveSuccess} />
    )}
    {activeEdit === null && (
      <>
        <PostBasicDetails job={job} onEdit={onEditPost} canEdit={isOwner} />
        {creationType !== "ai" && (
          <RecruitmentFlowDetails job={job} canEdit={isOwner} />
        )}
      </>
    )}
  </Box>
);

export default JobDetailContent;
