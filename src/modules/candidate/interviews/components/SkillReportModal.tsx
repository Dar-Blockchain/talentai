import React from "react";
import { Download, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import SkillInterviewReport from "./SkillInterviewReport";

interface Props {
  /** Assessment id to show, or null/undefined when the modal should be closed. */
  interviewId?: string | null;
  onClose: () => void;
}

const SkillReportModal: React.FC<Props> = ({ interviewId, onClose }) => {
  const { t } = useTranslation("modules/interview/skill-interview");

  return (
    <Dialog open={!!interviewId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl w-full max-h-[88vh] overflow-y-auto p-0 gap-0 rounded-2xl"
      >
        <DialogTitle className="sr-only">Skill Interview Report</DialogTitle>

        {/* Sticky toolbar — stays pinned above the scrolling report so both
            actions remain reachable no matter how far the report is scrolled. */}
        <div className="sticky top-0 z-10 flex items-center justify-end gap-1.5 px-4 py-2.5 bg-card/95 backdrop-blur-sm border-b border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className="h-8 gap-1.5 px-3 text-[0.72rem] font-bold rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Download size={13} />
            {t("report.download_pdf")}
          </Button>
          <div className="w-px h-5 bg-gray-200" />
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="size-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
            >
              <X size={16} />
            </button>
          </DialogClose>
        </div>

        {interviewId && <SkillInterviewReport interviewId={interviewId} showDownloadButton={false} />}
      </DialogContent>
    </Dialog>
  );
};

export default SkillReportModal;
