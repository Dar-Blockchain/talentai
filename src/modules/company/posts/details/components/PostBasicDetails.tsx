import React from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import { getPostSkills } from "@/utils/postHelpers";
import ThresholdCard from "./overview/ThresholdCard";
import OverviewCard from "./overview/OverviewCard";
import SkillsCard from "./overview/SkillsCard";
import BulletListCard from "./overview/BulletListCard";

interface Props {
  job: any;
  canEdit: boolean;
  onEdit: () => void;
}

const PostBasicDetails: React.FC<Props> = ({ job, canEdit }) => {
  const { t } = useTranslation("posts");
  if (!job) return null;

  const jd            = job.jobDetails || {};
  const displaySkills = getPostSkills(job);
  const languages     = job.interviewLanguages?.length ? job.interviewLanguages : ["en"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <ThresholdCard
        jobId={job._id}
        initial={job.thresholdScore ?? 50}
        canEdit={canEdit}
        isDraft={job.status === "draft"}
      />

      <OverviewCard jd={jd} createdAt={job.createdAt} interviewLanguages={languages} />

      <SkillsCard skills={displaySkills} />

      <BulletListCard
        icon={<WorkOutlined sx={{ fontSize: 15 }} />}
        title={t("detail.details.requirements")}
        items={jd.requirements || []}
        bulletColor="#0D9488"
      />

      <BulletListCard
        icon={<WorkOutlined sx={{ fontSize: 15 }} />}
        title={t("detail.details.responsibilities")}
        items={jd.responsibilities || []}
        bulletColor="#6366F1"
      />
    </Box>
  );
};

export default PostBasicDetails;
