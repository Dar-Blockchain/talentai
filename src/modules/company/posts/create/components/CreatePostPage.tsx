import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setInterviewLanguages, selectGeneratedPost } from "../store/createPostSlice";
import { useAiPostStepper } from "../hooks";
import PostDetailsStep from "./PostDetailsStep";
import InterviewLanguagesModal from "./InterviewLanguagesModal";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";

import { TEAL } from "@/modules/company/posts/shared/constants";

const CreatePostPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const generatedPost = useSelector(selectGeneratedPost);
  const interviewLanguages = useSelector((state: RootState) => state.postGeneration.interviewLanguages);
  const savedPostId = null;

  const [langModalOpen, setLangModalOpen] = useState(false);
  const { t } = useTranslation("posts");
  const { t: td } = useTranslation("dashboard");

  const { isFinishing, handleNext, handleBack } = useAiPostStepper(
    generatedPost,
    savedPostId,
    interviewLanguages
  );

  const handleLanguageConfirm = (languages: string[]) => {
    dispatch(setInterviewLanguages(languages));
    setLangModalOpen(false);
    handleNext(languages);
  };

  return (
    <Box>
      <PageHeader
        title={t("create.title")}
        subtitle={t("create.subtitle")}
        icon={WorkOutlineOutlined}
        breadcrumbs={[
          { label: td("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("title"), href: "/company/posts" },
          { label: t("create.title") },
        ]}
      />

      <Box sx={{ mb: 12 }}>
        <PostDetailsStep />
      </Box>

      <Box
        sx={{
          position: "fixed", bottom: 0,
          left: "var(--layout-sidebar-width, 0px)",
          width: "calc(100% - var(--layout-sidebar-width, 0px))",
          bgcolor: "#fff", borderTop: "1px solid #E5E7EB",
          py: 2, px: { xs: 2, md: 4 },
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 2, zIndex: 1200,
          transition: "left 0.3s, width 0.3s",
        }}
      >
        <Button
          onClick={handleBack}
          disabled={isFinishing}
          variant="outline"
          className="h-[42px] rounded-[10px] px-6 text-[13px] font-semibold text-gray-700"
        >
          {t("create.btn_cancel")}
        </Button>

        <Button
          onClick={() => setLangModalOpen(true)}
          disabled={!generatedPost || isFinishing}
          loading={isFinishing}
          className="h-[42px] rounded-[10px] px-8 text-[13px] font-bold"
        >
          {isFinishing ? t("create.btn_saving") : t("create.btn_save_draft")}
        </Button>
      </Box>

      <InterviewLanguagesModal
        open={langModalOpen}
        onConfirm={handleLanguageConfirm}
        onClose={() => setLangModalOpen(false)}
      />
    </Box>
  );
};

export default CreatePostPage;
