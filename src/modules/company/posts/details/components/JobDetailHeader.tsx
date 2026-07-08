"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  ChevronRight as NavigateNextIcon,
  Briefcase as WorkOutlineOutlined,
  MapPin as LocationOnOutlined,
  Laptop as LaptopOutlined,
  Building2 as BusinessCenterOutlined,
  SignalHigh as SignalCellularAltOutlined,
  Calendar as CalendarTodayOutlined,
  Mic as MicOutlined,
  Rocket as PublishOutlined,
  QrCode as QrCode2Outlined,
  Copy as ContentCopyOutlined,
  MoreVertical as MoreVertOutlined,
  Pencil as EditOutlined,
  Trash2 as DeleteOutlineOutlined,
  Users as PeopleOutlined,
} from "lucide-react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Tabs, TabsList, TabsTrigger } from "@/modules/shared/ui/shadcn/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/modules/shared/ui/shadcn/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { cn } from "@/lib/utils";

import { TEAL } from "@/modules/company/posts/shared/constants";

const DOT = <span className="text-[12px] text-[#D1D5DB]">·</span>;

interface MetaItemProps { Icon: React.ElementType; label: string }
const MetaItem: React.FC<MetaItemProps> = ({ Icon, label }) => (
  <div className="flex items-center gap-1">
    <Icon size={13} color="#9CA3AF" />
    <span className="text-[12px] font-medium text-[#6B7280]">{label}</span>
  </div>
);

const actionBtnClass =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border-[1.5px] px-3.5 transition-colors duration-150";

interface Props {
  job: any;
  isOwner: boolean;
  activeTab: "details" | "applications";
  menuAnchor: HTMLElement | null;
  onTabChange: (tab: "details" | "applications") => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onEditPost: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onOpenLanguages: () => void;
  onOpenQr: () => void;
  onCopyLink: () => void;
}

