import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setInterviewLanguages, selectGeneratedPost } from "@/store/slices/postGenerationSlice";
import { selectSavedPostId } from "@/store/slices/postSlice";
import { useAiPostStepper } from "./hooks";
import PostDetailsStep from "./components/PostDetailsStep";
import InterviewLanguagesModal from "./components/InterviewLanguagesModal";
import PageHeader from "@/components/layout/dashboard/PageHeader";

const TEAL = "#0D9488";

const CreateStepper: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const generatedPost = useSelector(selectGeneratedPost);
  const interviewLanguages = useSelector((state: RootState) => state.postGeneration.interviewLanguages);
  const savedPostId = useSelector(selectSavedPostId);

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
          sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", borderRadius: "10px", height: 42, px: 3, color: "#374151", border: "1px solid #D1D5DB", "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" } }}
        >
          {t("create.btn_cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={() => setLangModalOpen(true)}
          disabled={!generatedPost || isFinishing}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: "13px", borderRadius: "10px", height: 42, px: 4, bgcolor: TEAL, color: "#fff", "&:hover": { bgcolor: "#0F766E" }, "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" } }}
        >
          {isFinishing ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: "#9CA3AF" }} />
              {t("create.btn_saving")}
            </Box>
          ) : t("create.btn_save_draft")}
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

export default CreateStepper;
