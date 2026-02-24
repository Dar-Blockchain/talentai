import React from "react";
import { Box } from "@mui/material";
import PostBasicDetails from "@/components/posts/details/PostBasicDetails";
import RecruitmentFlowDetails from "@/components/posts/details/RecruitmentFlowDetails";
import EditPostDetails from "@/components/posts/edit/EditPostDetails";
import EditRecruitmentFlow from "@/components/posts/edit/EditRecruitmentFlow";

type EditMode = "post" | "recruitment" | null;

interface Props {
  activeEdit: EditMode;
  isOwner: boolean;
  creationType?: string;
  onEditPost: () => void;
  onEditRecruitment: () => void;
  onCancelEdit: () => void;
  onSaveSuccess: () => void;
}

const JobDetailContent: React.FC<Props> = ({
  activeEdit,
  isOwner,
  creationType,
  onEditPost,
  onEditRecruitment,
  onCancelEdit,
  onSaveSuccess,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {activeEdit === "post" && (
      <EditPostDetails onCancel={onCancelEdit} onSaveSuccess={onSaveSuccess} />
    )}
    {activeEdit === "recruitment" && (
      <EditRecruitmentFlow onCancel={onCancelEdit} />
    )}
    {activeEdit === null && (
      <>
        <PostBasicDetails onEdit={onEditPost} canEdit={isOwner} />
        {creationType !== "ai" && (
          <RecruitmentFlowDetails onEdit={onEditRecruitment} canEdit={isOwner} />
        )}
      </>
    )}
  </Box>
);

export default JobDetailContent;
