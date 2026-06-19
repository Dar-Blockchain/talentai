"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, X, Check, Link as LinkIcon } from "lucide-react";
import { applicationsApi } from "@/modules/company/applications/api";
import { emitToast } from "@/utils/toastEmitter";
import {
  Dialog,
  DialogContent,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

export interface InviteTarget {
  applicationId: string;
  name: string;
  postTitle: string;
  postId: string;
}

interface Props {
  open: boolean;
  target: InviteTarget | null;
  onClose: () => void;
  onSuccess?: (appId: string) => void;
}

const InviteToInterviewModal = memo<Props>(({ open, target, onClose, onSuccess }) => {
  const { t } = useTranslation("dashboard");
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    if (!open) { setSending(false); setDone(false); }
  }, [open]);

  const interviewLink = target?.postId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/candidate/interview?jobId=${target.postId}`
    : "";

  const handleSend = useCallback(async () => {
    if (!target) return;
    setSending(true);
    try {
      await applicationsApi.inviteToInterview(target.applicationId, interviewLink);
      setDone(true);
      onSuccess?.(target.applicationId);
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      emitToast({ message: err instanceof Error ? err.message : "Failed to send invitation.", severity: "error" });
    } finally {
      setSending(false);
    }
  }, [target, interviewLink, onClose, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-xs w-full rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.14)] p-0">

        {/* Header */}
        <div className="px-5 pt-5 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0 bg-secondary-light">
              <Mail size={20} className="text-secondary-dark" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-gray-900 leading-tight">
                {t("pages.applications.invite_modal.title")}
              </div>
              {target && (
                <div className="text-[12px] text-gray-500 mt-0.5">
                  {t("pages.applications.invite_modal.to_label")} <strong className="text-gray-700">{target.name}</strong>
                  {target.postTitle ? <> · <span className="text-gray-400">{target.postTitle}</span></> : null}
                </div>
              )}
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" className="mt-0.5 text-gray-500" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-1">
          {done ? (
            <div className="py-3 text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-2">
                <Check size={26} className="text-emerald-600" />
              </div>
              <p className="text-[15px] font-bold text-emerald-600">{t("pages.applications.invite_modal.success_title")}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {t("pages.applications.invite_modal.success_body", { name: target?.name })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.75">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {t("pages.applications.invite_modal.body_pre")}
                <strong className="text-gray-900">{target?.name}</strong>
                {t("pages.applications.invite_modal.body_post")}
              </p>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-2.5">
                <LinkIcon size={15} className="text-gray-400 shrink-0" />
                <p className="text-[11px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{interviewLink}</p>
              </div>
            </div>
          )}
        </div>

        {!done && (
          <div className="flex justify-end gap-2 px-5 pb-5 pt-3.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {t("pages.applications.invite_modal.cancel")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={sending}
              disabled={!interviewLink}
              onClick={handleSend}
            >
              {t("pages.applications.invite_modal.send")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
InviteToInterviewModal.displayName = "InviteToInterviewModal";

export default InviteToInterviewModal;
