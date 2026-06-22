import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Key } from "lucide-react";
import AppUserInfo from "@/modules/shared/ui/AppUserInfo";

import { useApiKeysTab }  from "./api-keys/useApiKeysTab";
import KeysList           from "./api-keys/KeysList";
import NewKeyBanner       from "./api-keys/NewKeyBanner";
import CreateKeyDialog    from "./api-keys/CreateKeyDialog";
import EditKeyDialog      from "./api-keys/EditKeyDialog";
import DeleteKeyDialog    from "./api-keys/DeleteKeyDialog";
import { addBtnClass }    from "./api-keys/styles";

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
    <div className="p-5 md:p-7">

      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <AppUserInfo
          name={t("pages.settings.api_keys.title")}
          subtitle={t("pages.settings.api_keys.subtitle")}
          icon={<Key size={20} className="text-teal-600" />}
          iconBgColor="#F0FDFA"
        />
        <button type="button" onClick={() => setCreateOpen(true)} className={addBtnClass}>
          <Plus size={15} />
          {t("pages.settings.api_keys.new_key")}
        </button>
      </div>

      {newKey && <NewKeyBanner newKey={newKey} copied={copied} onCopy={handleCopy} onDismiss={handleDismissNewKey} />}

      {apiError && (
        <div className="mb-4 rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[0.82rem] text-red-700">
          {apiError}
        </div>
      )}

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

    </div>
  );
};

export default ApiKeysTab;
