import React from "react";
import type { JobDetail } from "@/modules/company/posts/details/types";
import PostBasicDetails from "./PostBasicDetails";
import EditPostDetails from "./EditPostDetails";

type EditMode = "post" | null;

interface Props {
  activeEdit: EditMode;
  isOwner: boolean;
  job: JobDetail;
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
  <div className="flex flex-col gap-4">
    {activeEdit === "post" && (
      <EditPostDetails key="edit-post" job={job} onCancel={onCancelEdit} onSaveSuccess={onSaveSuccess} />
    )}
    {activeEdit === null && (
      <PostBasicDetails job={job} onEdit={onEditPost} canEdit={isOwner} />
    )}
  </div>
);

export default JobDetailContent;
