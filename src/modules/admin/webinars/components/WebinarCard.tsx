import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import {
  Video as WebinarIcon,
  CheckCircle2 as VerifyIcon,
  Trash2 as DeleteIcon,
  ExternalLink as OpenIcon,
  Send as SendIcon,
  Users as PeopleIcon,
  Download as DownloadIcon,
  MoreVertical as MoreIcon,
  Pencil as EditIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  UserPlus as InviteIcon,
} from "lucide-react";
import { getWebinarStatusMeta } from "../constants";
import { formatWebinarSchedule } from "../utils/formatSchedule";
import type { Webinar } from "../types";

export function WebinarCard({
  w,
  onEdit,
  onVerify,
  verifyPending,
  onExport,
  exportPending,
  onSendLink,
  sendLinkPending,
  onInvite,
  onDelete,
}: {
  w: Webinar;
  onEdit: () => void;
  onVerify: () => void;
  verifyPending: boolean;
  onExport: () => void;
  exportPending: boolean;
  onSendLink: () => void;
  sendLinkPending: boolean;
  onInvite: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const publicUrl = `/webinar?id=${w._id}`;
  const statusStyle = getWebinarStatusMeta(w.status);
  const schedule = formatWebinarSchedule(w.date, w.end_date);

  const goToDetail = (tab?: "registrants") =>
    router.push(`/admin/webinars/${w._id}${tab ? `?tab=${tab}` : ""}`);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const fullUrl = `${window.location.origin}${publicUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div
      onClick={() => goToDetail()}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all hover:-translate-y-px hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
      <div
        className="h-[3px] shrink-0"
        style={{
          backgroundColor: w.status === "draft" ? "#F59E0B" : "#E5E7EB",
        }}
      />

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border border-[#E5E7EB] bg-[#F3F4F6]">
            <WebinarIcon size={20} color="#6B7280" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-[5px] truncate text-[14.5px] font-bold leading-[1.3] text-[#111827]">
              {w.title}
            </p>
            <div
              className="inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[3px]"
              style={{
                backgroundColor: statusStyle.bg,
                border: `1px solid ${statusStyle.color}28`,
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: statusStyle.dot }}
              />
              <span
                className="text-[10.5px] font-bold leading-none"
                style={{ color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
            </div>
          </div>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <MoreIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[188px] rounded-xl border border-[#E5E7EB] p-1.5 shadow-lg"
            >
              <div className="px-1.5 pb-1 pt-0.5">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  {w.title}
                </p>
              </div>

              {w.status === "draft" && (
                <DropdownMenuItem
                  onClick={onVerify}
                  disabled={verifyPending}
                  className="gap-2.5 rounded-lg py-[9px] px-[10px] focus:bg-[#ECFDF5]"
                >
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#ECFDF5]">
                    <VerifyIcon size={13} color="#059669" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Publish
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Make this webinar live
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              {w.status === "active" && (
                <DropdownMenuItem
                  onClick={onSendLink}
                  disabled={sendLinkPending}
                  className="gap-2.5 rounded-lg py-[9px] px-[10px]"
                >
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                    <SendIcon size={13} color="#6B7280" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Send link
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Email join link to participants
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              {w.status === "draft" && (
                <DropdownMenuItem
                  onClick={onEdit}
                  className="gap-2.5 rounded-lg py-[9px] px-[10px]"
                >
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                    <EditIcon size={13} color="#6B7280" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Edit
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Update details & questions
                    </p>
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={onInvite}
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  <InviteIcon size={13} color="#6B7280" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                    Invite people
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Send invitations by email
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                    <OpenIcon size={13} color="#6B7280" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                      Preview page
                    </p>
                    <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                      Open the public landing page
                    </p>
                  </div>
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onExport}
                disabled={exportPending}
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  {exportPending ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <DownloadIcon size={13} color="#6B7280" />
                  )}
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#111827]">
                    Export Excel
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Download all submissions
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onDelete}
                variant="destructive"
                className="gap-2.5 rounded-lg py-[9px] px-[10px]"
              >
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F3F4F6]">
                  <DeleteIcon size={13} color="#6B7280" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-[1.2] text-[#374151]">
                    Delete
                  </p>
                  <p className="text-[10px] leading-[1.2] text-[#9CA3AF]">
                    Permanently remove this webinar
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2">
          {schedule && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#9CA3AF]">
                {schedule.date} · {schedule.time}
                {schedule.endTime && ` – ${schedule.endTime}`}
              </span>
            </div>
          )}
          {w.lang === "both" ? (
            <span className="flex items-center gap-1">
              <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] uppercase text-[#6B7280]">
                FR
              </span>
              <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] uppercase text-[#6B7280]">
                EN
              </span>
            </span>
          ) : (
            <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] uppercase text-[#6B7280]">
              {w.lang}
            </span>
          )}
          <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] text-[#6B7280]">
            {w.questions.length} questions
          </span>
        </div>

        {/* Footer */}
        <TooltipProvider>
          <div className="mt-auto flex items-center justify-between border-t border-[#F3F4F6] pt-3">
            <div className="flex items-center gap-1.5">
              {w.stats.avg_maturite_ia != null && (
                <span className="text-[11.5px] text-[#9CA3AF]">
                  avg{" "}
                  <strong className="text-[#111827]">
                    {w.stats.avg_maturite_ia}
                  </strong>
                  /100
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetail("registrants");
                    }}
                    className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-[#6B7280] hover:bg-gray-50"
                  >
                    <PeopleIcon size={13} />
                    <span className="text-[11.5px] font-semibold">
                      {w.stats.total_registrations}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Registrations</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-[#6B7280]">
                    <VerifyIcon size={13} />
                    <span className="text-[11.5px] font-semibold">
                      {w.stats.total_completions}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">Completions</TooltipContent>
              </Tooltip>

              {w.status === "active" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendLink();
                      }}
                      disabled={sendLinkPending}
                      aria-label="Send webinar link"
                      className="border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      {sendLinkPending ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <SendIcon size={14} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Send link</TooltipContent>
                </Tooltip>
              )}

              {w.status === "active" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleCopyLink}
                      aria-label="Copy webinar link"
                      className={
                        copied
                          ? "border-gray-200 bg-gray-100 text-gray-700"
                          : "border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      }
                    >
                      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {copied ? "Copied" : "Copy link"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default WebinarCard;
