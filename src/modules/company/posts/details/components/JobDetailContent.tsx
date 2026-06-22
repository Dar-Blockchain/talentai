import React from "react";
import { Box } from "@mui/material";
import PostBasicDetails from "./PostBasicDetails";
import EditPostDetails from "./EditPostDetails";

type EditMode = "post" | null;

interface Props {
  activeEdit: EditMode;
  isOwner: boolean;
  job: any;
  onEditPost: () => void;
  onCancelEdit: () => void;
  onSaveSuccess: () => void;
}

const JobDetailContent: React.FC<Props> = ({
  activeEdit,
  isOwner,
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
      <PostBasicDetails job={job} onEdit={onEditPost} canEdit={isOwner} />
    )}
  </Box>
);

export default JobDetailContent;
