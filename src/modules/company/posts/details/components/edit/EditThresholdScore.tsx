import React from "react";
import { Target as TrackChangesOutlined } from "lucide-react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Slider } from "@/modules/shared/ui/shadcn/slider";

import { TEAL } from "@/modules/company/posts/shared/constants";

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
}

const MARKS = [
  { value: 0,   label: "0%"   },
  { value: 50,  label: "50%"  },
  { value: 100, label: "100%" },
];

const EditThresholdScore = <TFieldValues extends FieldValues>({ control }: Props<TFieldValues>) => (
  <div className="mt-6">
    <div className="mb-2 flex items-center gap-2">
      <TrackChangesOutlined size={16} color={TEAL} />
      <p className="text-[16px] font-semibold text-[rgba(84,98,116,1)]">
        Threshold Score
      </p>
    </div>
    <p className="mb-4 text-[12px] text-[rgba(84,98,116,0.7)]">
      Candidates scoring below this threshold are automatically flagged for review.
    </p>

    <Controller
      name={"thresholdScore" as Path<TFieldValues>}
      control={control}
      render={({ field }) => {
        const score = field.value as number;
        const color = score >= 70 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";
        return (
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Slider
                value={[score]}
                onValueChange={(v) => field.onChange(v[0])}
                min={0}
                max={100}
                step={5}
                className="[&_[data-slot=slider-range]]:bg-[var(--threshold-color)] [&_[data-slot=slider-thumb]]:size-[18px] [&_[data-slot=slider-thumb]]:border-[var(--threshold-color)]"
                style={{ ["--threshold-color" as string]: color }}
              />
              <div className="mt-1.5 flex justify-between">
                {MARKS.map((m) => (
                  <span key={m.value} className="text-[11px] text-gray-400">{m.label}</span>
                ))}
              </div>
            </div>
            <div
              className="min-w-[52px] rounded-lg px-3 py-1.5 text-center"
              style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}
            >
              <span className="text-[16px] font-extrabold" style={{ color }}>{score}%</span>
            </div>
          </div>
        );
      }}
    />
  </div>
);

export default EditThresholdScore;
