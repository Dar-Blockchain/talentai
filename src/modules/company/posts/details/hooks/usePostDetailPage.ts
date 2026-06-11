import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store/store";
import { fetchJobById, selectCurrentJob, selectCurrentJobLoading, selectCurrentJobError, updatePostStatus } from "@/store/slices/postSlice";
import { updateJobDetails } from "../store/postSlice";
import { useDeletePost } from "@/modules/company/posts/list/hooks/useDeletePost";
import { useToast } from "@/hooks/useToast";

export const usePostDetailPage = () => {
  const dispatch      = useDispatch<AppDispatch>();
  const router        = useRouter();
  const { id }        = router.query;
  const { t }         = useTranslation("posts");
  const { showToast } = useToast();

  const job     = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error   = useSelector(selectCurrentJobError);
  const connectedUser     = useSelector((s: RootState) => s.user.connectedUser.user);
  const companyMembership = useSelector((s: RootState) => s.user.connectedUser.companyMembership);

  const [activeEdit,        setActiveEdit]        = useState<"post" | null>(null);
  const [activeTab,         setActiveTab]          = useState<"details" | "applications">("details");
  const [menuAnchor,        setMenuAnchor]         = useState<null | HTMLElement>(null);
  const [publishConfirmOpen,setPublishConfirmOpen] = useState(false);
  const [publishing,        setPublishing]         = useState(false);
  const [langModalOpen,     setLangModalOpen]      = useState(false);
  const [savingLanguages,   setSavingLanguages]    = useState(false);
  const [qrOpen,            setQrOpen]             = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { if (id) dispatch(fetchJobById(id as string)); }, [id, dispatch]);
  useEffect(() => { setActiveEdit(null); }, [activeTab]);

  const isOwner = useMemo(() => {
    if (!job) return false;
    // user may be a populated object or a raw ObjectId string
    const ownerId = String(job.user?._id ?? job.user ?? "");
    if (!ownerId) return false;
    return !!(
      (connectedUser     && ownerId === String(connectedUser._id     ?? "")) ||
      (companyMembership && ownerId === String(companyMembership._id ?? ""))
    );
  }, [job, connectedUser, companyMembership]);

  const deleteHook = useDeletePost({
    redirectTo: "/company/posts",
    onSuccess: () => showToast({ message: t("detail.toast.deleted"),      severity: "success" }),
    onError:   () => showToast({ message: t("detail.toast.delete_error"), severity: "error"   }),
  });

  const getInterviewLink = () => {
    if (!job?._id || typeof window === "undefined") return "";
    const companyId = job.user?._id || connectedUser?._id || "";
    return `${window.location.origin}/candidate/interview?jobId=${job._id}${companyId ? `&companyId=${companyId}` : ""}&ref=link`;
  };

  const handleSaveSuccess = () => {
    setActiveEdit(null);
    if (id) dispatch(fetchJobById(id as string));
  };

  const handleConfirmPublish = () => {
    if (!job?._id) return;
    setPublishing(true);
    dispatch(updatePostStatus({ postId: job._id, status: "open" }))
      .unwrap()
      .then(() => {
        setPublishConfirmOpen(false);
        showToast({ message: t("detail.toast.published"), severity: "success" });
        dispatch(fetchJobById(job._id));
      })
      .catch(() => showToast({ message: t("detail.toast.publish_error"), severity: "error" }))
      .finally(() => setPublishing(false));
  };

  const handleCopyLink = () => {
    const link = getInterviewLink();
    if (!link) return;
    navigator.clipboard
      .writeText(link)
      .then(()  => showToast({ message: t("detail.toast.link_copied"),    severity: "success" }))
      .catch(()  => showToast({ message: t("detail.toast.link_copy_error"), severity: "error" }));
  };

  const handleUpdateLanguages = (languages: string[]) => {
    if (!job?._id) return;
    setSavingLanguages(true);
    dispatch(updateJobDetails({ jobId: job._id, jobData: { interviewLanguages: languages } }))
      .unwrap()
      .then(() => {
        setLangModalOpen(false);
        showToast({ message: t("detail.toast.languages_updated"), severity: "success" });
        dispatch(fetchJobById(job._id));
      })
      .catch(() => showToast({ message: t("detail.toast.languages_error"), severity: "error" }))
      .finally(() => setSavingLanguages(false));
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
    job, loading, error, isOwner,
    activeEdit, setActiveEdit,
    activeTab,  setActiveTab,
    menuAnchor, setMenuAnchor,
    publishConfirmOpen, setPublishConfirmOpen,
    publishing,
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
