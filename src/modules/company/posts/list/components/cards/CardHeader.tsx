import React from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase as WorkOutlineOutlined,
  MoreVertical as MoreVertOutlined,
  Trash2 as DeleteOutlineOutlined,
  ExternalLink as OpenInNewOutlined,
  Copy as ContentCopyOutlined,
  Rocket as PublishOutlined,
} from "lucide-react";
import { useRouter } from "next/router";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { MoreOptionsMenu } from "@/modules/shared/ui/MoreOptionsMenu";

const STATUS_STYLES: Record<string, { i18nKey: string; color: string; bg: string; dot: string }> = {
  active:  { i18nKey: "open",    color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  open:    { i18nKey: "open",    color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  draft:   { i18nKey: "draft",   color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
  closed:  { i18nKey: "closed",  color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
  expired: { i18nKey: "expired", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
};

interface Props {
  jobId: string;
  title: string;
  statusKey: string;
  isDraft: boolean;
  copied: boolean;
  menuAnchor: HTMLElement | null;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onDelete: () => void;
  onPublish?: () => void;
  onCopyLink: (e: React.MouseEvent) => void;
}

const CardHeader: React.FC<Props> = ({
  jobId, title, statusKey, isDraft, copied,
  menuAnchor, onMenuOpen, onMenuClose, onDelete, onPublish, onCopyLink,
}) => {
  const { t } = useTranslation("posts");
  const router = useRouter();
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.active;

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border border-[#E5E7EB] bg-[#F3F4F6]">
        <WorkOutlineOutlined size={20} color="#6B7280" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-[5px] truncate text-[14.5px] font-bold leading-[1.3] text-[#111827]">
          {title || t("card.untitled")}
        </p>
        <div className="flex items-center gap-1">
          <div
            className="inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[3px]"
            style={{ backgroundColor: statusStyle.bg, border: `1px solid ${statusStyle.color}28` }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
            <span className="text-[10.5px] font-bold leading-none" style={{ color: statusStyle.color }}>
              {t(`card.status.${statusStyle.i18nKey}`)}
            </span>
          </div>
        </div>
      </div>

      <MoreOptionsMenu
        open={Boolean(menuAnchor)}
        onOpenChange={(next) => { if (!next) onMenuClose(); }}
        onTriggerClick={onMenuOpen}
        size="xs"
        icon={MoreVertOutlined}
        className="text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        contentClassName="rounded-xl border border-[#E5E7EB] p-1.5 shadow-lg"
      >
          <div className="px-1.5 pb-1 pt-0.5">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              {title || t("card.menu.header_fallback")}
            </p>
          </div>

          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onMenuClose(); router.push(`/company/posts/${jobId}`); }}
            className="gap-2.5 rounded-lg py-[9px] px-[10px]"
          >
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
              <OpenInNewOutlined size={13} color="#6B7280" />
            </div>
            <div>
              <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">{t("card.menu.view_title")}</p>
              <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">{t("card.menu.view_desc")}</p>
            </div>
          </DropdownMenuItem>

          {isDraft && onPublish && (
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onMenuClose(); onPublish(); }}
              className="gap-2.5 rounded-lg py-[9px] px-[10px] focus:bg-[#ECFDF5]"
            >
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#ECFDF5]">
                <PublishOutlined size={13} color="#059669" />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">{t("card.menu.publish_title")}</p>
                <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">{t("card.menu.publish_desc")}</p>
              </div>
            </DropdownMenuItem>
          )}

          {!isDraft && (
            <DropdownMenuItem onClick={onCopyLink} className="gap-2.5 rounded-lg py-[9px] px-[10px]">
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                <ContentCopyOutlined size={13} color="#6B7280" />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">{copied ? t("card.copied") : t("card.menu.share_title")}</p>
                <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">{t("card.menu.share_desc")}</p>
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onMenuClose(); onDelete(); }}
            className="gap-2.5 rounded-lg py-[9px] px-[10px]"
          >
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
              <DeleteOutlineOutlined size={13} color="#6B7280" />
            </div>
            <div>
              <p className="text-[12.5px] font-semibold leading-[1.2] text-[#374151]">{t("card.menu.delete_title")}</p>
              <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">{t("card.menu.delete_desc")}</p>
            </div>
          </DropdownMenuItem>
      </MoreOptionsMenu>
    </div>
  );
};

export default CardHeader;
