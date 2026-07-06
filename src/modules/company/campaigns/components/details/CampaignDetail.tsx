import React, { memo, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Users, ClipboardList, Play, ArrowRight,
  CircleCheck, Circle, SlidersHorizontal, Rocket, EyeOff,
} from "lucide-react";
import {
  Campaign,
  CampaignModule,
  CampaignStatus,
  ModuleType,
  ParticipantStatus,
} from "@/modules/company/campaigns/types/campaign";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/modules/shared/ui/shadcn/tabs";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import CampaignHeader from "./CampaignHeader";
import CampaignOverviewCharts from "./CampaignOverviewCharts";
import CampaignParticipantsTab from "./CampaignParticipantsTab";
import CampaignSessionsTab from "./CampaignSessionsTab";
import DeleteCampaignDialog from "./DeleteCampaignDialog";
import ConfirmStatusChangeDialog from "./ConfirmStatusChangeDialog";
import ConfigureModuleModal from "./configure/ConfigureModuleModal";
import EditCampaignModal from "./EditCampaignModal";
import { useDeleteCampaignMutation } from "../../queries";
import { MODULE_CONFIG } from "@/modules/shared/constants/campaign";
import { isDeadlinePassed } from "@/utils/functions";
import { buildCampaignSessionUrl } from "@/lib/campaignSession";

// ─── Static constants ─────────────────────────────────────────────────────────

const PARTICIPANT_STATUS_STYLE: Record<
  ParticipantStatus,
  { color: string; bg: string }
> = {
  INVITED: { color: "#0891B2", bg: "#ECFDF5" },
  IN_PROGRESS: { color: "#D97706", bg: "#FFFBEB" },
  COMPLETED: { color: "#16A34A", bg: "#F0FDF4" },
  DROPPED: { color: "#EF4444", bg: "#FEF2F2" },
};

// ─── CampaignDetail ───────────────────────────────────────────────────────────

type TabKey = "overview" | "participants" | "sessions";

