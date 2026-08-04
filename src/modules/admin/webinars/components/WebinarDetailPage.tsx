import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ChevronRight as NavigateNextIcon,
  Video as WebinarIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { MoreOptionsMenu } from "@/modules/shared/ui/MoreOptionsMenu";
import { ConfirmDialog, ADMIN_ACCENT } from "@/modules/admin/shared";
import { useAdminWebinarQuery } from "../queries";
import { getWebinarStatusMeta } from "../constants";
import { formatWebinarSchedule } from "../utils/formatSchedule";
import { findInvalidQuestion, questionErrorMessage, toFormValues } from "../utils/webinarForm";
import { useWebinarActions } from "../hooks/useWebinarActions";
import { WebinarQuestionsList } from "./WebinarQuestionsList";
import { WebinarRegistrantsTab } from "./WebinarRegistrantsTab";
import { WebinarInviteDialog } from "./WebinarInviteDialog";
import { WebinarFormDialog } from "./WebinarFormDialog";

function CompactStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white py-2.5 px-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ADMIN_ACCENT}14` }}>
        <Icon size={15} color={ADMIN_ACCENT} />
      </div>
      <div className="min-w-0">
        <div className="text-base font-bold text-slate-900 leading-none tabular-nums">{value}</div>
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}

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
    updateMut,
    editOpen,
    setEditOpen,
    handleEditSave,
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
  const invalidQuestion = webinar.status === "draft" ? findInvalidQuestion(webinar.questions) : null;
  const publishBlockedReason =
    webinar.status === "draft" && webinar.questions.length === 0
      ? "Add at least one question before publishing."
      : invalidQuestion
        ? questionErrorMessage(invalidQuestion.reason)
        : null;

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
        className="mb-4 overflow-hidden rounded-2xl bg-white"
        style={{ border: `1px solid ${webinar.status === "draft" ? "#FDE68A" : "#E5E7EB"}` }}
      >
        <div className="h-0.75 w-full" style={{ backgroundColor: webinar.status === "draft" ? "#F59E0B" : "#059669" }} />
        <div className="px-4 pt-3.5 pb-3 md:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]">
                <WebinarIcon size={18} color="#6B7280" />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-[1.1rem] font-extrabold leading-[1.25] text-[#111827]">{webinar.title}</p>
                  <span
                    className="inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[2px]"
                    style={{ backgroundColor: statusMeta.bg, border: `1px solid ${statusMeta.color}28` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusMeta.dot }} />
                    <span className="text-[10px] font-bold" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] text-[#6B7280]">
                  {schedule && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} color="#9CA3AF" />
                      {schedule.date}, {schedule.time}
                      {schedule.endTime && ` – ${schedule.endTime}`}
                    </span>
                  )}
                  <span className="font-semibold uppercase">
                    {webinar.lang === "both" ? "EN/FR" : webinar.lang}
                  </span>
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
                  disabled={verifyMut.isPending || !!publishBlockedReason}
                  title={publishBlockedReason ?? undefined}
                  className="h-8 rounded-[10px] bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
                >
                  {verifyMut.isPending ? <Spinner className="size-3.5 text-white" /> : <VerifyIcon size={14} />}
                  Publish
                </Button>
              )}
              {webinar.status === "active" && (
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="h-8 rounded-[10px] border-[#A7F3D0] bg-[#F0FDF4] text-[#059669] hover:bg-[#DCFCE7]"
                >
                  {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
              <MoreOptionsMenu
                size="md"
                bordered
                label="More actions"
                contentClassName="rounded-xl border border-[#E5E7EB] p-1.5 shadow-lg"
              >
                  {webinar.status === "active" && (
                    <DropdownMenuItem onClick={() => setReminderOpen(true)} className="gap-2.5 rounded-lg py-[9px] px-[10px]">
                      <SendIcon size={14} color="#6B7280" /> Send link
                    </DropdownMenuItem>
                  )}
                  {webinar.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => setEditOpen(true)}
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
              </MoreOptionsMenu>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "registrants")} className="mt-3">
            <TabsList variant="line" className="h-9 gap-1 p-0">
              <TabsTrigger value="details" className="mr-1 gap-1.5 px-1.5 text-[12.5px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#0D9488]">
                <WebinarIcon size={14} /> Webinar Details
              </TabsTrigger>
              <TabsTrigger value="registrants" className="gap-1.5 px-1.5 text-[12.5px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#0D9488]">
                <PeopleIcon size={14} /> Registrants
                <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {webinar.stats.total_registrations}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === "details" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <CompactStat icon={PeopleIcon} label="Registrations" value={webinar.stats.total_registrations} />
            <CompactStat icon={VerifyIcon} label="Completions" value={webinar.stats.total_completions} />
            <CompactStat
              icon={ScoreIcon}
              label="Avg score"
              value={webinar.stats.avg_score != null ? `${webinar.stats.avg_score}/100` : "—"}
            />
          </div>

          {webinar.webinar_link && (
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-1.5">Join link</p>
              <a
                href={webinar.webinar_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 break-all text-[12.5px] text-teal-600 hover:underline"
              >
                <LinkIcon size={13} className="shrink-0" /> {webinar.webinar_link}
              </a>
            </div>
          )}

          {(webinar.about_fr || webinar.about_en) && (
            <div className="grid grid-cols-2 gap-3">
              {webinar.about_fr && (
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-1.5">About (FR)</p>
                  <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-slate-700">{webinar.about_fr}</p>
                </div>
              )}
              {webinar.about_en && (
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-1.5">About (EN)</p>
                  <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-slate-700">{webinar.about_en}</p>
                </div>
              )}
            </div>
          )}

          {highlights.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-1.5">Highlights</p>
              <ul className="space-y-1">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[12.5px] text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-1.5">Questions</p>
            <WebinarQuestionsList questions={webinar.questions} />
          </div>
        </div>
      ) : (
        <WebinarRegistrantsTab webinar={webinar} />
      )}

      <WebinarFormDialog
        open={editOpen}
        initial={toFormValues(webinar)}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        saving={updateMut.isPending}
      />

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
