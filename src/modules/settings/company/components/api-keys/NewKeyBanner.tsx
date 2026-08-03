import React from "react";
import { useTranslation } from "react-i18next";
import { Copy, X } from "lucide-react";

type Props = {
  newKey: string;
  copied: boolean;
  onCopy: (key: string) => void;
  onDismiss: () => void;
};

const NewKeyBanner: React.FC<Props> = ({ newKey, copied, onCopy, onDismiss }) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="mb-5 rounded-[10px] bg-green-50 border border-green-200 px-4 py-3 text-[0.82rem]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.78rem] font-bold text-green-800 mb-1.5">
          {t("pages.settings.api_keys.banner_title")}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            title={copied ? t("pages.settings.api_keys.copied") : t("pages.settings.api_keys.copy")}
            onClick={() => onCopy(newKey)}
            className="rounded-md p-1 text-green-700 hover:bg-green-100"
          >
            <Copy size={16} />
          </button>
          <button type="button" onClick={onDismiss} className="rounded-md p-1 text-green-700 hover:bg-green-100">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="font-mono text-[0.8rem] bg-green-100/60 px-3 py-1.5 rounded-md break-all text-green-900">
        {newKey}
      </div>
    </div>
  );
};

export default NewKeyBanner;
