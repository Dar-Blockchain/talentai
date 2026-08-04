import React, { memo, useMemo, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { EmptyState, AddRowButton } from "./QuestionnaireForm";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

const RESOURCE_TYPE_KEYS = ["LINK", "DOCUMENT", "COURSE", "VIDEO"] as const;

type ResourceType = (typeof RESOURCE_TYPE_KEYS)[number];

interface Resource {
  type: ResourceType;
  title: string;
  url: string;
  estimatedTime?: number;
}

export interface TrainingPathConfig {
  resources: Resource[];
}

interface Props {
  config: TrainingPathConfig;
  onChange: (config: TrainingPathConfig) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TrainingPathForm = memo<Props>(({ config, onChange }) => {
  const { t } = useTranslation("dashboard");
  const cf = "pages.campaigns.detail.configure_form.training_path";

  const resourceOptions = useMemo(
    () =>
      RESOURCE_TYPE_KEYS.map((rt) => ({
        label: t(`${cf}.rtype_${rt}`),
        value: rt,
      })),
    [t, cf],
  );
  const addResource = useCallback(() =>
    onChange({ resources: [...config.resources, { type: "LINK", title: "", url: "" }] }), [onChange, config.resources]);

  const updateResource = useCallback((i: number, updates: Partial<Resource>) =>
    onChange({
      resources: config.resources.map((r, idx) => (idx === i ? { ...r, ...updates } : r)),
    }), [onChange, config.resources]);

  const removeResource = useCallback((i: number) =>
    onChange({ resources: config.resources.filter((_, idx) => idx !== i) }), [onChange, config.resources]);

  return (
    <div className="flex flex-col gap-3">
      {config.resources.length === 0 ? (
        <EmptyState label={t(`${cf}.empty`)} />
      ) : (
        config.resources.map((r, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/30 p-3.5">
            {/* Resource header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-foreground/80">
                {t(`${cf}.resource_heading`, { n: i + 1 })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeResource(i)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`${cf}.type_label`)}
                </Label>
                <Select value={r.type} onValueChange={(val) => updateResource(i, { type: val as ResourceType })}>
                  <SelectTrigger size="sm" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`${cf}.title_label`)}
                </Label>
                <Input
                  placeholder={t(`${cf}.title_placeholder`)}
                  value={r.title}
                  onChange={(e) => updateResource(i, { title: e.target.value })}
                  className="bg-background"
                />
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`${cf}.url_label`)}
                </Label>
                <Input
                  placeholder={t(`${cf}.url_placeholder`)}
                  value={r.url}
                  onChange={(e) => updateResource(i, { url: e.target.value })}
                  className="bg-background"
                />
              </div>

              {/* Estimated time */}
              <div className="flex flex-col gap-1.5 w-1/2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`${cf}.time_label`)}
                </Label>
                <Input
                  type="number"
                  placeholder={t(`${cf}.time_placeholder`)}
                  value={String(r.estimatedTime ?? "")}
                  onChange={(e) =>
                    updateResource(i, {
                      estimatedTime: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        ))
      )}

      <AddRowButton label={t(`${cf}.add_resource`)} onClick={addResource} />
    </div>
  );
});
TrainingPathForm.displayName = "TrainingPathForm";

export default TrainingPathForm;