interface Props {
  campaign: Campaign;
  mode?: "company" | "employee";
  onDelete?: (id: string, title: string) => void;
  onChangeStatus?: (id: string, status: CampaignStatus) => void | Promise<void>;
  onSaveModuleConfig?: (
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => void | Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
  statusLoading?: boolean;
  configLoading?: boolean;
}

const CampaignDetail: React.FC<Props> = memo(
  ({
    campaign,
    mode = "company",
    onDelete,
    onChangeStatus,
    onSaveModuleConfig,
    canEdit = true,
    canDelete = true,
    canPublish = true,
    statusLoading = false,
    configLoading = false,
  }) => {
    const { t } = useTranslation("dashboard");
    const tp = "pages.campaigns.detail";
    const isEmployee = mode === "employee";

    const [tab, setTab] = useState<TabKey>("overview");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [configureModuleType, setConfigureModuleType] =
      useState<ModuleType | null>(null);
    const [pendingActivate, setPendingActivate] = useState(false);

    const deleteMut = useDeleteCampaignMutation();
    const participantsTotal = campaign.participantCount ?? 0;
    const sessionsTotal = (campaign as any).sessionCount ?? 0;
    const deleteLoading = deleteMut.isPending;

    const participantStatusLabel = useCallback(
      (s: ParticipantStatus) =>
        t(`pages.campaigns.detail.participants.participant_status.${s}`),
      [t],
    );

    // ─── Event handlers ───────────────────────────────────────────────────────

    const openDelete = useCallback(() => setDeleteOpen(true), []);
    const closeDelete = useCallback(() => setDeleteOpen(false), []);
    const openEdit = useCallback(() => setEditOpen(true), []);
    const closeEdit = useCallback(() => setEditOpen(false), []);
    const closeConfig = useCallback(() => setConfigureModuleType(null), []);
    const closePending = useCallback(() => setPendingActivate(false), []);
    const openPending = useCallback(() => setPendingActivate(true), []);

    const handleDeleteConfirm = useCallback(
      () => onDelete?.(campaign._id, campaign.title),
      [onDelete, campaign._id, campaign.title],
    );
    const handleActivateConfirm = useCallback(async () => {
      await onChangeStatus?.(campaign._id, "ACTIVE");
      setPendingActivate(false);
    }, [onChangeStatus, campaign._id]);

    const handleSaveConfig = useCallback(
      async (
        campaignId: string,
        moduleType: ModuleType,
        config: NonNullable<CampaignModule["config"]>,
      ) => {
        await onSaveModuleConfig?.(campaignId, moduleType, config);
        setConfigureModuleType(null);
      },
      [onSaveModuleConfig],
    );

    const openConfigureModule = useCallback(
      (type: ModuleType) => setConfigureModuleType(type),
      [],
    );

    const handleAssessmentAction = useCallback(() => {
      window.open(
        buildCampaignSessionUrl(campaign._id),
        "_blank",
        "noopener,noreferrer",
      );
    }, [campaign._id]);

    // ─── Derived values ───────────────────────────────────────────────────────

    const modCfg = useMemo(
      () => MODULE_CONFIG[campaign.module?.type],
      [campaign.module?.type],
    );
    const isExpired = useMemo(
      () => isDeadlinePassed(campaign.deadline),
      [campaign.deadline],
    );
    const pStatus = campaign.participantStatus ?? "INVITED";
    const ps = PARTICIPANT_STATUS_STYLE[pStatus];
    const campaignAccessible = campaign.status === "ACTIVE";
    const canStart =
      (pStatus === "INVITED" || pStatus === "IN_PROGRESS") &&
      !isExpired &&
      campaignAccessible;
    const moduleType = campaign.module?.type;
    const supportsAction =
      moduleType === "AI_INTERVIEW" ||
      moduleType === "SKILL_TEST" ||
      moduleType === "QUESTIONNAIRE";
    const isLinkBased = campaign.accessMethod === "LINK";
    const moduleConfigured = campaign.module?.config != null;
    const showSetupBanner = !isEmployee && campaign.status === "DRAFT";

    const currentModuleConfig = useMemo(
      () => (configureModuleType ? (campaign.module?.config ?? null) : null),
      [configureModuleType, campaign.module?.config],
    );

    const TABS = useMemo(
      () => [
        {
          key: "overview" as TabKey,
          label: t(`${tp}.tab_overview`),
          icon: LayoutDashboard,
          count: undefined as number | string | undefined,
        },
        ...(!isLinkBased
          ? [
              {
                key: "participants" as TabKey,
                label: t(`${tp}.tab_participants`),
                icon: Users,
                count: participantsTotal || undefined,
              },
            ]
          : []),
        ...(!isEmployee
          ? [
              {
                key: "sessions" as TabKey,
                label: t(`${tp}.tab_sessions`),
                icon: ClipboardList,
                count: sessionsTotal || undefined,
              },
            ]
          : []),
      ],
      [t, tp, isLinkBased, isEmployee, participantsTotal, sessionsTotal],
    );

    // ─── Employee-mode actions node ───────────────────────────────────────────

    const employeeActionsNode = useMemo(
      () =>
        !isEmployee ? undefined : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{ background: ps.bg }}>
              <span className="size-1.5 rounded-full" style={{ background: ps.color }} />
              <span className="text-[11px] font-bold" style={{ color: ps.color }}>{participantStatusLabel(pStatus)}</span>
            </span>

            {isExpired && pStatus !== "COMPLETED" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200">
                <span className="size-1.5 rounded-full bg-red-500" />
                <span className="text-[11px] font-bold text-red-500">{t(`${tp}.employee_deadline_passed`)}</span>
              </span>
            )}
            {campaign.status === "PAUSED" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                <span className="size-1.5 rounded-full bg-amber-600" />
                <span className="text-[11px] font-bold text-amber-600">{t(`${tp}.employee_campaign_paused`)}</span>
              </span>
            )}
            {campaign.status === "CLOSED" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                <span className="size-1.5 rounded-full bg-blue-600" />
                <span className="text-[11px] font-bold text-blue-600">{t(`${tp}.employee_campaign_closed`)}</span>
              </span>
            )}

            {supportsAction && canStart && (
              <Button
                variant="ghost"
                onClick={handleAssessmentAction}
                className="px-2.5 py-1.5 h-auto rounded-[10px] border hover:opacity-85"
                style={{
                  background: pStatus === "IN_PROGRESS" ? "#FFFBEB" : "#8310FF10",
                  borderColor: pStatus === "IN_PROGRESS" ? "#FDE68A" : "#8310FF30",
                }}
              >
                {pStatus === "IN_PROGRESS" ? (
                  <ArrowRight className="size-3.5 text-amber-600" />
                ) : (
                  <Play className="size-3.5" style={{ color: "#8310FF" }} />
                )}
                <span
                  className="text-[0.775rem] font-bold"
                  style={{ color: pStatus === "IN_PROGRESS" ? "#D97706" : "#8310FF" }}
                >
                  {pStatus === "IN_PROGRESS"
                    ? t(`${tp}.continue`)
                    : moduleType === "QUESTIONNAIRE"
                      ? t(`${tp}.start_questionnaire`)
                      : t(`${tp}.start_assessment`)}
                </span>
              </Button>
            )}
          </div>
        ),
      [
        isEmployee, pStatus, ps, isExpired, campaign.status, supportsAction,
        canStart, handleAssessmentAction, moduleType, t, tp, participantStatusLabel,
      ],
    );

    return (
      <div className="flex flex-col gap-3">
        <CampaignHeader
          campaign={campaign}
          onChangeStatus={canPublish ? onChangeStatus : undefined}
          onDeleteClick={canDelete && !isEmployee ? openDelete : undefined}
          onEditClick={canEdit && !isEmployee ? openEdit : undefined}
          backLabel={
            isEmployee ? t(`${tp}.back_employee`) : t(`${tp}.back_company`)
          }
          backUrl={isEmployee ? "/employee/campaigns" : "/company/campaigns"}
          actionsNode={employeeActionsNode}
        />

        {/* Setup checklist banner */}
        {showSetupBanner && (
          <div className="relative overflow-hidden bg-background border border-border rounded-[18px] p-5 shadow-sm">
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{ background: "linear-gradient(135deg, #F59E0B 0%, #8310FF 100%)" }}
            />
            <div className="relative flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center size-8 rounded-[9px] bg-amber-50 border border-amber-200 shrink-0">
                <EyeOff className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[13.5px] font-bold text-foreground">{t(`${tp}.setup_banner.title`)}</p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">{t(`${tp}.setup_banner.subtitle`)}</p>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3">
              {/* Step 1 */}
              <div
                className="flex-1 rounded-2xl p-4 flex flex-col gap-2 border-[1.5px]"
                style={{
                  borderColor: moduleConfigured ? "#86EFAC" : "#FDE68A",
                  background: moduleConfigured ? "#F0FDF4" : "#FFFBEB",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center size-7 rounded-lg shrink-0 border"
                      style={{
                        background: moduleConfigured ? "#DCFCE7" : "#FEF3C7",
                        borderColor: moduleConfigured ? "#86EFAC" : "#FDE68A",
                      }}
                    >
                      {moduleConfigured
                        ? <CircleCheck className="size-[15px] text-green-600" />
                        : <SlidersHorizontal className="size-[15px] text-amber-600" />}
                    </div>
                    <p className="text-[12.5px] font-bold" style={{ color: moduleConfigured ? "#15803D" : "#92400E" }}>
                      {t(`${tp}.setup_step1_title`)}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: moduleConfigured ? "#DCFCE7" : "#FEF3C7" }}
                  >
                    {moduleConfigured
                      ? <CircleCheck className="size-[11px] text-green-600" />
                      : <Circle className="size-[11px] text-amber-600" />}
                    <span className="text-[10px] font-bold" style={{ color: moduleConfigured ? "#16A34A" : "#D97706" }}>
                      {moduleConfigured ? t(`${tp}.setup_step_done`) : t(`${tp}.setup_step_pending`)}
                    </span>
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed" style={{ color: moduleConfigured ? "#166534" : "#78350F" }}>
                  {moduleConfigured ? t(`${tp}.setup_step1_desc_done`) : t(`${tp}.setup_step1_desc_pending`)}
                </p>
                {campaign.module?.type && canEdit && (
                  <Button
                    variant="ghost"
                    onClick={() => openConfigureModule(campaign.module!.type)}
                    className={cn(
                      "self-start mt-0.5 px-2.5 py-1.5 h-auto rounded-lg border",
                      moduleConfigured
                        ? "bg-green-100/70 border-green-300 hover:bg-green-200/70"
                        : "bg-amber-200/70 border-amber-300 hover:bg-amber-300/70",
                    )}
                  >
                    <SlidersHorizontal className={cn("size-3", moduleConfigured ? "text-green-700" : "text-amber-700")} />
                    <span className={cn("text-xs font-bold", moduleConfigured ? "text-green-700" : "text-amber-700")}>
                      {moduleConfigured ? t(`${tp}.setup_edit_configuration`) : t(`${tp}.setup_configure_now`)}
                    </span>
                  </Button>
                )}
              </div>

              <div className="hidden sm:flex items-center text-slate-300 text-xl font-light">→</div>

              {/* Step 2 */}
              <div
                className="flex-1 rounded-2xl p-4 flex flex-col gap-2 border-[1.5px]"
                style={{
                  borderColor: moduleConfigured ? "#BFDBFE" : "#E5E7EB",
                  background: moduleConfigured ? "#EFF6FF" : "#F9FAFB",
                  opacity: moduleConfigured ? 1 : 0.6,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center size-7 rounded-lg shrink-0 border"
                      style={{
                        background: moduleConfigured ? "#DBEAFE" : "#F3F4F6",
                        borderColor: moduleConfigured ? "#BFDBFE" : "#E5E7EB",
                      }}
                    >
                      <Rocket className="size-[15px]" style={{ color: moduleConfigured ? "#2563EB" : "#9CA3AF" }} />
                    </div>
                    <p className="text-[12.5px] font-bold" style={{ color: moduleConfigured ? "#1E40AF" : "#6B7280" }}>
                      {t(`${tp}.setup_step2_title`)}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: moduleConfigured ? "#DBEAFE" : "#F3F4F6" }}
                  >
                    <Circle className="size-[11px]" style={{ color: moduleConfigured ? "#2563EB" : "#9CA3AF" }} />
                    <span className="text-[10px] font-bold" style={{ color: moduleConfigured ? "#2563EB" : "#9CA3AF" }}>
                      {t(`${tp}.setup_step_pending`)}
                    </span>
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed" style={{ color: moduleConfigured ? "#1E40AF" : "#9CA3AF" }}>
                  {moduleConfigured ? t(`${tp}.setup_step2_desc_ready`) : t(`${tp}.setup_step2_desc_wait`)}
                </p>
                {moduleConfigured && canPublish && (
                  <Button
                    variant="ghost"
                    onClick={openPending}
                    className="self-start mt-0.5 px-2.5 py-1.5 h-auto rounded-lg bg-blue-600 border border-blue-700 hover:bg-blue-700 hover:text-white"
                  >
                    <Rocket className="size-3 text-white" />
                    <span className="text-xs font-bold text-white">{t(`${tp}.setup_activate_now`)}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <div className="flex items-center px-2 py-2.5">
            <TabsList className="h-auto bg-muted p-1 gap-1">
              {TABS.map(({ key, label, icon: Icon, count }) => (
                <TabsTrigger key={key} value={key} className="gap-1.5 px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">
                  <Icon className="size-4" />
                  <span className="text-[13px] font-bold">{label}</span>
                  {count !== undefined && (
                    <span className="min-w-5 h-5 px-1.5 rounded-md flex items-center justify-center bg-foreground/10 text-[11px] font-extrabold">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-3">
            <TabsContent value="overview" className="flex flex-col gap-1.5 mt-0">
              <CampaignOverviewCharts
                campaign={campaign}
                moduleColor={modCfg?.color ?? "#8310FF"}
              />
            </TabsContent>
            <TabsContent value="participants" className="mt-0">
              <CampaignParticipantsTab
                campaignId={campaign._id}
                mode={mode}
                anonymityMode={campaign.anonymityMode}
              />
            </TabsContent>
            <TabsContent value="sessions" className="mt-0">
              <CampaignSessionsTab
                campaignId={campaign._id}
                anonymityMode={campaign.anonymityMode}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Dialogs (company only) */}
        {!isEmployee && (
          <>
            <EditCampaignModal
              open={editOpen}
              campaign={campaign}
              onClose={closeEdit}
              onSaved={closeEdit}
            />
            <DeleteCampaignDialog
              open={deleteOpen}
              campaignTitle={campaign.title}
              participantCount={campaign.participantCount}
              loading={deleteLoading}
              onClose={closeDelete}
              onConfirm={handleDeleteConfirm}
            />
            <ConfigureModuleModal
              open={configureModuleType !== null}
              campaignId={campaign._id}
              moduleType={configureModuleType}
              currentConfig={currentModuleConfig}
              onClose={closeConfig}
              onSave={handleSaveConfig}
              loading={configLoading}
            />
            <ConfirmStatusChangeDialog
              open={pendingActivate}
              campaignTitle={campaign.title}
              currentStatus={campaign.status}
              targetStatus="ACTIVE"
              onClose={closePending}
              onConfirm={handleActivateConfirm}
              loading={statusLoading}
            />
          </>
        )}
      </div>
    );
  },
);

CampaignDetail.displayName = "CampaignDetail";
export default CampaignDetail;
