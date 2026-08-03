import React, { useRef, useState } from "react";
import { FileText, UploadCloud, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/modules/settings/shared/components";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { candidateApi } from "../api";
import { emitToast } from "@/utils/toastEmitter";
import DeleteCvDialog from "./DeleteCvDialog";

interface Props {
  resumeFilename: string | null | undefined;
  onUpdated: (filename: string, cvAnalysis?: any) => void;
  onDeleted: () => void;
  compact?: boolean;
}

const CvSection: React.FC<Props> = ({ resumeFilename, onUpdated, onDeleted, compact = false }) => {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]         = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [activeAppCount, setActiveAppCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount]   = useState(false);
  const [progress, setProgress]           = useState(0);
  const [error, setError]                 = useState<string | null>(null);
  const [isDragging, setIsDragging]       = useState(false);

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const cvUrl   = resumeFilename ? `${baseUrl}/resume/${resumeFilename}` : null;

  const handleDeleteClick = async () => {
    setLoadingCount(true);
    try {
      const count = await candidateApi.fetchActiveApplicationsCount();
      setActiveAppCount(count);
    } catch {
      setActiveAppCount(0);
    } finally {
      setLoadingCount(false);
      setConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await candidateApi.deleteResume();
      onDeleted();
      emitToast({ message: "CV removed.", severity: "success" });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to remove CV. Please try again.");
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
      const filename   = result?.data?.resume ?? result?.resume ?? file.name;
      const cvAnalysis = result?.data?.cvAnalysis ?? null;
      onUpdated(filename, cvAnalysis);
      emitToast({ message: "CV uploaded and analysed successfully.", severity: "success" });
      setTimeout(() => setProgress(0), 800);
    } catch (err: any) {
      clearInterval(tick);
      setProgress(0);
      setError(err?.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  /* ── Hidden file input (used by both compact and full modes) ── */
  const fileInput = (
    <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
      onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
  );

  /* ── Shared CV pill ── */
  const cvPill = cvUrl ? (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-light border border-primary-border min-w-0">
      <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
        <FileText size={16} className="text-primary-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.8rem] font-bold text-gray-900 truncate">{resumeFilename}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CheckCircle2 size={11} className="text-primary-dark shrink-0" />
          <span className="text-[0.68rem] font-semibold text-primary-dark">Active CV</span>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" onClick={() => window.open(cvUrl, "_blank")}
          className="size-7 p-0 rounded-lg text-primary-dark hover:bg-primary/10" title="View">
          <ExternalLink size={13} />
        </Button>
        <Button variant="ghost" onClick={() => !uploading && inputRef.current?.click()} disabled={uploading}
          className="size-7 p-0 rounded-lg text-blue-600 hover:bg-blue-50" title="Update">
          {uploading ? <Spinner size={11} className="border-blue-200 border-t-blue-600" /> : <UploadCloud size={13} />}
        </Button>
        <Button variant="ghost" disabled={deleting || loadingCount} onClick={handleDeleteClick}
          className="size-7 p-0 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
          {deleting || loadingCount ? <Spinner size={11} className="border-red-200 border-t-red-600" /> : <Trash2 size={13} />}
        </Button>
      </div>
    </div>
  ) : (
    <button type="button" onClick={() => !uploading && inputRef.current?.click()} disabled={uploading}
      className="w-full inline-flex items-center justify-center gap-2 text-[0.8rem] font-semibold rounded-xl px-3 py-2.5 border border-dashed border-primary-border text-primary-dark hover:bg-primary-light transition-colors disabled:opacity-60 cursor-pointer">
      {uploading ? <Spinner size={14} /> : <UploadCloud size={16} />}
      {uploading ? "Uploading…" : "Upload CV"}
    </button>
  );

  /* ── Shared delete confirmation dialog ── */
  const deleteDialog = (
    <DeleteCvDialog
      open={confirmOpen}
      resumeFilename={resumeFilename}
      activeAppCount={activeAppCount}
      onClose={() => setConfirmOpen(false)}
      onConfirm={handleDeleteConfirm}
    />
  );

  /* ── Compact mode ── */
  if (compact) {
    return (
      <>
        {fileInput}
        <div className="flex flex-col gap-2">
          {error && (
            <div className="flex items-center justify-between rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[0.75rem] text-red-700">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">×</button>
            </div>
          )}
          {cvPill}
          {uploading && progress > 0 && (
            <div className="h-1 rounded-full overflow-hidden bg-primary/10">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        {deleteDialog}
      </>
    );
  }

  /* ── Full mode ── */
  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center justify-between rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[0.8rem] text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {cvUrl && cvPill}

      {/* Upload zone */}
      {fileInput}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        className={`border-[1.5px] border-dashed rounded-xl py-5 px-4 flex flex-col items-center gap-2 transition-colors ${
          uploading ? "cursor-default" : "cursor-pointer"
        } ${isDragging ? "border-primary bg-primary-light" : "border-border bg-muted/30 hover:border-primary hover:bg-primary-light"}`}
      >
        {uploading ? (
          <Spinner size={24} />
        ) : (
          <UploadCloud size={28} className={isDragging ? "text-primary-dark" : "text-gray-400"} />
        )}
        <p className={`text-[0.82rem] font-semibold text-center ${isDragging ? "text-primary-dark" : "text-gray-700"}`}>
          {uploading ? "Uploading & analysing…" : isDragging ? "Drop your CV here" : cvUrl ? "Upload a new CV" : "Upload your CV"}
        </p>
        <p className="text-[0.72rem] text-gray-400">PDF, DOC, DOCX · Max 5 MB</p>
      </div>

      {uploading && progress > 0 && (
        <div className="h-1 rounded-full overflow-hidden bg-primary/10">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {deleteDialog}
    </div>
  );
};

export default CvSection;
