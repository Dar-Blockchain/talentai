import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Mail as EmailOutlined,
  MessageCircle as ChatBubbleOutlineOutlined,
  X as CloseOutlined,
  Send as SendOutlined,
  CheckCircle2 as CheckCircleOutlineOutlined,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { RootState } from "@/store/store";
import {
  useCreateCandidateConversationMutation,
  useSendCandidateMessageMutation,
} from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import { getCandidateChatConversationPath } from "@/modules/chat/candidate-chat/utils/routes";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";

import { TEAL } from "@/modules/company/posts/shared/constants";

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
    labelKey: "pages.applications.contact_modal.mode_email_label",
    sublabelKey: "pages.applications.contact_modal.mode_email_sublabel",
    Icon: EmailOutlined,
    color: "#2563EB",
    lightBg: "#EFF6FF",
    activeBorder: "#BFDBFE",
  },
  chat: {
    labelKey: "pages.applications.contact_modal.mode_chat_label",
    sublabelKey: "pages.applications.contact_modal.mode_chat_sublabel",
    Icon: ChatBubbleOutlineOutlined,
    color: TEAL,
    lightBg: `${TEAL}0F`,
    activeBorder: `${TEAL}40`,
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

const ContactCandidateModal: React.FC<ContactCandidateModalProps> = ({ open, target, onClose }) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const companyId   = useSelector((s: RootState) => s.user.connectedUser?.user?._id as string | undefined);
  const companyRole = useSelector((s: RootState) => s.user.connectedUser?.user?.role);
  const createConversationMutation = useCreateCandidateConversationMutation();
  const sendMessageMutation = useSendCandidateMessageMutation();

  const [mode, setMode]       = useState<ContactMode>("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (open) {
      setMode("email");
      setSubject("");
      setMessage("");
      setSending(false);
      setSent(false);
      setError("");
    }
  }, [open]);

  const handleSendEmail = async () => {
    if (!target?.email || !subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    try {
      await axiosInstance.post("job-applications/contact-candidate", {
        candidateEmail: target.email,
        candidateName: target.name,
        subject,
        message,
      });
      setSent(true);
      setTimeout(onClose, 2000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err.response?.data?.error || err.message || t("pages.applications.contact_modal.error_email"));
    } finally {
      setSending(false);
    }
  };

  const handleSendChat = async () => {
    if (!message.trim()) { setError(t("pages.applications.contact_modal.error_empty")); return; }
    if (!target?.candidateUserId || !companyId) {
      setError(t("pages.applications.contact_modal.error_no_user"));
      return;
    }
    setError("");
    try {
      const conversation = await createConversationMutation.mutateAsync({
        candidateId: target.candidateUserId,
        companyId,
      });
      await sendMessageMutation.mutateAsync({
        conversationId: conversation._id,
        receiverId: target.candidateUserId,
        text: message,
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
    <Dialog open={open} onOpenChange={(next) => { if (!next && !isBusy) onClose(); }}>
      <DialogContent showCloseButton={false} className="w-full max-w-lg overflow-hidden rounded-[18px] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.14)]">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 pt-5 pb-4">
          <div className="relative shrink-0">
            <Avatar className="h-[42px] w-[42px] rounded-full">
              <AvatarImage src={target.avatarUrl} alt={target.name} className="object-cover" />
              <AvatarFallback
                className="rounded-full text-[14px] font-bold text-white"
                style={{ backgroundColor: target.bgColor }}
              >
                {initials(firstName, rest.join(" "))}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute -right-0.5 -bottom-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-white"
              style={{ backgroundColor: cfg.color }}
            >
              <cfg.Icon size={7} className="text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-gray-900">{target.name}</p>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-gray-400">
              {target.email}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isBusy}
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50"
          >
            <CloseOutlined size={16} />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">

          {/* ── Mode selector ── */}
          <div className="mb-5 flex gap-2">
            {(Object.entries(MODES) as [ContactMode, typeof MODES.email][]).map(([m, c]) => {
              const active = mode === m;
              const ModeIcon = c.Icon;
              return (
                <div
                  key={m}
                  onClick={() => { if (!isBusy) { setMode(m); setMessage(""); setError(""); } }}
                  className="flex flex-1 items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2.5 transition-all duration-150"
                  style={{
                    borderColor: active ? c.activeBorder : "#E5E7EB",
                    backgroundColor: active ? c.lightBg : "#FAFAFA",
                    cursor: isBusy ? "default" : "pointer",
                  }}
                >
                  <div
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
                    style={{ backgroundColor: active ? c.color : "#F3F4F6" }}
                  >
                    <ModeIcon size={15} color={active ? "#fff" : "#9CA3AF"} />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold leading-tight" style={{ color: active ? c.color : "#374151" }}>
                      {t(c.labelKey)}
                    </p>
                    <p className="text-[10px] leading-tight text-gray-400">
                      {t(c.sublabelKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Success state ── */}
          {sent ? (
            <div className="py-10 text-center">
              <div
                className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full"
                style={{ backgroundColor: `${TEAL}12` }}
              >
                <CheckCircleOutlineOutlined size={30} color={TEAL} />
              </div>
              <p className="mb-1 text-[16px] font-bold text-gray-900">
                {mode === "email" ? t("pages.applications.contact_modal.success_email_title") : t("pages.applications.contact_modal.success_chat_title")}
              </p>
              <p className="text-[13px] text-gray-400">
                {mode === "email"
                  ? t("pages.applications.contact_modal.success_email_body", { name: target.name })
                  : t("pages.applications.contact_modal.success_chat_body", { name: target.name })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">

              {/* Subject (email only) */}
              {mode === "email" && (
                <input
                  placeholder={t("pages.applications.contact_modal.subject_placeholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isBusy}
                  className="h-9 w-full rounded-[10px] border border-gray-200 bg-gray-50 px-3 text-[13px] outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:bg-white disabled:bg-gray-100"
                />
              )}

              {/* Chat info banner */}
              {mode === "chat" && (
                <div
                  className="flex items-start gap-2 rounded-[10px] border px-3 py-2.5"
                  style={{ backgroundColor: `${TEAL}08`, borderColor: `${TEAL}20` }}
                >
                  <ChatBubbleOutlineOutlined size={13} color={TEAL} className="mt-0.5 shrink-0" />
                  <span className="text-[11.5px] leading-relaxed" style={{ color: "#0F766E" }}>
                    {t("pages.applications.contact_modal.chat_banner", { name: target.name })}
                  </span>
                </div>
              )}

              {/* Message */}
              <textarea
                placeholder={mode === "email" ? t("pages.applications.contact_modal.msg_placeholder_email", { firstName }) : t("pages.applications.contact_modal.msg_placeholder_chat")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isBusy}
                rows={5}
                className="w-full resize-none rounded-[10px] border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] leading-relaxed outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:bg-white disabled:bg-gray-100"
              />

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <span className="text-[12px] text-red-600">{error}</span>
                </div>
              )}

              <div className="my-0.5 border-t border-gray-100" />

              {/* Actions */}
              <div className="flex justify-end gap-2.5">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isBusy}
                  className="rounded-[10px] text-[13px] font-semibold"
                >
                  {t("pages.applications.contact_modal.cancel")}
                </Button>
                <Button
                  variant="default"
                  onClick={mode === "email" ? handleSendEmail : handleSendChat}
                  disabled={!isValid || isBusy}
                  loading={isBusy}
                  className="min-w-[130px] rounded-[10px] text-[13px] font-semibold shadow-none"
                  style={{ color: "#fff", backgroundColor: cfg.color }}
                >
                  {!isBusy && <SendOutlined size={14} />}
                  {isBusy ? t("pages.applications.contact_modal.sending") : mode === "email" ? t("pages.applications.contact_modal.send_email") : t("pages.applications.contact_modal.send_message")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactCandidateModal;
