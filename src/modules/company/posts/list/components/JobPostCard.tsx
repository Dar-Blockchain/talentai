import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CardHeader from "./cards/CardHeader";
import CardMeta from "./cards/CardMeta";
import CardFooter from "./cards/CardFooter";
import CardDraftBanner from "./cards/CardDraftBanner";
import CardQrDialog from "./cards/CardQrDialog";
import { getDaysLeft, getPostShareLink, copyToClipboard } from "../utils";
import { useToast } from "@/hooks/useToast";
import { useDepartmentList } from "@/modules/company/departments/hooks";

interface JobPostCardProps {
  job: any;
  index?: number;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPublish?: (id: string) => void;
  canDelete?: boolean;
}

const JobPostCard = memo<JobPostCardProps>(({ job, index = 0, onDelete, onViewDetails, onPublish }) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [copied, setCopied]         = useState(false);
  const [qrOpen, setQrOpen]         = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation("posts");

  const { departments } = useDepartmentList();
  const jd        = job.jobDetails || {};
  const isDraft   = job.status === "draft";
  const departmentName = jd.department ? departments.find((d) => d._id === jd.department)?.name : undefined;
  const daysLeft  = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const statusKey = isDraft ? "draft" : isExpired ? "expired" : job.status === "closed" ? "closed" : "active";

  const shareLink = getPostShareLink(job._id, job.user?._id);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor(null);
    const ok = await copyToClipboard(shareLink);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({ message: t("detail.toast.link_copied"), severity: "success" });
    } else {
      showToast({ message: t("detail.toast.link_copy_error"), severity: "error" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      style={{ height: "100%", minWidth: 0 }}
    >
      <div
        onClick={() => onViewDetails(job._id)}
        className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all hover:-translate-y-px hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
      >
        <div className="h-[3px] shrink-0" style={{ backgroundColor: isDraft ? "#F59E0B" : "#E5E7EB" }} />

        <div className="flex flex-1 flex-col gap-3.5 p-5">
          <CardHeader
            jobId={job._id}
            title={jd.title}
            statusKey={statusKey}
            isDraft={isDraft}
            copied={copied}
            menuAnchor={menuAnchor}
            onMenuOpen={(e) => setMenuAnchor(e.currentTarget)}
            onMenuClose={() => setMenuAnchor(null)}
            onDelete={() => onDelete(job._id)}
            onPublish={onPublish ? () => onPublish(job._id) : undefined}
            onCopyLink={handleCopyLink}
          />

          <CardMeta
            location={jd.location}
            employmentType={jd.employmentType}
            workMode={jd.workMode}
            department={departmentName}
          />

          <CardFooter
            isDraft={isDraft}
            createdAt={job.createdAt}
            expirationDate={job.expirationDate}
            daysLeft={daysLeft}
            isExpired={isExpired}
            copied={copied}
            applicationsCount={job.applicationsCount}
            onOpenQr={(e) => { e.stopPropagation(); setQrOpen(true); }}
            onCopyLink={handleCopyLink}
          />
        </div>

        {isDraft && onPublish && (
          <CardDraftBanner onPublish={(e) => { e.stopPropagation(); onPublish(job._id); }} />
        )}
      </div>

      {!isDraft && (
        <CardQrDialog
          open={qrOpen}
          jobId={job._id}
          shareLink={shareLink}
          onClose={() => setQrOpen(false)}
        />
      )}
    </motion.div>
  );
});

JobPostCard.displayName = "JobPostCard";
export default JobPostCard;
