import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Box, Button } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import AppUserInfo from "@/modules/shared/ui/AppUserInfo";
import { TEAL, TEAL_BG } from "@/modules/settings/shared/constants";

import { useApiKeysTab }  from "./api-keys/useApiKeysTab";
import KeysList           from "./api-keys/KeysList";
import NewKeyBanner       from "./api-keys/NewKeyBanner";
import CreateKeyDialog    from "./api-keys/CreateKeyDialog";
import EditKeyDialog      from "./api-keys/EditKeyDialog";
import DeleteKeyDialog    from "./api-keys/DeleteKeyDialog";
import { addBtnSx }      from "./api-keys/styles";

const ApiKeysTab: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const {
    apiKeys, keysLoading, creating, apiError, newKey, copied,
    createOpen, editingKey, deleteTarget,
    setCreateOpen, setEditingKey, setDeleteTarget,
    handleCreate, handleUpdate, handleDelete,
    handleToggle, handleRegenerate, handleCopy, handleDismissNewKey,
  } = useApiKeysTab();

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>

      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <AppUserInfo
          name={t("pages.settings.api_keys.title")}
          subtitle={t("pages.settings.api_keys.subtitle")}
          icon={<KeyOutlined sx={{ fontSize: 20, color: TEAL }} />}
          iconBgColor={TEAL_BG}
        />
        <Button size="small" startIcon={<AddOutlined sx={{ fontSize: 15 }} />} onClick={() => setCreateOpen(true)} sx={addBtnSx}>
          {t("pages.settings.api_keys.new_key")}
        </Button>
      </Box>

      {newKey && <NewKeyBanner newKey={newKey} copied={copied} onCopy={handleCopy} onDismiss={handleDismissNewKey} />}

      {apiError && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.82rem" }}>{apiError}</Alert>}

      <KeysList
        apiKeys={apiKeys}
        loading={keysLoading}
        onEdit={setEditingKey}
        onDelete={setDeleteTarget}
        onToggle={handleToggle}
        onRegenerate={handleRegenerate}
      />

      <CreateKeyDialog open={createOpen} creating={creating} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      <EditKeyDialog   editingKey={editingKey}                onClose={() => setEditingKey(null)}  onSubmit={handleUpdate} />
      <DeleteKeyDialog target={deleteTarget}                  onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />

    </Box>
  );
};

export default ApiKeysTab;
