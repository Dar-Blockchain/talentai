import React from "react";
import { Pencil, Save, X } from "lucide-react";
import Spinner from "./Spinner";

interface EditActionsProps {
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditActions: React.FC<EditActionsProps> = ({ isEditing, loading, onEdit, onCancel, onSave }) =>
  !isEditing ? (
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
    >
      <Pencil size={14} />
      Edit
    </button>
  ) : (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <X size={14} />
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <Spinner size={14} className="border-white/40 border-t-white" />
        ) : (
          <>
            <Save size={14} />
            Save
          </>
        )}
      </button>
    </div>
  );

export default EditActions;
