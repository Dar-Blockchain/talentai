import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { useDeletePost } from "@/modules/company/posts/list/hooks/useDeletePost";
import { useJobDetailQuery, useUpdatePostMutation } from "../queries";
import { useUpdatePostStatusMutation } from "@/modules/company/posts/list/queries";

export const usePostDetailPage = () => {
  const router        = useRouter();
  const { id }        = router.query;
  const { t }         = useTranslation("posts");
  const { showToast } = useToast();

  const jobId = typeof id === "string" ? id : undefined;

  const { data: job, isLoading: loading, error: queryError, refetch } = useJobDetailQuery(jobId);
  const updateMut     = useUpdatePostMutation(jobId ?? "");
  const statusMut     = useUpdatePostStatusMutation();

  const connectedUser     = useSelector((s: RootState) => s.user.connectedUser.user);
  const companyMembership = useSelector((s: RootState) => s.user.connectedUser.companyMembership);

  const [activeEdit,         setActiveEdit]         = useState<"post" | null>(null);
  const [activeTab,          setActiveTab]          = useState<"details" | "applications">("details");
  const [menuAnchor,         setMenuAnchor]         = useState<null | HTMLElement>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [langModalOpen,      setLangModalOpen]      = useState(false);
  const [savingLanguages,    setSavingLanguages]    = useState(false);
  const [qrOpen,             setQrOpen]             = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  const error = queryError ? String(queryError) : null;

  const isOwner = useMemo(() => {
    if (!job) return false;
    const ownerId = String(job.user?._id ?? job.user ?? "");
    if (!ownerId) return false;
    return !!(
      (connectedUser     && ownerId === String(connectedUser._id     ?? "")) ||
      (companyMembership && ownerId === String(companyMembership._id ?? ""))
    );
  }, [job, connectedUser, companyMembership]);

  const deleteHook = useDeletePost({
    redirectTo: "/company/posts",
    onSuccess:  () => showToast({ message: t("detail.toast.deleted"),      severity: "success" }),
    onError:    () => showToast({ message: t("detail.toast.delete_error"), severity: "error"   }),
  });

  const getInterviewLink = () => {
    if (!job?._id || typeof window === "undefined") return "";
    const companyId = job.user?._id || connectedUser?._id || "";
    return `${window.location.origin}/candidate/interview?jobId=${job._id}${companyId ? `&companyId=${companyId}` : ""}&ref=link`;
  };

  const handleSaveSuccess = () => {
    setActiveEdit(null);
    refetch();
  };

  const handleConfirmPublish = () => {
    if (!job?._id) return;
    statusMut.mutate(
      { postId: job._id, status: "open" },
      {
        onSuccess: () => { setPublishConfirmOpen(false); showToast({ message: t("detail.toast.published"),     severity: "success" }); refetch(); },
        onError:   () => showToast({ message: t("detail.toast.publish_error"), severity: "error" }),
      },
    );
  };

  const handleCopyLink = () => {
    const link = getInterviewLink();
    if (!link) return;
    navigator.clipboard
      .writeText(link)
      .then(()  => showToast({ message: t("detail.toast.link_copied"),      severity: "success" }))
      .catch(() => showToast({ message: t("detail.toast.link_copy_error"),  severity: "error"   }));
  };

  const handleUpdateLanguages = (languages: string[]) => {
    if (!job?._id) return;
    setSavingLanguages(true);
    updateMut.mutate(
      { interviewLanguages: languages },
      {
        onSuccess: () => { setLangModalOpen(false); showToast({ message: t("detail.toast.languages_updated"), severity: "success" }); refetch(); },
        onError:   () => showToast({ message: t("detail.toast.languages_error"), severity: "error" }),
        onSettled: () => setSavingLanguages(false),
      },
    );
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas || !job?._id) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `job-post-${job._id}-qr.png`;
    link.click();
  };

  return {
    job: job ?? null, loading, error, isOwner,
    publishing: statusMut.isPending,
    activeEdit,  setActiveEdit,
    activeTab,   setActiveTab,
    menuAnchor,  setMenuAnchor,
    publishConfirmOpen, setPublishConfirmOpen,
    langModalOpen,   setLangModalOpen,
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
  };
};
