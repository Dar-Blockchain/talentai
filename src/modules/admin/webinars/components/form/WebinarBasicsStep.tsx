import React from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import type { WebinarBasicsForm } from "../../schemas/webinarBasicsSchema";
import type { WebinarFormValues } from "../../types";
import { WebinarDatePicker, WebinarTimePicker } from "./WebinarDateTimePickers";

const inp =
  "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
const errTxt = "mt-1 text-[11px] text-red-500";
const lbl = "block text-[12px] font-semibold text-slate-600 mb-1.5";

export function WebinarBasicsStep({
  control,
  errors,
  onFieldChange,
}: {
  control: Control<WebinarBasicsForm>;
  errors: FieldErrors<WebinarBasicsForm>;
  onFieldChange: <K extends keyof WebinarFormValues>(k: K, v: WebinarFormValues[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>
          Language <span className="text-red-400">*</span>
        </label>
        <Controller
          name="lang"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={(v) => {
                field.onChange(v);
                onFieldChange("lang", v as WebinarFormValues["lang"]);
              }}
            >
              <SelectTrigger className="w-full text-[14px]">
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.lang && <p className={errTxt}>{errors.lang.message}</p>}
      </div>
      <div>
        <label className={lbl}>
          Date <span className="text-red-400">*</span>
        </label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <WebinarDatePicker
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                onFieldChange("date", v);
              }}
            />
          )}
        />
        {errors.date && <p className={errTxt}>{errors.date.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>
            From <span className="text-red-400">*</span>
          </label>
          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <WebinarTimePicker
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onFieldChange("start_time", v);
                }}
              />
            )}
          />
          {errors.start_time && <p className={errTxt}>{errors.start_time.message}</p>}
        </div>
        <div>
          <label className={lbl}>
            To <span className="text-red-400">*</span>
          </label>
          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <WebinarTimePicker
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onFieldChange("end_time", v);
                }}
              />
            )}
          />
          {errors.end_time && <p className={errTxt}>{errors.end_time.message}</p>}
        </div>
      </div>
      <div>
        <label className={lbl}>
          Join link <span className="text-red-400">*</span>{" "}
          <span className="text-slate-400 font-normal text-[11px]">
            (Zoom, Teams, Meet, or any other link)
          </span>
        </label>
        <Controller
          name="webinar_link"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className={inp}
              type="url"
              onChange={(e) => {
                field.onChange(e);
                onFieldChange("webinar_link", e.target.value);
              }}
              placeholder="https://your-meeting-link.com"
              aria-invalid={!!errors.webinar_link}
            />
          )}
        />
        {errors.webinar_link && <p className={errTxt}>{errors.webinar_link.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>
            Registrant target — min{" "}
            <span className="text-slate-400 font-normal text-[11px]">(pacing bar on the overview)</span>
          </label>
          <Controller
            name="target_min"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className={inp}
                type="number"
                min={0}
                onChange={(e) => {
                  field.onChange(e);
                  onFieldChange("target_min", Number(e.target.value));
                }}
                aria-invalid={!!errors.target_min}
              />
            )}
          />
          {errors.target_min && <p className={errTxt}>{errors.target_min.message}</p>}
        </div>
        <div>
          <label className={lbl}>Registrant target — max</label>
          <Controller
            name="target_max"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className={inp}
                type="number"
                min={0}
                onChange={(e) => {
                  field.onChange(e);
                  onFieldChange("target_max", Number(e.target.value));
                }}
                aria-invalid={!!errors.target_max}
              />
            )}
          />
          {errors.target_max && <p className={errTxt}>{errors.target_max.message}</p>}
        </div>
      </div>
    </div>
  );
}

export default WebinarBasicsStep;