const JobDetailHeader: React.FC<Props> = ({
  job, isOwner, activeTab, menuAnchor,
  onTabChange, onMenuOpen, onMenuClose, onEditPost, onDelete,
  onPublish, onOpenLanguages, onOpenQr, onCopyLink,
}) => {
  const { t }  = useTranslation("posts");
  const { t: td } = useTranslation("dashboard");

  const jd      = job.jobDetails || {};
  const isDraft = job.status === "draft";
  const canEdit = isDraft || (job.applicationCount ?? 0) === 0;
  const menuOpen = Boolean(menuAnchor);

  const metaItems = [
    jd.location      && { Icon: LocationOnOutlined,       label: jd.location },
    jd.workMode      && { Icon: LaptopOutlined,           label: jd.workMode },
    jd.employmentType && { Icon: BusinessCenterOutlined,  label: jd.employmentType },
    jd.experienceLevel && { Icon: SignalCellularAltOutlined, label: jd.experienceLevel },
    job.createdAt    && { Icon: CalendarTodayOutlined,    label: new Date(job.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
  ].filter(Boolean) as { Icon: React.ElementType; label: string }[];

  const breadcrumbItems = [
    { label: td("pages.common.dashboard"), href: "/company/dashboard" },
    { label: t("title"),                   href: "/company/posts" },
    { label: jd.title || t("detail.fallback_title") },
  ];

  return (
    <TooltipProvider>
      <div
        className="mb-6 overflow-hidden rounded-2xl bg-white"
        style={{
          border: `1px solid ${isDraft ? "#FDE68A" : "#E5E7EB"}`,
          boxShadow: isDraft ? "0 2px 12px #D9770618" : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="h-0.75 w-full" style={{ backgroundColor: isDraft ? "#F59E0B" : TEAL }} />
        <div className={cn("px-5 pt-5 md:px-6", isDraft ? "pb-5" : "pb-0")}>

          {/* Breadcrumbs */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList className="flex-nowrap gap-1">
              {breadcrumbItems.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <BreadcrumbSeparator className="mx-0">
                      <NavigateNextIcon size={14} color="#D1D5DB" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild className="text-[12px] font-medium text-[#6B7280] hover:text-[#111827]">
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-[12px] font-semibold text-[#111827]">{item.label}</span>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">

            {/* Left: icon + title + meta */}
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${TEAL}, #34D399)`, boxShadow: `0 4px 12px ${TEAL}30` }}
              >
                <WorkOutlineOutlined size={26} color="#fff" />
              </div>
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <p className="text-[1.35rem] font-extrabold leading-[1.25] text-[#111827]">
                    {jd.title || "Job Post"}
                  </p>
                  <Badge
                    variant="outline"
                    className="h-[22px] rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: isDraft ? "#FEF3C7" : "#D1FAE5",
                      color: isDraft ? "#92400E" : "#065F46",
                      borderColor: isDraft ? "#FDE68A" : "#A7F3D0",
                    }}
                  >
                    {isDraft ? t("detail.status.draft") : t("detail.status.published")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {metaItems.map((item, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && DOT}
                      <MetaItem Icon={item.Icon} label={item.label} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex shrink-0 items-center gap-2">
              {isDraft && isOwner && (
                <div
                  onClick={onOpenLanguages}
                  className={cn(actionBtnClass, "border-[#99F6E4] bg-[#F0FDFA] hover:border-[#CCFBF1] hover:bg-[#CCFBF1]")}
                >
                  <MicOutlined size={15} color={TEAL} />
                  <span className="text-[13px] font-semibold leading-none" style={{ color: TEAL }}>{t("detail.actions.edit_languages")}</span>
                </div>
              )}
              {isDraft && isOwner && (
                <div
                  onClick={onPublish}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] bg-[#D97706] px-3.5 transition-colors duration-150 hover:bg-[#B45309]"
                >
                  <PublishOutlined size={15} color="#fff" />
                  <span className="text-[13px] font-bold leading-none text-white">{t("detail.actions.publish")}</span>
                </div>
              )}
              {!isDraft && (
                <>
                  <div
                    onClick={onOpenQr}
                    className={cn(actionBtnClass, "border-[#A7F3D0] bg-[#F0FDF4] hover:border-[#DCFCE7] hover:bg-[#DCFCE7]")}
                  >
                    <QrCode2Outlined size={14} color="#059669" />
                    <span className="text-[13px] font-semibold leading-none text-[#059669]">{t("detail.actions.qr_link")}</span>
                  </div>
                  <div
                    onClick={onCopyLink}
                    className={cn(actionBtnClass, "border-[#A7F3D0] bg-[#F0FDF4] hover:border-[#DCFCE7] hover:bg-[#DCFCE7]")}
                  >
                    <ContentCopyOutlined size={14} color="#059669" />
                    <span className="text-[13px] font-semibold leading-none text-[#059669]">{t("detail.actions.copy_link")}</span>
                  </div>
                </>
              )}
              {isOwner && (
                <DropdownMenu open={menuOpen} onOpenChange={(next) => { if (!next) onMenuClose(); }}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => { if (!menuOpen) onMenuOpen(e); }}
                      className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white text-[#6B7280] transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:text-[#374151]"
                    >
                      <MoreVertOutlined size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="mt-1.5 min-w-[180px] rounded-xl border border-[#E5E7EB] p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                  >
                    {canEdit ? (
                      <DropdownMenuItem
                        onClick={() => { onMenuClose(); onEditPost(); }}
                        className="mx-0.5 gap-2.5 rounded-lg px-2.5 py-2 focus:bg-[#F0FDFA]"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#F0FDFA]">
                          <EditOutlined size={14} color={TEAL} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold leading-tight text-[#111827]">{t("detail.menu.edit_title")}</p>
                          <p className="text-[11px] leading-tight text-[#9CA3AF]">{t("detail.menu.edit_desc_draft")}</p>
                        </div>
                      </DropdownMenuItem>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="mx-0.5 gap-2.5 rounded-lg px-2.5 py-2 opacity-45"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#F0FDFA]">
                              <EditOutlined size={14} color={TEAL} />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold leading-tight text-[#111827]">{t("detail.menu.edit_title")}</p>
                              <p className="text-[11px] leading-tight text-[#9CA3AF]">{t("detail.menu.edit_desc_published")}</p>
                            </div>
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="left">{t("detail.tooltips.cannot_edit_published")}</TooltipContent>
                      </Tooltip>
                    )}
                    <DropdownMenuSeparator className="mx-3 my-1 bg-[#F3F4F6]" />
                    <DropdownMenuItem
                      onClick={() => { onMenuClose(); onDelete(); }}
                      className="mx-0.5 gap-2.5 rounded-lg px-2.5 py-2 focus:bg-[#FEF2F2]"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#FEF2F2]">
                        <DeleteOutlineOutlined size={14} color="#EF4444" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold leading-tight text-[#EF4444]">{t("detail.menu.delete_title")}</p>
                        <p className="text-[11px] leading-tight text-[#9CA3AF]">{t("detail.menu.delete_desc")}</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Tabs */}
          {!isDraft && (
            <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "details" | "applications")} className="mt-5">
              <TabsList variant="line" className="h-11 gap-1 p-0">
                <TabsTrigger
                  value="details"
                  className="mr-1 gap-1.5 px-1.5 text-[13px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#0D9488]"
                >
                  <WorkOutlineOutlined size={15} />
                  {t("detail.tabs.details")}
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="gap-1.5 px-1.5 text-[13px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#0D9488]"
                >
                  <PeopleOutlined size={15} />
                  {t("detail.tabs.applications")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default JobDetailHeader;
