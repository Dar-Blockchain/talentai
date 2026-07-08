import React, { useEffect, useState } from "react";
import { TrendingUp as TrendingUpIcon } from "lucide-react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { useUpdatePostMutation } from "@/modules/company/posts/details/queries";
import { useToast } from "@/hooks/useToast";
import { validateEditPost } from "@/validations/postValidation";
import SalaryRange from "@/modules/company/posts/create/components/SalaryRange";
import SkillEditorModal from "@/modules/company/posts/create/components/SkillEditorModal";
import { contractTypes, experienceLevels, workModes } from "@/modules/company/posts/shared/constants";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { DatePicker } from "@/modules/shared/ui/DatePicker";
import EditSkillsSection from "./edit/EditSkillsSection";
import EditThresholdScore from "./edit/EditThresholdScore";

// ── Styles ────────────────────────────────────────────────────────────────────

const selectBoxClass =
  "flex h-10 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-[12px] font-medium shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50";

const selectClass = "flex-1 appearance-none bg-transparent text-[12px] font-medium outline-none";

const labelClass = "leading-[42px] text-[12px] font-medium text-[rgba(84,98,116,0.53)]";

const sectionTitleClass = "text-[20px] font-semibold text-[rgba(84,98,116,1)]";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getInitialValues = (job: any) => ({
  jobDetails: {
    title:           job?.jobDetails?.title           || "",
    workMode:        job?.jobDetails?.workMode        || "",
    employmentType:  job?.jobDetails?.employmentType  || "",
    experienceLevel: job?.jobDetails?.experienceLevel || "",
    description:     job?.jobDetails?.description     || "",
    requirements:    job?.jobDetails?.requirements    || [],
    responsibilities: job?.jobDetails?.responsibilities || [],
    salary:          job?.jobDetails?.salary          || { min: 0, max: 0, currency: "USD" },
  },
  skillAnalysis:  job?.skillAnalysis  || {},
  expirationDate: job?.expirationDate || "",
  thresholdScore: job?.thresholdScore ?? 50,
});

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  job: any;
  onCancel: () => void;
  onSaveSuccess?: () => void;
}

