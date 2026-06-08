import { useCallback, useState } from "react";
import { emitToast } from "@/utils/toastEmitter";
import { applicationsApi } from "../api";

export function useInviteModal(id: string | undefined) {
  const [open, setOpen]       = useState(false);
  const [link, setLink]       = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);

  const openModal = useCallback((interviewLink: string) => {
    setLink(interviewLink);
    setDone(false);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  const handleSend = useCallback(async () => {
    if (!id || !link) return;
    setSending(true);
    try {
      await applicationsApi.inviteToInterview(id, link);
      emitToast({ message: "Invitation sent successfully!", severity: "success" });
      setDone(true);
      setTimeout(() => setOpen(false), 1500);
    } catch (err: unknown) {
      emitToast({ message: err instanceof Error ? err.message : "Failed to send invitation.", severity: "error" });
    } finally {
      setSending(false);
    }
  }, [id, link]);

  return { open, link, sending, done, openModal, closeModal, handleSend };
}
