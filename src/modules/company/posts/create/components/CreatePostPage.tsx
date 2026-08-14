import React, { useState } from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Briefcase as WorkOutlineOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setInterviewLanguages, selectGeneratedPost } from "../store/createPostSlice";
import { useAiPostStepper } from "../hooks";
import PostDetailsStep from "./PostDetailsStep";
import InterviewLanguagesModal from "./InterviewLanguagesModal";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import NoPlanModal from "../../shared/components/NoPlanModal";

const CreatePostPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const generatedPost = useSelector(selectGeneratedPost);
  const interviewLanguages = useSelector((state: RootState) => state.postGeneration.interviewLanguages);
  const savedPostId = null;

  const [langModalOpen, setLangModalOpen] = useState(false);
  const { t } = useTranslation("posts");
  const { t: td } = useTranslation("dashboard");

  const { isFinishing, handleNext, handleBack, postsLimitInfo, closePostsLimitModal } = useAiPostStepper(
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
    <div>
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

      <div className="mb-24">
        <PostDetailsStep />
      </div>

      <div
        className="fixed bottom-0 z-[1200] flex items-center justify-end gap-4 border-t border-[#E5E7EB] bg-white px-4 py-4 transition-[left,width] duration-300 md:px-8"
        style={{
          left: "var(--layout-sidebar-width, 0px)",
          width: "calc(100% - var(--layout-sidebar-width, 0px))",
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
      </div>

      <InterviewLanguagesModal
        open={langModalOpen}
        onConfirm={handleLanguageConfirm}
        onClose={() => setLangModalOpen(false)}
      />

      <NoPlanModal
        open={!!postsLimitInfo}
        reason="posts_limit"
        used={postsLimitInfo?.used}
        limit={postsLimitInfo?.limit}
        onClose={closePostsLimitModal}
      />
    </div>
  );
};

export default CreatePostPage;
