import { useState } from "react";
import { useTranslation } from "react-i18next";
import { emitToast } from "@/utils/toastEmitter";
import {
  useApiKeys, useCreateApiKey, useDeleteApiKey,
  useToggleApiKey, useUpdateApiKey, useRegenerateApiKey,
} from "@/modules/settings/company/queries";
import type { ApiKey } from "@/modules/settings/company/types";
import type { KeyFormState } from "../../schemas/apiKeySchema";

export const useApiKeysTab = () => {
  const { t } = useTranslation("dashboard");

  const { data: apiKeys = [], isLoading: keysLoading, error: fetchError } = useApiKeys();
  const createMutation     = useCreateApiKey();
  const deleteMutation     = useDeleteApiKey();
  const toggleMutation     = useToggleApiKey();
  const updateMutation     = useUpdateApiKey();
  const regenerateMutation = useRegenerateApiKey();

  const [newKey,       setNewKey]       = useState<string | null>(null);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [editingKey,   setEditingKey]   = useState<ApiKey | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [copied,       setCopied]       = useState(false);

  const apiError = fetchError instanceof Error ? fetchError.message : null;

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleCreate = async ({ name, serviceName, rateLimit, expiresAt, ipMode, ipList }: KeyFormState) => {
    const ipWhitelist = ipMode === "all" ? [] : ipList.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const created = await createMutation.mutateAsync({ name, serviceName, scopes: ["all"], rateLimit, expiresAt, ipWhitelist });
      if (created.key) setNewKey(created.key);
      setCreateOpen(false);
      emitToast({ message: t("pages.settings.api_keys.toast.created"), severity: "success" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.create_error"), severity: "error" });
    }
  };

  const handleUpdate = async ({ name, serviceName, rateLimit, expiresAt, ipMode, ipList }: KeyFormState) => {
    if (!editingKey) return;
    const ipWhitelist = ipMode === "all" ? [] : ipList.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const updated = await updateMutation.mutateAsync({ id: editingKey.id, data: { name, serviceName, scopes: ["all"], rateLimit, expiresAt, ipWhitelist } });
      if (updated.key) setNewKey(updated.key);
      setEditingKey(null);
      emitToast({ message: t("pages.settings.api_keys.toast.updated"), severity: "success" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.update_error"), severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      emitToast({ message: t("pages.settings.api_keys.toast.deleted"), severity: "info" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.delete_error"), severity: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync(id);
      emitToast({
        message: isActive
          ? t("pages.settings.api_keys.toast.key_disabled")
          : t("pages.settings.api_keys.toast.key_enabled"),
        severity: "info",
      });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.toggle_error"), severity: "error" });
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const result = await regenerateMutation.mutateAsync(id);
      if (result.key) setNewKey(result.key);
      emitToast({ message: t("pages.settings.api_keys.toast.regenerated"), severity: "success" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.regenerate_error"), severity: "error" });
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    emitToast({ message: t("pages.settings.api_keys.toast.copied"), severity: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    // data
    apiKeys,
    keysLoading,
    apiError,
    newKey,
    copied,
    creating: createMutation.isPending,
    // dialog state
    createOpen, editingKey, deleteTarget,
    setCreateOpen, setEditingKey, setDeleteTarget,
    // handlers
    handleCreate, handleUpdate, handleDelete,
    handleToggle, handleRegenerate, handleCopy,
    handleDismissNewKey: () => setNewKey(null),
  };
};