const EditPostDetails: React.FC<Props> = ({ job, onCancel, onSaveSuccess }) => {
  const { showToast } = useToast();
  const updateMut     = useUpdatePostMutation(job?._id ?? "");

  // Skill editor modal state
  const [open,          setOpen]          = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedType,  setSelectedType]  = useState<"soft" | "hard">("hard");

  const { register, handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: getInitialValues(job),
  });

  useEffect(() => { if (job) reset(getInitialValues(job)); }, [job, reset]);

  const salary:         any   = watch("jobDetails.salary");
  const requiredSkills: any[] = watch("skillAnalysis.requiredSkills") || [];
  const softSkills:     any[] = watch("skillAnalysis.softSkills")     || [];

  // ── Skill handlers ───────────────────────────────────────────────────────────

  const handleAdd = (type: "hard" | "soft") => {
    setSelectedIndex(null); setSelectedType(type); setOpen(true);
  };

  const handleEdit = (index: number, type: "hard" | "soft") => {
    setSelectedIndex(index); setSelectedType(type); setOpen(true);
  };

  const handleDelete = (index: number, type: "hard" | "soft") => {
    const field   = type === "hard" ? "skillAnalysis.requiredSkills" : "skillAnalysis.softSkills";
    const updated = [...(type === "hard" ? requiredSkills : softSkills)];
    updated.splice(index, 1);
    setValue(field as any, updated);
  };

  const handleSaveSkill = (skill: any) => {
    const field   = selectedType === "hard" ? "skillAnalysis.requiredSkills" : "skillAnalysis.softSkills";
    const updated = [...(selectedType === "hard" ? requiredSkills : softSkills)];
    if (selectedIndex === null) updated.push(skill);
    else updated[selectedIndex] = skill;
    setValue(field as any, updated);
    setOpen(false);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = async (values: any) => {
    if (!validateEditPost(values, showToast, job?.creationType)) return;
    try {
      await updateMut.mutateAsync({
        jobDetails:     values.jobDetails,
        skillAnalysis:  values.skillAnalysis,
        expirationDate: values.expirationDate || undefined,
        thresholdScore: values.thresholdScore,
      });
      reset();
      onCancel();
      showToast({ message: "Post details updated successfully", severity: "success" });
      onSaveSuccess?.();
    } catch (err: any) {
      showToast({ message: err?.message ?? "Failed to update post. Please try again.", severity: "error" });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">

      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <div
          className="flex h-[45px] w-[45px] items-center justify-center rounded-[5px]"
          style={{ background: "rgba(13,148,136,0.1)" }}
        >
          <Image src="/icons/edit.svg" alt="edit" width={25} height={25} />
        </div>
        <div>
          <p className="text-[20px] font-semibold text-[#0D9488]">Edit Job Post</p>
          <p className="text-[12px] text-[#546274]">Update the job details for this position</p>
        </div>
      </div>

      {/* ── Job Details Section ── */}
      <div className="mt-2">
        <p className={sectionTitleClass}>Job Details</p>

        {/* Title + Expiration */}
        <div className="flex gap-4">
          <div className="flex-1">
            <p className={labelClass}>Job Title</p>
            <Input className="h-10 text-[12px] font-medium" {...register("jobDetails.title")} />
          </div>
          <div className="flex-1">
            <p className={labelClass}>Expiration Date</p>
            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const maxDate = job?.expirationDate ? new Date(job.expirationDate) : undefined;
                return (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select date"
                    minDate={today}
                    maxDate={maxDate}
                    className="text-[12px] font-medium"
                  />
                );
              }}
            />
          </div>
        </div>

        {/* Work Mode */}
        <div className="flex-1">
          <p className={labelClass}>Work Mode</p>
          <Controller
            name="jobDetails.workMode"
            control={control}
            render={({ field }) => (
              <div className={selectBoxClass}>
                <Image src="/icons/building3.svg" alt="work mode" width={16} height={16} />
                <select {...field} className={selectClass}>
                  <option disabled value="">Work Mode</option>
                  {workModes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          />
        </div>

        {/* Employment Type + Experience Level */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <p className={labelClass}>Employment Type</p>
            <Controller
              name="jobDetails.employmentType"
              control={control}
              render={({ field }) => (
                <div className={selectBoxClass}>
                  <Image src="/icons/bag.svg" alt="employment" width={16} height={16} />
                  <select {...field} className={selectClass}>
                    <option disabled value="">Employment Type</option>
                    {contractTypes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            />
          </div>
          <div className="flex-1">
            <p className={labelClass}>Experience Level</p>
            <Controller
              name="jobDetails.experienceLevel"
              control={control}
              render={({ field }) => (
                <div className={selectBoxClass}>
                  <TrendingUpIcon size={16} color="rgba(98,111,134,1)" />
                  <select {...field} className={selectClass}>
                    <option disabled value="">Experience Level</option>
                    {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              )}
            />
          </div>
        </div>

        <SalaryRange
          salaryRange={salary}
          onSalaryChange={(field, value) => setValue(`jobDetails.salary.${field}` as any, value)}
          employmentType={watch("jobDetails.employmentType")}
        />

        {/* Skills (AI posts only) */}
        {job?.creationType === "ai" && (
          <div className="mt-4">
            <EditSkillsSection
              requiredSkills={requiredSkills}
              softSkills={softSkills}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <p className={sectionTitleClass}>Description</p>
          <Textarea
            placeholder="Job Description"
            rows={4}
            className="mt-4 text-[12px] font-medium"
            {...register("jobDetails.description")}
          />
        </div>

        {/* Requirements */}
        <div className="mt-4">
          <p className={sectionTitleClass}>Requirements</p>
          <Controller
            name="jobDetails.requirements"
            control={control}
            render={({ field }) => (
              <Textarea
                value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                onChange={(e) => field.onChange(e.target.value.split("\n"))}
                placeholder="Job Requirements"
                rows={4}
                className="mt-4 text-[12px] font-medium"
              />
            )}
          />
        </div>

        {/* Responsibilities */}
        <div className="mt-4">
          <p className={sectionTitleClass}>Responsibilities</p>
          <Controller
            name="jobDetails.responsibilities"
            control={control}
            render={({ field }) => (
              <Textarea
                value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                onChange={(e) => field.onChange(e.target.value.split("\n"))}
                placeholder="Job Responsibilities"
                rows={4}
                className="mt-4 text-[12px] font-medium"
              />
            )}
          />
        </div>
      </div>

      {/* Threshold Score */}
      <EditThresholdScore control={control} />

      {/* Skill Editor Modal */}
      {open && (
        <SkillEditorModal
          open={open}
          mode={selectedIndex === null ? "add" : "edit"}
          skillType={selectedType}
          index={selectedIndex}
          skill={selectedIndex !== null
            ? (selectedType === "hard" ? requiredSkills[selectedIndex] : softSkills[selectedIndex])
            : null}
          onSave={handleSaveSkill}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-end gap-2 border-t border-[#E5E7EB] pt-6">
        <Button
          variant="ghost"
          onClick={() => { reset(getInitialValues(job)); onCancel(); }}
          className="text-[rgba(133,169,227,1)] hover:bg-transparent hover:text-[rgba(133,169,227,0.8)]"
        >
          Cancel
        </Button>
        <Button variant="default" type="submit" className="h-[42px] w-[120px] rounded-[38px]">
          Save
        </Button>
      </div>
    </form>
  );
};

export default EditPostDetails;

// ── Re-export SkillChip for backward compat (used by other files) ─────────────
export { default as SkillChip } from "./edit/EditSkillChip";
