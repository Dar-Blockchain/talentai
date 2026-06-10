import React, { useMemo } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import AppInput from "@/components/ui/AppInput";
import AppSelect from "@/components/ui/AppSelect";
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

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────

const TrainingPathForm: React.FC<Props> = ({ config, onChange }) => {
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
  const addResource = () =>
    onChange({ resources: [...config.resources, { type: "LINK", title: "", url: "" }] });

  const updateResource = (i: number, updates: Partial<Resource>) =>
    onChange({
      resources: config.resources.map((r, idx) => (idx === i ? { ...r, ...updates } : r)),
    });

  const removeResource = (i: number) =>
    onChange({ resources: config.resources.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {config.resources.length === 0 ? (
        <EmptyState label={t(`${cf}.empty`)} />
      ) : (
        config.resources.map((r, i) => (
          <Box
            key={i}
            sx={{ p: 2, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#FAFAFA" }}
          >
            {/* Resource header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                {t(`${cf}.resource_heading`, { n: i + 1 })}
              </Typography>
              <IconButton
                size="small"
                onClick={() => removeResource(i)}
                sx={{ color: "#EF4444", p: 0.5, "&:hover": { bgcolor: "#FEF2F2" } }}
              >
                <DeleteOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Type */}
              <AppSelect
                label={t(`${cf}.type_label`)}
                value={r.type}
                options={resourceOptions}
                onChange={(val) => updateResource(i, { type: val as ResourceType })}
              />

              {/* Title */}
              <AppInput
                label={t(`${cf}.title_label`)}
                placeholder={t(`${cf}.title_placeholder`)}
                value={r.title}
                onChange={(e) => updateResource(i, { title: e.target.value })}
              />

              {/* URL */}
              <AppInput
                label={t(`${cf}.url_label`)}
                placeholder={t(`${cf}.url_placeholder`)}
                value={r.url}
                onChange={(e) => updateResource(i, { url: e.target.value })}
              />

              {/* Estimated time */}
              <AppInput
                label={t(`${cf}.time_label`)}
                type="number"
                placeholder={t(`${cf}.time_placeholder`)}
                value={String(r.estimatedTime ?? "")}
                onChange={(e) =>
                  updateResource(i, {
                    estimatedTime: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                fullWidth={false}
                sx={{ width: "50%" }}
              />
            </Box>
          </Box>
        ))
      )}

      <AddRowButton label={t(`${cf}.add_resource`)} onClick={addResource} />
    </Box>
  );
};

export default TrainingPathForm;
