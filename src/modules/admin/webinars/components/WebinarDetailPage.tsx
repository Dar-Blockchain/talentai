import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ChevronRight as NavigateNextIcon,
  Video as WebinarIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  MoreVertical as MoreIcon,
  CheckCircle2 as VerifyIcon,
  Send as SendIcon,
  UserPlus as InviteIcon,
  Pencil as EditIcon,
  ExternalLink as OpenIcon,
  Download as DownloadIcon,
  Trash2 as DeleteIcon,
  Users as PeopleIcon,
  Calendar as CalendarIcon,
  Link2 as LinkIcon,
  BarChart3 as ScoreIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/modules/shared/ui/shadcn/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/modules/shared/ui/shadcn/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { ConfirmDialog, ADMIN_ACCENT, AdminStatCard } from "@/modules/admin/shared";
import { useAdminWebinarQuery } from "../queries";
import { getWebinarStatusMeta } from "../constants";
import { formatWebinarSchedule } from "../utils/formatSchedule";
import { useWebinarActions } from "../hooks/useWebinarActions";
import { WebinarQuestionsList } from "./WebinarQuestionsList";
import { WebinarRegistrantsTab } from "./WebinarRegistrantsTab";
import { WebinarInviteDialog } from "./WebinarInviteDialog";

