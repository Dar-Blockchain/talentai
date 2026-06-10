import React, { memo } from "react";
import { Box } from "@mui/material";
import PostBasicDetails from "./PostBasicDetails";
import RecruitmentFlowDetails from "./RecruitmentFlowDetails";
import EditPostDetails from "./EditPostDetails";

type EditMode = "post" | "recruitment" | null;

const CONTAINER_SX = { display: "flex", flexDirection: "column", gap: 2 } as const;

interface Props {
  activeEdit: EditMode;
  isOwner: boolean;
  creationType?: string;
  onEditPost: () => void;
  onEditRecruitment: () => void;
  onCancelEdit: () => void;
  onSaveSuccess: () => void;
}

const JobDetailContent = memo<Props>(({
  activeEdit, isOwner, creationType,
  onEditPost, onCancelEdit, onSaveSuccess,
}) => (
  <Box sx={CONTAINER_SX}>
    {activeEdit === "post" && (
      <EditPostDetails key="edit-post" onCancel={onCancelEdit} onSaveSuccess={onSaveSuccess} />
    )}
    {activeEdit === null && (
      <>
        <PostBasicDetails onEdit={onEditPost} canEdit={isOwner} />
        {creationType !== "ai" && <RecruitmentFlowDetails canEdit={isOwner} />}
      </>
    )}
    {activeEdit === "recruitment" && (
      <RecruitmentFlowDetails canEdit={isOwner} />
    )}
  </Box>
));
JobDetailContent.displayName = "JobDetailContent";

export default JobDetailContent;
