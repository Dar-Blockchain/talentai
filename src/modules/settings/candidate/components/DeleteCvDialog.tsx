import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";

interface Props {
  open: boolean;
  resumeFilename: string | null | undefined;
  activeAppCount: number | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCvDialog: React.FC<Props> = ({ open, resumeFilename, activeAppCount, onClose, onConfirm }) => (
  <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent showCloseButton={false} className="max-w-xs w-full rounded-2xl overflow-hidden p-0">
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <span className="font-bold text-[1rem] text-gray-900">Delete CV</span>
        </div>
      </div>
      <div className="px-5">
        <p className="text-[0.88rem] text-gray-600 leading-relaxed">
          Are you sure you want to remove <strong>{resumeFilename}</strong>? You can upload a new one at any time.
        </p>
        {activeAppCount != null && activeAppCount > 0 && (
          <p className="text-[0.78rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            You have <strong>{activeAppCount} active {activeAppCount === 1 ? "application" : "applications"}</strong> that will be automatically withdrawn. You can reactivate {activeAppCount === 1 ? "it" : "them"} after uploading a new CV.
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 px-5 py-4">
        <button type="button" onClick={onClose}
          className="text-gray-500 rounded-[10px] text-[0.85rem] px-3 py-2 hover:bg-gray-50">
          Cancel
        </button>
        <button type="button" onClick={onConfirm}
          className="font-semibold rounded-[10px] text-[0.85rem] px-3 py-2 bg-red-600 text-white hover:bg-red-700">
          Delete
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

export default DeleteCvDialog;
