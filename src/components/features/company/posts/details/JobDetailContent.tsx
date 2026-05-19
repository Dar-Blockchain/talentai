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
  onEditPost: () => void;
  onCancelEdit: () => void;
  onSaveSuccess: () => void;
}

const JobDetailContent: React.FC<Props> = ({
  activeEdit,
  isOwner,
  creationType,
  onEditPost,
  onCancelEdit,
  onSaveSuccess,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {activeEdit === "post" && (
      <EditPostDetails key="edit-post" onCancel={onCancelEdit} onSaveSuccess={onSaveSuccess} />
    )}
    {activeEdit === null && (
      <>
        <PostBasicDetails onEdit={onEditPost} canEdit={isOwner} />
        {creationType !== "ai" && (
          <RecruitmentFlowDetails canEdit={isOwner} />
        )}
      </>
    )}
  </Box>
);

export default JobDetailContent;