export function WebinarDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: webinar, isLoading } = useAdminWebinarQuery(id);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const {
    publicUrl,
    copied,
    handleCopyLink,
    exporting,
    handleExport,
    verifyMut,
    handleVerify,
    deleteMut,
    handleDelete,
    sendingReminder,
    handleSendReminder,
  } = useWebinarActions(webinar);

  const activeTab = router.query.tab === "registrants" ? "registrants" : "details";
  const setActiveTab = (tab: "details" | "registrants") =>
    router.push({ pathname: router.pathname, query: { id, tab } }, undefined, { shallow: true });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner style={{ color: ADMIN_ACCENT }} />
      </div>
    );
  }
  if (!webinar) {
    return <p className="py-24 text-center text-sm text-slate-400">Webinar not found.</p>;
  }

  const statusMeta = getWebinarStatusMeta(webinar.status);
  const schedule = formatWebinarSchedule(webinar.date, webinar.end_date);
  const highlights = webinar.highlights.filter(Boolean);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="flex-nowrap gap-1">
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="text-[12px] font-medium text-[#6B7280] hover:text-[#111827]">
              <Link href="/admin/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="mx-0"><NavigateNextIcon size={14} color="#D1D5DB" /></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="text-[12px] font-medium text-[#6B7280] hover:text-[#111827]">
              <Link href="/admin/dashboard?tab=webinars">Webinars</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="mx-0"><NavigateNextIcon size={14} color="#D1D5DB" /></BreadcrumbSeparator>
          <BreadcrumbItem>
            <span className="text-[12px] font-semibold text-[#111827]">{webinar.title}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header card */}
      <div
        className="mb-6 overflow-hidden rounded-2xl bg-white"
        style={{ border: `1px solid ${webinar.status === "draft" ? "#FDE68A" : "#E5E7EB"}` }}
      >
        <div className="h-0.75 w-full" style={{ backgroundColor: webinar.status === "draft" ? "#F59E0B" : "#059669" }} />
        <div className="px-5 pt-5 pb-4 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]">
                <WebinarIcon size={24} color="#6B7280" />
              </div>
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <p className="text-[1.35rem] font-extrabold leading-[1.25] text-[#111827]">{webinar.title}</p>
                  <span
                    className="inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[3px]"
                    style={{ backgroundColor: statusMeta.bg, border: `1px solid ${statusMeta.color}28` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusMeta.dot }} />
                    <span className="text-[10.5px] font-bold" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
                  {schedule && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={13} color="#9CA3AF" />
                      {schedule.date}, {schedule.time}
                      {schedule.endTime && ` – ${schedule.endTime}`}
                    </span>
                  )}
                  <span className="font-semibold uppercase">{webinar.lang}</span>
                  <span>{webinar.questions.length} questions</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {webinar.status === "draft" && (
                <Button
                  variant="ghost"
                  onClick={handleVerify}
                  disabled={verifyMut.isPending}
                  className="h-9 rounded-[10px] bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
                >
                  {verifyMut.isPending ? <Spinner className="size-3.5 text-white" /> : <VerifyIcon size={14} />}
                  Publish
                </Button>
              )}
              {webinar.status === "active" && (
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="h-9 rounded-[10px] border-[#A7F3D0] bg-[#F0FDF4] text-[#059669] hover:bg-[#DCFCE7]"
                >
                  {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]">
                    <MoreIcon size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[188px] rounded-xl border border-[#E5E7EB] p-1.5 shadow-lg">
                  {webinar.status === "active" && (
                    <DropdownMenuItem onClick={() => setReminderOpen(true)} className="gap-2.5 rounded-lg py-[9px] px-[10px]">
                      <SendIcon size={14} color="#6B7280" /> Send link
                    </DropdownMenuItem>
                  )}
                  {webinar.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/dashboard?tab=webinars&edit=${webinar._id}`)}
                      className="gap-2.5 rounded-lg py-[9px] px-[10px]"
                    >
                      <EditIcon size={14} color="#6B7280" /> Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setInviteOpen(true)} className="gap-2.5 rounded-lg py-[9px] px-[10px]">
                    <InviteIcon size={14} color="#6B7280" /> Invite people
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 rounded-lg py-[9px] px-[10px]">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <OpenIcon size={14} color="#6B7280" /> Preview page
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport} disabled={exporting} className="gap-2.5 rounded-lg py-[9px] px-[10px]">
                    {exporting ? <Spinner className="size-3.5" /> : <DownloadIcon size={14} color="#6B7280" />} Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)} variant="destructive" className="gap-2.5 rounded-lg py-[9px] px-[10px]">
                    <DeleteIcon size={14} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "registrants")} className="mt-5">
            <TabsList variant="line" className="h-11 gap-1 p-0">
              <TabsTrigger value="details" className="mr-1 gap-1.5 px-1.5 text-[13px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#0D9488]">
                <WebinarIcon size={15} /> Webinar Details
              </TabsTrigger>
              <TabsTrigger value="registrants" className="gap-1.5 px-1.5 text-[13px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#0D9488]">
                <PeopleIcon size={15} /> Registrants
                <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {webinar.stats.total_registrations}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === "details" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <AdminStatCard icon={PeopleIcon} label="Registrations" value={webinar.stats.total_registrations} />
            <AdminStatCard icon={VerifyIcon} label="Completions" value={webinar.stats.total_completions} />
            <AdminStatCard
              icon={ScoreIcon}
              label="Avg score"
              value={webinar.stats.avg_maturite_ia != null ? `${webinar.stats.avg_maturite_ia}/100` : "—"}
            />
          </div>

          {webinar.webinar_link && (
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">Join link</p>
              <a
                href={webinar.webinar_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 break-all text-[13px] text-teal-600 hover:underline"
              >
                <LinkIcon size={14} className="shrink-0" /> {webinar.webinar_link}
              </a>
            </div>
          )}

          {(webinar.about_fr || webinar.about_en) && (
            <div className="grid grid-cols-2 gap-4">
              {webinar.about_fr && (
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">About (FR)</p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">{webinar.about_fr}</p>
                </div>
              )}
              {webinar.about_en && (
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">About (EN)</p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">{webinar.about_en}</p>
                </div>
              )}
            </div>
          )}

          {highlights.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">Highlights</p>
              <ul className="space-y-1.5">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[13px] text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[2px] text-slate-400 mb-2">Questions</p>
            <WebinarQuestionsList questions={webinar.questions} />
          </div>
        </div>
      ) : (
        <WebinarRegistrantsTab webinar={webinar} />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete webinar?"
        description="This will permanently delete the webinar. Submissions are not affected."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onConfirm={() => handleDelete(() => router.push("/admin/dashboard?tab=webinars"))}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={reminderOpen}
        title="Send webinar link to all participants?"
        description={`This will send the webinar join link to all completed participants of "${webinar.title}". The reminder email will be sent immediately to everyone.`}
        confirmLabel="Send now"
        loading={sendingReminder}
        onConfirm={() => handleSendReminder(() => setReminderOpen(false))}
        onCancel={() => setReminderOpen(false)}
      />

      <WebinarInviteDialog
        webinarId={webinar._id}
        webinarTitle={webinar.title}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}

export default WebinarDetailPage;
