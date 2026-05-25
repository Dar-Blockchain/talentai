import { memo, useState } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import CardHeader from "./cards/CardHeader";
import CardMeta from "./cards/CardMeta";
import CardFooter from "./cards/CardFooter";
import CardDraftBanner from "./cards/CardDraftBanner";
import CardQrDialog from "./cards/CardQrDialog";

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

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

  const jd        = job.jobDetails || {};
  const isDraft   = job.status === "draft";
  const daysLeft  = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const statusKey = isDraft ? "draft" : isExpired ? "expired" : job.status === "closed" ? "closed" : "active";

  const getShareLink = () => {
    if (typeof window === "undefined") return "";
    const companyId = job.user?._id || "";
    return `${window.location.origin}/candidate/interview/hr?jobId=${job._id}${companyId ? `&companyId=${companyId}` : ""}&ref=link`;
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor(null);
    navigator.clipboard.writeText(getShareLink()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      style={{ height: "100%", minWidth: 0 }}
    >
      <Box
        onClick={() => onViewDetails(job._id)}
        sx={{
          bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px",
          display: "flex", flexDirection: "column", height: "100%",
          overflow: "hidden", cursor: "pointer", transition: "all 0.15s",
          "&:hover": { borderColor: "#D1D5DB", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", transform: "translateY(-1px)" },
        }}
      >
        <Box sx={{ height: 3, bgcolor: isDraft ? "#F59E0B" : "#E5E7EB", flexShrink: 0 }} />

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.75, flex: 1 }}>
          <CardHeader
            jobId={job._id}
            title={jd.title}
            creationType={job.creationType}
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
            description={jd.description}
          />

          <CardFooter
            isDraft={isDraft}
            createdAt={job.createdAt}
            expirationDate={job.expirationDate}
            daysLeft={daysLeft}
            isExpired={isExpired}
            copied={copied}
            onOpenQr={(e) => { e.stopPropagation(); setQrOpen(true); }}
            onCopyLink={handleCopyLink}
          />
        </Box>

        {isDraft && onPublish && (
          <CardDraftBanner onPublish={(e) => { e.stopPropagation(); onPublish(job._id); }} />
        )}
      </Box>

      {!isDraft && (
        <CardQrDialog
          open={qrOpen}
          jobId={job._id}
          shareLink={getShareLink()}
          onClose={() => setQrOpen(false)}
        />
      )}
    </motion.div>
  );
});

JobPostCard.displayName = "JobPostCard";
export default JobPostCard;
