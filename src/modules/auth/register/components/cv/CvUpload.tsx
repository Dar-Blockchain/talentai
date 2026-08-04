import React from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement>;
  cvFile: File | null;
  cvError: boolean;
  isDragging: boolean;
  onFileChange: (file: File | null) => void;
  onDragChange: (dragging: boolean) => void;
}

const CvUpload: React.FC<Props> = ({ fileInputRef, cvFile, cvError, isDragging, onFileChange, onDragChange }) => {
  const { t } = useTranslation("auth");

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider font-sans mb-1.5">
        {t("candidate_form.cv_label")}
        <span className="text-destructive ml-0.5">*</span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); onDragChange(true); }}
        onDragLeave={(e) => { e.preventDefault(); onDragChange(false); }}
        onDrop={(e) => {
          e.preventDefault(); onDragChange(false);
          const f = e.dataTransfer.files?.[0] ?? null;
          if (f && /\.(pdf|doc|docx)$/i.test(f.name)) onFileChange(f);
        }}
        className={cn(
          "flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-[1.5px] border-dashed cursor-pointer",
          "transition-all duration-200 select-none",
          cvError    && "border-destructive bg-destructive/5",
          isDragging && "border-primary/60 bg-primary/5 scale-[1.015] shadow-lg shadow-primary/10",
          cvFile && !isDragging && !cvError && "border-primary/50 bg-primary/5",
          !cvFile && !isDragging && !cvError && "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50",
        )}
      >
        {/* Icon */}
        <div className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200",
          cvFile || isDragging ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border",
        )}>
          {cvFile
            ? <CheckCircle2 className="size-4 text-primary" />
            : <UploadCloud className={cn("size-4", isDragging ? "text-primary" : "text-muted-foreground")} />}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-sans font-semibold text-xs sm:text-[0.8125rem] truncate leading-snug",
            cvFile ? "text-foreground" : isDragging ? "text-primary" : "text-foreground/80",
          )}>
            {cvFile ? cvFile.name : isDragging ? t("candidate_form.cv_drop") : t("candidate_form.cv_browse")}
          </p>
          <p className="font-sans text-[0.65rem] sm:text-xs text-muted-foreground leading-snug mt-0.5">
            {cvFile ? (
              <>{(cvFile.size / 1024).toFixed(0)} KB · <span className="text-primary font-semibold">{t("candidate_form.cv_replace")}</span></>
            ) : cvError ? (
              <span className="text-destructive">{t("candidate_form.cv_required")}</span>
            ) : (
              t("candidate_form.cv_formats")
            )}
          </p>
        </div>

        {/* Format badges */}
        {!cvFile && !isDragging && (
          <div className="flex gap-1 shrink-0">
            {["PDF", "DOC"].map((fmt) => (
              <span key={fmt} className="px-1.5 py-0.5 rounded text-[0.55rem] sm:text-[0.6rem] font-bold tracking-wide text-muted-foreground bg-muted border border-border uppercase">
                {fmt}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CvUpload;
