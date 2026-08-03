import React from "react";
import { Pencil, Save, X } from "lucide-react";
import Spinner from "./Spinner";

interface EditActionsProps {
  isEditing:  boolean;
  loading:    boolean;
  onEdit:     () => void;
  onCancel:   () => void;
  onSave:     () => void;
  disabled?:  boolean;
}

const EditActions: React.FC<EditActionsProps> = ({ isEditing, loading, onEdit, onCancel, onSave, disabled }) =>
  !isEditing ? (
    <button
      type="button"
      onClick={onEdit}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-border px-2.5 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Pencil size={13} />
      <span className="hidden sm:inline">Edit</span>
    </button>
  ) : (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <X size={13} />
        <span className="hidden sm:inline">Cancel</span>
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg bg-primary-dark px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark/90 disabled:opacity-60 transition-colors cursor-pointer"
      >
        {loading ? (
          <Spinner size={13} className="border-white/40 border-t-white" />
        ) : (
          <>
            <Save size={13} />
            <span className="hidden sm:inline">Save</span>
          </>
        )}
      </button>
    </div>
  );

export default EditActions;
