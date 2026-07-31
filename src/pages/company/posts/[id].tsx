import React from "react";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { useTranslation } from "react-i18next";

import { usePostDetailPage } from "@/modules/company/posts/details/hooks/usePostDetailPage";
import JobDetailHeader from "@/modules/company/posts/details/components/JobDetailHeader";
import JobDetailContent from "@/modules/company/posts/details/components/JobDetailContent";
import JobQrDialog from "@/modules/company/posts/details/components/JobQrDialog";
import ApplicationsView from "@/modules/company/posts/details/components/ApplicationsView";
import DeletePostModal from "@/modules/company/posts/list/components/DeletePostModal";
import PublishConfirmModal from "@/modules/company/posts/list/components/PublishConfirmModal";
import InterviewLanguagesModal from "@/modules/company/posts/create/components/InterviewLanguagesModal";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const PostDetailsPage: NextPageWithLayout = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div>

        {!loading && error && (
          <Alert variant="destructive" className="rounded-lg"><AlertDescription>{error}</AlertDescription></Alert>
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
                job={job}
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
          onEdit={() => { setPublishConfirmOpen(false); setActiveEdit("post"); }}
        />

        <InterviewLanguagesModal
          open={langModalOpen}
          initialLanguages={job?.interviewLanguages ?? ["en"]}
          isLoading={savingLanguages}
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
      </div>
  );
};
PostDetailsPage.getLayout = getDashboardLayout;

export default PostDetailsPage;