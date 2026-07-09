import React from "react";
import { EditActions } from "@/modules/settings/shared/components";
import { COMPANY_SIZES } from "@/modules/settings/shared/constants";
import { Card } from "@/modules/shared/ui/shadcn/card";
import SectionHeader from "@/modules/shared/ui/SectionHeader";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import { UserProfile } from "../../shared";

interface CompanyInfoCardProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  fieldErrors: Record<string, string>;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  readOnly?: boolean;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ profile, isEditing, loading, fieldErrors, onEdit, onCancel, onSave, onInputChange, readOnly = false }) => (
  <Card className="p-6 gap-0">
    <SectionHeader
      title="Company Information"
      subtitle="Basic company details and profile settings"
      action={!readOnly ? <EditActions isEditing={isEditing} loading={loading} onEdit={onEdit} onCancel={onCancel} onSave={onSave} /> : undefined}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
          Company Name<span className="text-red-500 ml-0.5">*</span>
        </span>
        <Input
          value={profile.name || profile.companyName || ""}
          onChange={(e) => { onInputChange("name", e.target.value); onInputChange("companyName", e.target.value); }}
          disabled={!isEditing}
          aria-invalid={!!(fieldErrors.name || fieldErrors.companyName)}
        />
        {(fieldErrors.name || fieldErrors.companyName) && (
          <span className="text-[11px] text-red-500">{fieldErrors.name || fieldErrors.companyName}</span>
        )}
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">Company Email</span>
        <Input value={profile.email} disabled />
        <span className="text-[11px] text-gray-400">Email cannot be changed</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">Industry</span>
        <Input
          value={profile.industry || ""}
          onChange={(e) => onInputChange("industry", e.target.value)}
          disabled={!isEditing}
          placeholder="e.g. Technology, Finance…"
          aria-invalid={!!fieldErrors.industry}
        />
        {fieldErrors.industry && <span className="text-[11px] text-red-500">{fieldErrors.industry}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">Company Size</span>
        <Select
          value={profile.size || profile.companySize || undefined}
          onValueChange={(v) => { onInputChange("size", v); onInputChange("companySize", v); }}
          disabled={!isEditing}
        >
          <SelectTrigger className={fieldErrors.size ? "border-red-400" : undefined}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
          </SelectContent>
        </Select>
        {fieldErrors.size && <span className="text-[11px] text-red-500">{fieldErrors.size}</span>}
      </label>
    </div>
  </Card>
);

export default CompanyInfoCard;
