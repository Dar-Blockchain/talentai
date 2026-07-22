import { useState } from "react";
import { toast } from "sonner";
import { useVerifyWebinarMutation, useDeleteWebinarMutation } from "../queries";
import { adminWebinarApi } from "../api";
import { exportWebinarSubmissions } from "../utils/exportSubmissions";
import { findInvalidQuestion, questionErrorMessage } from "../utils/webinarForm";
import type { Webinar } from "../types";

/** Single-webinar action set (copy link, export, publish, delete, send
 * reminder) shared by the detail page. Accepts the webinar as possibly not
 * yet loaded so it can be called unconditionally above a loading guard. The
 * list page keeps its own mutation instances since a single ConfirmDialog/
 * export-pending-id there is shared across many cards at once. */
export function useWebinarActions(webinar: Webinar | undefined) {
  const verifyMut = useVerifyWebinarMutation();
  const deleteMut = useDeleteWebinarMutation();

  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const publicUrl = webinar ? `/webinar?id=${webinar._id}` : "";

  const handleCopyLink = async () => {
    if (!webinar) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicUrl}`);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleExport = async () => {
    if (!webinar) return;
    setExporting(true);
    try {
      await exportWebinarSubmissions(webinar);
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleVerify = () => {
    if (!webinar) return;
    if (webinar.questions.length === 0) {
      toast.error("Add at least one question before publishing.");
      return;
    }
    const invalid = findInvalidQuestion(webinar.questions);
    if (invalid) {
      toast.error(`${questionErrorMessage(invalid.reason)} Edit the webinar to fix it before publishing.`);
      return;
    }
    verifyMut.mutate(webinar._id, {
      onSuccess: () => toast.success(`"${webinar.title}" is now Published.`),
      onError: () => toast.error("Failed to publish webinar."),
    });
  };

  const handleDelete = (onSuccess: () => void) => {
    if (!webinar) return;
    deleteMut.mutate(webinar._id, {
      onSuccess: () => {
        toast.success("Webinar deleted.");
        onSuccess();
      },
      onError: () => toast.error("Failed to delete."),
    });
  };

  const handleSendReminder = async (onDone: () => void) => {
    if (!webinar) return;
    setSendingReminder(true);
    onDone();
    try {
      const result = await adminWebinarApi.sendLinkReminder(webinar._id);
      toast.success(
        `Reminder sent to ${result.sent} participant${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}.`,
      );
    } catch {
      toast.error("Failed to send reminder.");
    } finally {
      setSendingReminder(false);
    }
  };

  return {
    publicUrl,
    copied,
    handleCopyLink,
    exporting,
    handleExport,
    verifyMut,
    handleVerify,
    deleteMut,
    handleDelete,
    sendingReminder,
    handleSendReminder,
  };
}
