import React from "react";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import { Box, Alert } from "@mui/material";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useTranslation } from "react-i18next";

import { usePostDetailPage } from "@/modules/posts/details/hooks/usePostDetailPage";
import JobDetailHeader from "@/modules/posts/details/components/JobDetailHeader";
import JobDetailContent from "@/modules/posts/details/components/JobDetailContent";
import JobQrDialog from "@/modules/posts/details/components/JobQrDialog";
import ApplicationsView from "@/modules/posts/details/components/ApplicationsView";
import DeletePostModal from "@/modules/posts/list/components/DeletePostModal";
import PublishConfirmModal from "@/modules/posts/list/components/PublishConfirmModal";
import InterviewLanguagesModal from "@/modules/posts/create/components/InterviewLanguagesModal";

const TEAL = "#0D9488";

const PostDetailsPage: React.FC = () => {
  const { t } = useTranslation("posts");

  const {
    job, loading, error, isOwner,
    activeEdit, setActiveEdit,
    activeTab, setActiveTab,
    menuAnchor, setMenuAnchor,
    publishConfirmOpen, setPublishConfirmOpen,
    publishing,
    langModalOpen, setLangModalOpen,
    savingLanguages,
    qrOpen, setQrOpen,
    qrCanvasRef,
    deleteHook,
    getInterviewLink,
    handleSaveSuccess,
    handleConfirmPublish,
    handleCopyLink,
    handleUpdateLanguages,
    handleDownloadQr,
  } = usePostDetailPage();

  return (
    <DashboardLayout>
      <Box>
        {loading && <LoadingOverlay height={400} message={t("detail.loading")} color={TEAL} />}

        {!loading && error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        )}

        {!loading && !error && job && (
          <>
            <JobDetailHeader
              job={job}
              isOwner={isOwner}
              activeTab={activeTab}
              menuAnchor={menuAnchor}
              onTabChange={setActiveTab}
              onMenuOpen={(e) => setMenuAnchor(e.currentTarget)}
              onMenuClose={() => setMenuAnchor(null)}
              onEditPost={() => setActiveEdit("post")}
              onDelete={() => deleteHook.handleOpen(job._id)}
              onPublish={() => setPublishConfirmOpen(true)}
              onOpenLanguages={() => setLangModalOpen(true)}
              onOpenQr={() => setQrOpen(true)}
              onCopyLink={handleCopyLink}
            />

            {activeTab === "details" && (
              <JobDetailContent
                activeEdit={activeEdit}
                isOwner={isOwner}
                creationType={job.creationType}
                onEditPost={() => setActiveEdit("post")}
                onCancelEdit={() => setActiveEdit(null)}
                onSaveSuccess={handleSaveSuccess}
              />
            )}

            {activeTab === "applications" && job.status !== "draft" && (
              <ApplicationsView jobId={job._id} />
            )}
          </>
        )}

        <DeletePostModal
          open={deleteHook.open}
          onClose={deleteHook.handleClose}
          onDelete={deleteHook.handleDelete}
          isDeleting={deleteHook.isDeleting}
        />

        <PublishConfirmModal
          open={publishConfirmOpen}
          publishing={publishing}
          onClose={() => setPublishConfirmOpen(false)}
          onConfirm={handleConfirmPublish}
        />

        <InterviewLanguagesModal
          open={langModalOpen}
          initialLanguages={job?.interviewLanguages ?? ["en"]}
          confirmLabel={savingLanguages ? "…" : t("create.interview_lang_modal.btn_update")}
          onConfirm={handleUpdateLanguages}
          onClose={() => setLangModalOpen(false)}
        />

        <JobQrDialog
          open={qrOpen}
          shareLink={getInterviewLink()}
          canvasRef={qrCanvasRef}
          jobId={job?._id ?? ""}
          onClose={() => setQrOpen(false)}
          onDownload={handleDownloadQr}
        />
      </Box>
    </DashboardLayout>
  );
};

export default PostDetailsPage;