import React from "react";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";

interface Props {
  open: boolean;
  resumeFilename: string | null | undefined;
  activeAppCount: number | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCvDialog: React.FC<Props> = ({ open, resumeFilename, activeAppCount, onClose, onConfirm }) => (
  <ConfirmDialog
    open={open}
    onCancel={onClose}
    onConfirm={onConfirm}
    title="Delete CV"
    description={
      <>
        Are you sure you want to remove <strong>{resumeFilename}</strong>? You can upload a new one at any time.
      </>
    }
  >
    {activeAppCount != null && activeAppCount > 0 && (
      <p className="text-[0.78rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 text-left">
        You have <strong>{activeAppCount} active {activeAppCount === 1 ? "application" : "applications"}</strong> that will be automatically withdrawn. You can reactivate {activeAppCount === 1 ? "it" : "them"} after uploading a new CV.
      </p>
    )}
  </ConfirmDialog>
);

export default DeleteCvDialog;
