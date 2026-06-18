import React from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil, Key, RefreshCw, type LucideIcon } from "lucide-react";
import type { ApiKey } from "@/modules/settings/company/types";
import { TEAL, TEAL_BG, fmtDate } from "@/modules/settings/shared/constants";

// ─── Local sub-components ─────────────────────────────────────────────────────

const MetaText = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[0.68rem] text-gray-400">{children}</span>
);

const ActionButton = ({
  title, icon: Icon, onClick, color, hoverBg,
}: {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
  hoverBg: string;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="rounded-md p-1.5 transition-colors"
    style={{ color }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    <Icon size={16} />
  </button>
);

// ─── KeyCard ──────────────────────────────────────────────────────────────────

type Props = {
  apiKey: ApiKey;
  onEdit:       (key: ApiKey) => void;
  onDelete:     (key: ApiKey) => void;
  onToggle:     (id: string, isActive: boolean) => void;
  onRegenerate: (id: string) => void;
};

const KeyCard: React.FC<Props> = ({ apiKey: k, onEdit, onDelete, onToggle, onRegenerate }) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">

      {/* Status icon */}
      <div
        className="w-9 h-9 rounded-[9px] flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: k.isActive ? TEAL_BG : "#F3F4F6" }}
      >
        <Key size={17} style={{ color: k.isActive ? TEAL : "#9CA3AF" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">

        {/* Name + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[0.88rem] font-bold text-gray-900">{k.name}</span>
          {k.serviceName && (
            <span className="inline-flex h-[18px] items-center px-2 rounded-full text-[0.62rem] font-semibold bg-gray-100 text-gray-700">{k.serviceName}</span>
          )}
          <span
            className="inline-flex h-[18px] items-center px-2 rounded-full text-[0.62rem] font-bold"
            style={{ backgroundColor: k.isActive ? "rgba(13,148,136,0.08)" : "#F3F4F6", color: k.isActive ? TEAL : "#9CA3AF" }}
          >
            {k.isActive ? t("pages.settings.api_keys.active") : t("pages.settings.api_keys.disabled_label")}
          </span>
        </div>

        {/* Scopes */}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {k.scopes.map((s) => (
            <span key={s} className="inline-flex h-[17px] items-center px-1.5 rounded-full text-[0.6rem] bg-blue-50 text-blue-600">{s}</span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex gap-4 mt-1 flex-wrap">
          {k.keyPreview && <MetaText>{t("pages.settings.api_keys.key_preview",    { preview: k.keyPreview })}</MetaText>}
          <MetaText>{t("pages.settings.api_keys.rate_limit_label", { count: k.rateLimit })}</MetaText>
          {k.expiresAt  && <MetaText>{t("pages.settings.api_keys.expires_label",   { date: fmtDate(k.expiresAt) })}</MetaText>}
          {k.lastUsed   && <MetaText>{t("pages.settings.api_keys.last_used_label", { date: fmtDate(k.lastUsed) })}</MetaText>}
          <MetaText>
            {k.ipWhitelist?.length
              ? t("pages.settings.api_keys.ips_label", { ips: k.ipWhitelist.join(", ") })
              : `IPs: ${t("pages.settings.api_keys.ips_all")}`}
          </MetaText>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={k.isActive}
          title={k.isActive ? t("pages.settings.api_keys.toggle_disable") : t("pages.settings.api_keys.toggle_enable")}
          onClick={() => onToggle(k.id, k.isActive)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${k.isActive ? "bg-teal-600" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${k.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <ActionButton title={t("pages.settings.api_keys.regenerate_tooltip")} icon={RefreshCw} onClick={() => onRegenerate(k.id)} color="#F59E0B" hoverBg="#FFFBEB" />
        <ActionButton title={t("pages.settings.api_keys.edit_tooltip")}       icon={Pencil}     onClick={() => onEdit(k)}           color={TEAL}    hoverBg={TEAL_BG} />
        <ActionButton title={t("pages.settings.api_keys.delete_tooltip")}     icon={Trash2}     onClick={() => onDelete(k)}         color="#EF4444" hoverBg="#FEF2F2" />
      </div>

    </div>
  );
};

export default KeyCard;
