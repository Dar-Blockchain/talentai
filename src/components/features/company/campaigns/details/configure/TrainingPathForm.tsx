import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import AppInput from "@/components/ui/AppInput";
import AppSelect from "@/components/ui/AppSelect";
import { EmptyState, AddRowButton } from "./QuestionnaireForm";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourceType = "LINK" | "DOCUMENT" | "COURSE" | "VIDEO";

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

const RESOURCE_OPTIONS = [
  { label: "Link", value: "LINK" },
  { label: "Document", value: "DOCUMENT" },
  { label: "Course", value: "COURSE" },
  { label: "Video", value: "VIDEO" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const TrainingPathForm: React.FC<Props> = ({ config, onChange }) => {
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
        <EmptyState label="No resources yet. Add your first resource." />
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
                Resource {i + 1}
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
                label="Type"
                value={r.type}
                options={RESOURCE_OPTIONS}
                onChange={(val) => updateResource(i, { type: val as ResourceType })}
              />

              {/* Title */}
              <AppInput
                label="Title"
                placeholder="Resource title"
                value={r.title}
                onChange={(e) => updateResource(i, { title: e.target.value })}
              />

              {/* URL */}
              <AppInput
                label="URL"
                placeholder="https://..."
                value={r.url}
                onChange={(e) => updateResource(i, { url: e.target.value })}
              />

              {/* Estimated time */}
              <AppInput
                label="Estimated Time (min)"
                type="number"
                placeholder="e.g. 30"
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

      <AddRowButton label="Add Resource" onClick={addResource} />
    </Box>
  );
};

export default TrainingPathForm;
