import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { UserPlus, ChevronDown, Search, Check, X, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDepartmentsQuery } from "@/modules/company/employees/queries";
import { ROLES } from "@/modules/shared/constants/employee";
import { getRoleDescription, getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { cn } from "@/lib/utils";
import { emailSchema } from "@/lib/validation/email";
import type { Department } from "@/modules/company/departments/types";
import axios from "axios";

type RoleOption = typeof ROLES[number];

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (email: string, role: string, departmentId?: string) => Promise<void>;
  defaultDepartmentId?: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = React.memo(({
  open, onClose, onSave, defaultDepartmentId,
}) => {
  const { t } = useTranslation("dashboard");
  const m = useCallback(
    (key: string, opts?: Record<string, string>) =>
      t(`pages.employees.modals.add.${key}`, opts),
    [t],
  );

  const { data: deptsRaw, isLoading: departmentsLoading } = useDepartmentsQuery();
  const departments: Department[] =
    (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as { data?: Department[] } | undefined)?.data) ?? [];

  const [email,        setEmail]        = useState("");
  const [role,         setRole]         = useState<RoleOption>(ROLES.find(r => r.value === "hr")!);
  const [departmentId, setDepartmentId] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [inviteError,  setInviteError]  = useState<string | null>(null);
  const [roleOpen,     setRoleOpen]     = useState(false);
  const [search,       setSearch]       = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole(ROLES.find(r => r.value === "hr")!);
      setDepartmentId(defaultDepartmentId ?? "");
      setSearch("");
      setRoleOpen(false);
      setInviteError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (roleOpen) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [roleOpen]);

  const isFormValid = useMemo(
    () => emailSchema.safeParse(email).success && !!role,
    [email, role],
  );

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ROLES as unknown as RoleOption[];
    return (ROLES as unknown as RoleOption[]).filter(r =>
      getRoleLabel(r.value, t).toLowerCase().includes(q) ||
      getRoleDescription(r.value, t).toLowerCase().includes(q)
    );
  }, [search, t]);

  const handleSave = useCallback(async () => {
    if (!isFormValid) return;
    setLoading(true);
    setInviteError(null);
    try {
      await onSave(email, role.value, departmentId || undefined);
      onClose();
    } catch (err) {
      const data = axios.isAxiosError<{ code?: string; message?: string }>(err) ? err.response?.data : undefined;
      const code = data?.code ?? null;
      const msg =
        code === "EMAIL_ALREADY_EXISTS" ? m("error_email_exists") :
        code === "INVITATION_PENDING"   ? m("error_invitation_pending") :
        data?.message                   ?? m("error_generic");
      setInviteError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, role, departmentId, isFormValid, onSave, onClose, m]);

  const RoleIcon = role.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading && !v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden rounded-2xl p-0"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base">{m("title")}</DialogTitle>
              <DialogDescription className="text-xs">{m("subtitle")}</DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="size-8 p-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-6">

          {/* Email */}
          <form autoComplete="off" onSubmit={e => e.preventDefault()} className="flex flex-col gap-1.5">
            <Label htmlFor="inv-email" className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
              {m("email_label")}
            </Label>
            <Input
              id="inv-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={m("email_placeholder")}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-[11px] text-muted-foreground">{m("email_helper")}</p>
          </form>

          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
              {m("department_label")}
              {!defaultDepartmentId && (
                <span className="ml-1 text-[11px] font-normal normal-case text-muted-foreground">
                  {m("optional")}
                </span>
              )}
            </Label>
            <Select
              value={departmentId || "__none__"}
              onValueChange={v => setDepartmentId(v === "__none__" ? "" : v)}
              disabled={loading || departmentsLoading || Boolean(defaultDepartmentId)}
            >
              <SelectTrigger className="w-full">
                <span className="flex items-center gap-2">
                  <Building2 className="size-4 text-muted-foreground/60" />
                  <SelectValue placeholder={m("no_department")} />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{m("no_department")}</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role — combobox */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
              {m("select_role")}
            </Label>
            <Popover open={roleOpen} onOpenChange={setRoleOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={loading}
                  className={cn(
                    "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3.5 text-sm",
                    "shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all",
                    "hover:border-primary/40",
                    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    roleOpen && "border-primary ring-2 ring-primary/20",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${role.color}18`, color: role.color }}
                    >
                      <RoleIcon size={14} />
                    </span>
                    <span className="font-semibold text-foreground">
                      {getRoleLabel(role.value, t)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      — {getRoleDescription(role.value, t)}
                    </span>
                  </span>
                  <ChevronDown className={cn(
                    "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                    roleOpen && "rotate-180 text-primary",
                  )} />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                {/* Search */}
                <div className="flex items-center gap-2 border-b px-3 py-2.5">
                  <Search className="size-4 shrink-0 text-muted-foreground/60" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={m("search_roles")}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-muted-foreground/60 hover:text-foreground">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* List */}
                <div
                  className="max-h-60 overflow-y-auto overscroll-contain p-1.5"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {filteredRoles.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      {m("no_roles_match", { term: search })}
                    </p>
                  ) : filteredRoles.map(r => {
                    const Icon = r.icon;
                    const selected = r.value === role.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r); setRoleOpen(false); }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                          "hover:bg-primary/[0.07]",
                          selected && "bg-primary/[0.07]",
                        )}
                      >
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${r.color}18`, color: r.color }}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {getRoleLabel(r.value, t)}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {getRoleDescription(r.value, t)}
                          </span>
                        </span>
                        {selected && <Check className="size-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Inline error */}
        {inviteError && (
          <div className="mx-6 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="flex items-start gap-2 text-sm font-medium text-red-700">
              <svg className="mt-px size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
              </svg>
              {inviteError}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {m("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            loading={loading}
          >
            {m("send_invitation")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

AddEmployeeModal.displayName = "AddEmployeeModal";
export default AddEmployeeModal;
