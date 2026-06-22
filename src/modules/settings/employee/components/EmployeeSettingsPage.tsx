import React from "react";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { User, Mail, Building2, Briefcase, GitBranch, Camera, Check } from "lucide-react";
import { ROLE_LABELS, ROLE_STYLES } from "@/modules/company/employees/components/list";
import { Spinner } from "@/modules/settings/shared/components";
import { Section, InfoRow, TEAL, useEmployeeSettings } from "@/modules/settings/employee";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";

const EmployeeSettingsPage: React.FC = () => {
  const {
    user, companyMembership, fileRef,
    displayName, avatarUrl, initials,
    username, savingName, nameSaved, nameError, uploadingImg,
    setUsername, setNameError,
    handleSaveName, handleAvatarChange,
  } = useEmployeeSettings();

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Settings" },
        ]}
        icon={SettingsOutlined}
      />

      <div className="max-w-[720px]">

        <Section title="Profile Picture" subtitle="Update your display photo">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="w-20 h-20 rounded-[20px]">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} className="object-cover" />
                <AvatarFallback className="rounded-[20px] bg-teal-600 text-white font-bold text-[1.6rem]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                onClick={() => fileRef.current?.click()}
                className="group absolute inset-0 rounded-[20px] bg-black/45 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
              >
                {uploadingImg
                  ? <Spinner size={20} className="border-white/40 border-t-white" />
                  : <Camera size={22} className="text-white" />
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div>
              <p className="font-poppins font-semibold text-[0.9rem] text-gray-900 mb-1">
                {displayName || "Employee"}
              </p>
              <p className="font-poppins text-[0.8rem] text-gray-400 mb-3">
                JPG, PNG or GIF · Max 5 MB
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImg}
                className="font-poppins font-semibold text-[0.8rem] rounded-[10px] border border-gray-200 text-gray-700 px-3 py-1.5 hover:border-teal-600 hover:text-teal-600 hover:bg-teal-50/40 disabled:opacity-60 transition-colors"
              >
                {uploadingImg ? "Uploading…" : "Change photo"}
              </button>
            </div>
          </div>
        </Section>

        <Section title="Display Name" subtitle="This is how your name appears across the platform">
          <div className="flex gap-3 items-start">
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="font-poppins text-sm text-gray-500">Username</span>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setNameError(""); }}
                  className={`font-poppins w-full rounded-xl border bg-gray-50 pl-10 pr-3 py-3.5 text-sm outline-none transition-colors focus:bg-white ${
                    nameError ? "border-red-400" : "border-gray-200 focus:border-teal-600"
                  }`}
                />
              </div>
              {nameError && <span className="text-xs text-red-500">{nameError}</span>}
            </label>
            <button
              type="button"
              onClick={handleSaveName}
              disabled={savingName || username === user?.username}
              className="font-poppins font-bold text-white rounded-xl h-14 px-6 whitespace-nowrap flex-shrink-0 mt-[1px] flex items-center justify-center gap-2 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
              style={!(savingName || username === user?.username) ? { backgroundColor: nameSaved ? "#059669" : TEAL } : undefined}
            >
              {savingName ? (
                <Spinner size={14} className="border-white/40 border-t-white" />
              ) : nameSaved ? (
                <Check size={16} />
              ) : null}
              {savingName ? "Saving…" : nameSaved ? "Saved" : "Save"}
            </button>
          </div>
        </Section>

        <Section title="Account Information" subtitle="Read-only information about your account">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-poppins text-sm text-gray-500">Email address</span>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={user?.email || ""}
                  disabled
                  className="font-poppins w-full rounded-xl border border-gray-200 bg-gray-100 pl-10 pr-3 py-3.5 text-sm text-gray-500"
                />
              </div>
            </label>

            {companyMembership && (
              <>
                <hr className="border-gray-100" />

                <InfoRow
                  icon={<Building2 size={18} className="text-teal-600" />}
                  iconBg="#F0FDF9"
                  iconBorder="#CCFBF1"
                  label="Organization"
                  value={
                    companyMembership?.company?.profile?.companyDetails?.name ||
                    companyMembership?.company?.username ||
                    companyMembership?.companyId?.name ||
                    "Company"
                  }
                />

                {companyMembership?.role && (() => {
                  const roleKey   = companyMembership.role as string;
                  const formatRole = (r: string) =>
                    r.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (c) => c.toUpperCase());
                  const roleLabel = ROLE_LABELS[roleKey] ?? formatRole(roleKey);
                  const roleStyle = ROLE_STYLES[roleKey] ?? { color: "#6B7280", bg: "#F3F4F6" };
                  return (
                    <InfoRow
                      icon={<Briefcase size={18} style={{ color: roleStyle.color }} />}
                      iconBg={roleStyle.bg}
                      iconBorder={roleStyle.color + "33"}
                      label="Role"
                      value={roleLabel}
                      chip={
                        <span
                          className="font-poppins font-semibold text-[0.72rem] rounded-full px-2.5 py-1"
                          style={{ backgroundColor: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.color}33` }}
                        >
                          {roleLabel}
                        </span>
                      }
                    />
                  );
                })()}

                {companyMembership?.department?.name && (
                  <InfoRow
                    icon={<GitBranch size={18} className="text-violet-600" />}
                    iconBg="#F5F3FF"
                    iconBorder="#DDD6FE"
                    label="Department"
                    value={companyMembership.department.name}
                  />
                )}
              </>
            )}
          </div>
        </Section>

      </div>
    </>
  );
};

export default EmployeeSettingsPage;
