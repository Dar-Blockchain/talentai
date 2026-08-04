"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { ListChecks } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import { MODULE_CONFIG } from "@/modules/shared/constants/campaign";
import type { TFunction } from "i18next";

// ─── Module config summary (used in the tab header) ────────────────────────────

function moduleConfigSummary(campaign: Campaign, t: TFunction): string | null {
  const op = "pages.campaigns.detail.overview";
  const mod = campaign.module;
  if (!mod?.config) return null;

  if (mod.type === "QUESTIONNAIRE") {
    return t(`${op}.questions_count`, { count: mod.config.questions?.length ?? 0 });
  }
  if (mod.type === "AI_INTERVIEW" && mod.config.agentPrompt) {
    return t(`${op}.agent_prompt_configured`);
  }
  if (mod.type === "SKILL_TEST" && mod.config.skill) {
    return t(`${op}.skill_summary`, { skill: mod.config.skill });
  }
  if (mod.type === "TRAINING_PATH" && mod.config.resources?.length) {
    return t(`${op}.resources_count`, { count: mod.config.resources.length });
  }
  return null;
}

// ─── Module config display ────────────────────────────────────────────────────

const ModuleConfigPanel: React.FC<{ campaign: Campaign; moduleColor: string }> = ({ campaign, moduleColor }) => {
  const { t } = useTranslation("dashboard");
  const op = "pages.campaigns.detail.overview";
  const mod = campaign.module;
  if (!mod?.config) return null;

  if (mod.type === "QUESTIONNAIRE") {
    const questions = mod.config.questions ?? [];
    const typeColor: Record<string, string> = {
      TEXT:            "#1D4ED8",
      SINGLE_CHOICE:   "#16A34A",
      MULTIPLE_CHOICE: "#D97706",
      RATING:          "#7C3AED",
    };
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
          {t(`${op}.questions_count`, { count: questions.length })}
        </p>
        <div className="divide-y divide-border/50 max-h-[26rem] overflow-y-auto pr-1">
          {questions.map((q, i) => {
            const hasOptions = (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && (q.options?.length ?? 0) > 0;
            return (
              <div key={i} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground/50 w-4">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12.5px] text-foreground/85 leading-snug">{q.question}</span>
                  <span
                    className="shrink-0 text-[10.5px] font-semibold capitalize"
                    style={{ color: typeColor[q.type] ?? "#6B7280" }}
                  >
                    {q.type.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                {hasOptions && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 pl-[26px]">
                    {q.options!.map((opt, oi) => (
                      <span key={oi} className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mod.type === "AI_INTERVIEW" && mod.config.agentPrompt) {
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{t(`${op}.agent_prompt_label`)}</p>
        <p
          className="text-[12.5px] text-foreground/75 leading-relaxed whitespace-pre-wrap border-l-2 pl-3"
          style={{ borderColor: `${moduleColor}40` }}
        >
          {mod.config.agentPrompt}
        </p>
      </div>
    );
  }

  if (mod.type === "SKILL_TEST" && mod.config.skill) {
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{t(`${op}.skill_assessed_label`)}</p>
        <p className="text-[14px] font-bold" style={{ color: moduleColor }}>{mod.config.skill}</p>
      </div>
    );
  }

  if (mod.type === "TRAINING_PATH" && mod.config.resources?.length) {
    const typeIcon: Record<string, string> = { LINK: "🔗", DOCUMENT: "📄", COURSE: "🎓", VIDEO: "▶️" };
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
          {t(`${op}.resources_count`, { count: mod.config.resources.length })}
        </p>
        <div className="divide-y divide-border/50 max-h-[26rem] overflow-y-auto pr-1">
          {mod.config.resources.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
              <span className="text-base shrink-0">{typeIcon[r.type] ?? "📎"}</span>
              <span className="flex-1 text-[12.5px] text-foreground/85 truncate">{r.title}</span>
              {r.estimatedTime && (
                <span className="shrink-0 text-[11px] text-muted-foreground">{r.estimatedTime}min</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// ─── Tab ───────────────────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  moduleColor: string;
}

const CampaignModuleConfigTab: React.FC<Props> = ({ campaign, moduleColor }) => {
  const { t } = useTranslation("dashboard");
  const op = "pages.campaigns.detail.overview";
  const ModuleIcon = campaign.module?.type ? MODULE_CONFIG[campaign.module.type]?.icon : null;
  const configSummary = moduleConfigSummary(campaign, t);

  if (!campaign.module?.config) return null;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center size-8 rounded-[10px] shrink-0" style={{ background: `${moduleColor}14`, border: `1px solid ${moduleColor}28` }}>
          {ModuleIcon ? <ModuleIcon className="!size-4" style={{ color: moduleColor }} /> : <ListChecks className="size-4" style={{ color: moduleColor }} />}
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-foreground">{t(`${op}.module_configuration_title`)}</p>
          {configSummary && <p className="text-[11.5px] text-muted-foreground truncate">{configSummary}</p>}
        </div>
      </div>
      <ModuleConfigPanel campaign={campaign} moduleColor={moduleColor} />
    </Card>
  );
};

export default CampaignModuleConfigTab;
