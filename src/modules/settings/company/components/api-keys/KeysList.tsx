import React from "react";
import { useTranslation } from "react-i18next";
import { Key } from "lucide-react";
import type { ApiKey } from "@/modules/settings/company/types";
import { Spinner } from "@/modules/settings/shared/components";
import KeyCard from "./KeyCard";

type Props = {
  apiKeys: ApiKey[];
  loading: boolean;
  onEdit:       (key: ApiKey) => void;
  onDelete:     (key: ApiKey) => void;
  onToggle:     (id: string, isActive: boolean) => void;
  onRegenerate: (id: string) => void;
};

const KeysList: React.FC<Props> = ({ apiKeys, loading, onEdit, onDelete, onToggle, onRegenerate }) => {
  const { t } = useTranslation("dashboard");

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Key size={40} className="mx-auto mb-2 opacity-40" />
        <p className="text-[0.88rem]">{t("pages.settings.api_keys.no_keys")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {apiKeys.map((k) => (
        <KeyCard
          key={k.id}
          apiKey={k}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          onRegenerate={onRegenerate}
        />
      ))}
    </div>
  );
};

export default KeysList;
