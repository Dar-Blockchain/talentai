import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Mail, MessageCircle, X, Send, CheckCircle2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { RootState } from "@/store/store";
import {
  useCreateCandidateConversationMutation,
  useSendCandidateMessageMutation,
} from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import { getCandidateChatConversationPath } from "@/modules/chat/candidate-chat/utils/routes";
import { TEAL } from "@/modules/company/posts/shared/constants";
import {
  Dialog,
  DialogContent,
} from "@/modules/shared/ui/shadcn/dialog";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { cn } from "@/lib/utils";

function initials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ContactTarget {
  name: string;
  email: string;
  candidateUserId: string | null;
  avatarUrl?: string;
  bgColor: string;
}

export interface ContactCandidateModalProps {
  open: boolean;
  target: ContactTarget | null;
  onClose: () => void;
}

type ContactMode = "email" | "chat";

const MODES: Record<ContactMode, {
  labelKey: string;
  sublabelKey: string;
  Icon: React.ElementType;
  color: string;
  lightBg: string;
  activeBorder: string;
}> = {
  email: {
    labelKey:    "pages.applications.contact_modal.mode_email_label",
    sublabelKey: "pages.applications.contact_modal.mode_email_sublabel",
    Icon: Mail,
    color: "#2563EB", lightBg: "#EFF6FF", activeBorder: "#BFDBFE",
  },
  chat: {
    labelKey:    "pages.applications.contact_modal.mode_chat_label",
    sublabelKey: "pages.applications.contact_modal.mode_chat_sublabel",
    Icon: MessageCircle,
    color: TEAL, lightBg: `${TEAL}0F`, activeBorder: `${TEAL}40`,
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

const ContactCandidateModal: React.FC<ContactCandidateModalProps> = ({ open, target, onClose }) => {
  const { t }     = useTranslation("dashboard");
  const router    = useRouter();
  const companyId   = useSelector((s: RootState) => s.user.connectedUser?.user?._id as string | undefined);
  const companyRole = useSelector((s: RootState) => s.user.connectedUser?.user?.role);
  const createConversationMutation = useCreateCandidateConversationMutation();
  const sendMessageMutation        = useSendCandidateMessageMutation();

  const [mode, setMode]       = useState<ContactMode>("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (open) {
      setMode("email"); setSubject(""); setMessage("");
      setSending(false); setSent(false); setError("");
    }
  }, [open]);

  const handleSendEmail = async () => {
    if (!target?.email || !subject.trim() || !message.trim()) return;
    setSending(true); setError("");
    try {
      await axiosInstance.post("job-applications/contact-candidate", {
        candidateEmail: target.email, candidateName: target.name, subject, message,
      });
      setSent(true);
      setTimeout(onClose, 2000);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || t("pages.applications.contact_modal.error_email"));
    } finally {
      setSending(false);
    }
  };

  const handleSendChat = async () => {
    if (!message.trim()) { setError(t("pages.applications.contact_modal.error_empty")); return; }
    if (!target?.candidateUserId || !companyId) {
      setError(t("pages.applications.contact_modal.error_no_user")); return;
    }
    setError("");
    try {
      const conversation = await createConversationMutation.mutateAsync({
        candidateId: target.candidateUserId, companyId,
      });
      await sendMessageMutation.mutateAsync({
        conversationId: conversation._id, receiverId: target.candidateUserId, text: message,
      });
      onClose();
      await router.push(getCandidateChatConversationPath(companyRole, conversation._id));
    } catch {
      setError(t("pages.applications.contact_modal.error_msg"));
    }
  };

  if (!target) return null;

  const cfg     = MODES[mode];
  const isValid = message.trim().length > 0 && (mode === "chat" || subject.trim().length > 0);
  const isBusy  = sending || createConversationMutation.isPending || sendMessageMutation.isPending;
  const [firstName, ...rest] = target.name.split(" ");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isBusy) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-lg w-full rounded-[18px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.14)] p-0">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b border-slate-100">
          <div className="relative shrink-0">
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white text-[14px] font-bold overflow-hidden"
              style={{ backgroundColor: target.bgColor }}
            >
              {target.avatarUrl
                ? <img src={target.avatarUrl} alt={target.name} className="w-full h-full object-cover" />
                : initials(firstName, rest.join(" "))
              }
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-2 border-white flex items-center justify-center"
              style={{ backgroundColor: cfg.color }}
            >
              <cfg.Icon size={7} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-slate-900">{target.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{target.email}</div>
          </div>

          <button
            onClick={onClose}
            disabled={isBusy}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">

          {/* Mode selector */}
          <div className="flex gap-2 mb-5">
            {(Object.entries(MODES) as [ContactMode, typeof MODES.email][]).map(([m, c]) => {
              const active = mode === m;
              const ModeIcon = c.Icon;
              return (
                <button
                  key={m}
                  onClick={() => { if (!isBusy) { setMode(m); setMessage(""); setError(""); } }}
                  disabled={isBusy}
                  className="flex-1 flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150 text-left"
                  style={{
                    borderColor: active ? c.activeBorder : "#E5E7EB",
                    backgroundColor: active ? c.lightBg : "#FAFAFA",
                  }}
                >
                  <div
                    className="w-[30px] h-[30px] rounded-lg shrink-0 flex items-center justify-center transition-colors duration-150"
                    style={{ backgroundColor: active ? c.color : "#F3F4F6" }}
                  >
                    <ModeIcon size={15} style={{ color: active ? "#fff" : "#9CA3AF" }} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold leading-snug" style={{ color: active ? c.color : "#374151" }}>
                      {t(c.labelKey)}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-snug">{t(c.sublabelKey)}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Success state */}
          {sent ? (
            <div className="text-center py-10">
              <div
                className="w-[60px] h-[60px] rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${TEAL}12` }}
              >
                <CheckCircle2 size={30} style={{ color: TEAL }} />
              </div>
              <div className="text-[16px] font-bold text-slate-900 mb-1">
                {mode === "email" ? t("pages.applications.contact_modal.success_email_title") : t("pages.applications.contact_modal.success_chat_title")}
              </div>
              <div className="text-[13px] text-slate-400">
                {mode === "email"
                  ? t("pages.applications.contact_modal.success_email_body", { name: target.name })
                  : t("pages.applications.contact_modal.success_chat_body", { name: target.name })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">

              {/* Subject (email only) */}
              {mode === "email" && (
                <input
                  className="w-full h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-[10px] outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-colors disabled:bg-slate-100"
                  placeholder={t("pages.applications.contact_modal.subject_placeholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isBusy}
                />
              )}

              {/* Chat info banner */}
              {mode === "chat" && (
                <div
                  className="flex gap-2 px-3 py-2.5 rounded-[10px] border items-start"
                  style={{ backgroundColor: `${TEAL}08`, borderColor: `${TEAL}20` }}
                >
                  <MessageCircle size={13} style={{ color: TEAL, marginTop: 2 }} className="shrink-0" />
                  <span className="text-[11.5px] leading-relaxed" style={{ color: "#0F766E" }}>
                    {t("pages.applications.contact_modal.chat_banner", { name: target.name })}
                  </span>
                </div>
              )}

              {/* Message */}
              <textarea
                className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-[10px] outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white transition-colors disabled:bg-slate-100 resize-none leading-relaxed"
                rows={5}
                placeholder={
                  mode === "email"
                    ? t("pages.applications.contact_modal.msg_placeholder_email", { firstName })
                    : t("pages.applications.contact_modal.msg_placeholder_chat")
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isBusy}
              />

              {/* Error */}
              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-[12px] text-red-600">{error}</span>
                </div>
              )}

              <div className="border-t border-slate-100" />

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isBusy}
                  className="h-10 px-4 rounded-[10px] border border-slate-200 text-[13px] font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  {t("pages.applications.contact_modal.cancel")}
                </button>
                <button
                  onClick={mode === "email" ? handleSendEmail : handleSendChat}
                  disabled={!isValid || isBusy}
                  className="h-10 px-5 rounded-[10px] text-[13px] font-semibold text-white flex items-center gap-2 min-w-[130px] justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: cfg.color }}
                >
                  {isBusy ? <Spinner className="size-3.5" /> : <Send size={14} />}
                  {isBusy
                    ? t("pages.applications.contact_modal.sending")
                    : mode === "email"
                      ? t("pages.applications.contact_modal.send_email")
                      : t("pages.applications.contact_modal.send_message")}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactCandidateModal;
