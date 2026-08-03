import React, { useState } from "react";
import { Target as TrackChangesOutlined, Save as SaveOutlined, Check as CheckOutlined } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Slider } from "@/modules/shared/ui/shadcn/slider";
import { useUpdatePostMutation } from "@/modules/company/posts/details/queries";

import { TEAL, TEAL_BG, TEAL_BORDER } from "@/modules/company/posts/shared/constants";

interface Props {
  jobId: string;
  initial: number;
  canEdit: boolean;
  isDraft: boolean;
}

const ZONE_LABELS: [string, string, string][] = [
  ["Low", "#DC2626", "0–39%"],
  ["Medium", "#D97706", "40–69%"],
  ["High", "#16A34A", "70–100%"],
];

const ThresholdCard: React.FC<Props> = ({ jobId, initial, canEdit, isDraft }) => {
  const updateMut = useUpdatePostMutation(jobId);
  const [value, setValue] = useState<number>(initial);
  const [saved, setSaved] = useState(false);
  const dirty    = value !== initial;
  const editable = canEdit && isDraft;

  const handleSave = () => {
    updateMut.mutate({ thresholdScore: value }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  };

  const saving = updateMut.isPending;

  const color  = value >= 70 ? "#16A34A" : value >= 40 ? "#D97706" : "#DC2626";
  const label  = value >= 70 ? "High"    : value >= 40 ? "Medium"  : "Low";
  const bgGrad = value >= 70
    ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
    : value >= 40
    ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
    : "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)";

  return (
    <Card className="p-6 gap-0">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ backgroundColor: TEAL_BG, borderColor: TEAL_BORDER, color: TEAL }}>
            <TrackChangesOutlined size={17} />
          </div>
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide text-gray-700">
              Threshold Score
            </p>
            <p className="mt-[1px] text-[11px] text-gray-400">
              Minimum interview score required to pass screening
            </p>
          </div>
        </div>
        <div className="min-w-[72px] rounded-xl px-4 py-1.5 text-center" style={{ background: bgGrad, border: `1.5px solid ${color}30` }}>
          <p className="text-[22px] font-black leading-none" style={{ color }}>{value}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4 rounded-lg border px-4 py-2.5" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}>
        <p className="text-[12px] leading-[1.7]" style={{ color: "#475569" }}>
          Candidates who score <strong>below {value}%</strong> will be flagged as{" "}
          <span style={{ color: "#DC2626", fontWeight: 700 }}>Under Threshold</span>.
          {!isDraft && (
            <span className="mt-1.5 block" style={{ color: "#D97706", fontWeight: 600 }}>
              ⚠ Locked — threshold cannot be changed once candidates have applied.
            </span>
          )}
        </p>
      </div>

      {/* Zone labels */}
      <div className="mb-1 flex justify-between px-1">
        {ZONE_LABELS.map(([z, c, range]) => (
          <div key={z} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-[10px] font-semibold text-gray-500">
              {z} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>{range}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Slider */}
      <Slider
        value={[value]}
        onValueChange={(v) => { setValue(v[0]); setSaved(false); }}
        min={0} max={100} step={5}
        disabled={!editable || saving}
        className="[&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-range]]:bg-[var(--threshold-color)] [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[var(--threshold-color)]"
        style={{ ["--threshold-color" as string]: color }}
      />

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">0%</span>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            loading={saving}
            disabled={!dirty || !isDraft}
            onClick={handleSave}
            className={saved ? "border-green-600 text-green-600 hover:border-green-600 hover:bg-green-50" : undefined}
          >
            {saved ? <CheckOutlined size={13} /> : <SaveOutlined size={13} />}
            {saved ? "Saved" : "Save"}
          </Button>
        )}
        <span className="text-[11px] text-gray-400">100%</span>
      </div>
    </Card>
  );
};

export default ThresholdCard;
