import React, { useRef, useState } from "react";
import { FileText, UploadCloud, ExternalLink, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal, Spinner } from "@/modules/settings/shared/components";
import { candidateApi } from "../api";
import { emitToast } from "@/utils/toastEmitter";

interface Props {
  resumeFilename: string | null | undefined;
  onUpdated: (filename: string) => void;
  onDeleted: () => void;
}

const CvSection: React.FC<Props> = ({ resumeFilename, onUpdated, onDeleted }) => {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]     = useState(false);
  const [analysing, setAnalysing]     = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress]       = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const cvUrl   = resumeFilename ? `${baseUrl}/resume/${resumeFilename}` : null;

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await candidateApi.deleteResume();
      onDeleted();
      emitToast({ message: "CV removed.", severity: "success" });
    } catch {
      setError("Failed to remove CV. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) { setError("Only PDF, DOC, and DOCX files are allowed."); return; }
    setError(null);
    setUploading(true);
    setProgress(0);
    const tick = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 300);
    try {
      const result = await candidateApi.uploadResume(file);
      clearInterval(tick);
      setProgress(100);
      const filename = result?.resume ?? result?.data?.resume ?? file.name;
      onUpdated(filename);
      emitToast({ message: "CV uploaded! Analysing your CV in the background…", severity: "success" });
      setTimeout(() => { setProgress(0); setAnalysing(true); }, 800);
      // Show analysing badge for ~30s — the backend runs analysis async
      setTimeout(() => setAnalysing(false), 30_000);
    } catch (err: any) {
      clearInterval(tick);
      setProgress(0);
      setError(err?.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg border-l-[3px] border-l-teal-600">
        <p className="text-[0.9rem] font-bold text-gray-900">Resume / CV</p>
        <p className="text-[0.78rem] text-gray-400 mt-1">
          Upload your latest CV. This will be used for all new job applications.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[0.8rem] text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Current CV */}
      {cvUrl ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-200">
          <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0 bg-teal-600/10">
            <FileText size={20} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.82rem] font-bold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">
              {resumeFilename}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {analysing ? (
                <>
                  <Spinner size={10} className="border-amber-200 border-t-amber-600" />
                  <span className="text-[0.72rem] text-amber-600 font-semibold">Analysing…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} className="text-teal-600" />
                  <span className="text-[0.72rem] font-semibold text-teal-600">Active CV</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => window.open(cvUrl, "_blank")}
              className="inline-flex items-center gap-1 text-[0.72rem] font-semibold rounded-lg px-2 py-1 text-teal-600 transition-colors hover:bg-teal-600/10"
            >
              <ExternalLink size={13} />
              View
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-1 text-[0.72rem] font-semibold rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {deleting ? <Spinner size={12} className="border-red-200 border-t-red-600" /> : <Trash2 size={13} />}
              {deleting ? "Removing…" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-[0.82rem] text-amber-800">No CV on file. Upload one below so recruiters can review your profile.</p>
        </div>
      )}

      {/* Upload zone */}
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        className={`border-[1.5px] border-dashed rounded-xl py-5 px-4 flex flex-col items-center gap-2 transition-colors ${
          uploading ? "cursor-default" : "cursor-pointer"
        } ${isDragging ? "border-teal-600 bg-teal-50" : "border-gray-200 bg-[#FAFAFA] hover:border-teal-600 hover:bg-teal-50"}`}
      >
        {uploading ? (
          <Spinner size={24} />
        ) : (
          <UploadCloud size={28} className={isDragging ? "text-teal-600" : "text-gray-400"} />
        )}
        <p className={`text-[0.82rem] font-semibold text-center ${isDragging ? "text-teal-600" : "text-gray-700"}`}>
          {uploading ? "Uploading…" : isDragging ? "Drop your CV here" : cvUrl ? "Upload a new CV" : "Upload your CV"}
        </p>
        <p className="text-[0.72rem] text-gray-400">PDF, DOC, DOCX · Max 5 MB</p>
      </div>

      {uploading && progress > 0 && (
        <div className="h-1 rounded-full overflow-hidden bg-teal-600/[0.09]">
          <div
            className="h-full rounded-full bg-teal-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
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
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="text-gray-500 rounded-[10px] text-[0.85rem] px-3 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            className="font-semibold rounded-[10px] text-[0.85rem] px-3 py-2 bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CvSection;
