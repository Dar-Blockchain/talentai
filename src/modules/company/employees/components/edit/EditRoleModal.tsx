import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { X as CloseIcon, Pencil as EditOutlined, Building2 as BusinessOutlined, CheckCircle as CheckCircleIcon, ChevronDown, Search, X, Check } from "lucide-react";
import { useDepartmentsQuery } from "@/modules/company/employees/queries";
import { useTranslation } from "react-i18next";
import { ROLES } from "@/modules/shared/constants/employee";
import { getRoleDescription, getRoleLabel, roleMatchesSearch } from '@/modules/company/employees/utils/employeeRoleI18n';
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { cn } from "@/lib/utils";

const PURPLE = "#8310FF";

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: string, departmentId?: string) => Promise<void>;
  currentRole: string;
  currentDepartmentId?: string;
  memberName: string;
}

const EditRoleModal: React.FC<EditRoleModalProps> = React.memo(({
  open, onClose, onSave, currentRole, currentDepartmentId, memberName,
}) => {
  const { t } = useTranslation("dashboard");
  const m = useCallback(
    (key: string, opts?: Record<string, string>) => t(`pages.employees.modals.edit.${key}`, opts),
    [t],
  );
  const { data: deptsRaw, isLoading: departmentsLoading } = useDepartmentsQuery();
  const departments = (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as any)?.data) ?? [];

  const [role,         setRole]         = useState(currentRole);
  const [departmentId, setDepartmentId] = useState(currentDepartmentId ?? "");
  const [roleOpen,     setRoleOpen]     = useState(false);
  const [roleSearch,   setRoleSearch]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);
  const roleSearchRef = useRef<HTMLInputElement>(null);

  // Prevent setState on unmounted component from the close timeout
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setDepartmentId(currentDepartmentId ?? "");
      setRoleSearch("");
      setError(null);
      setSuccess(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRole, currentDepartmentId]);

  useEffect(() => {
    if (roleOpen) setTimeout(() => roleSearchRef.current?.focus(), 50);
    else setRoleSearch("");
  }, [roleOpen]);

  const isChanged = useMemo(
    () => role !== currentRole || departmentId !== (currentDepartmentId ?? ""),
    [role, departmentId, currentRole, currentDepartmentId],
  );

  const handleSave = useCallback(async () => {
    if (!role) { setError(m("select_role_error")); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave(role, departmentId || undefined);
      if (mountedRef.current) {
        setSuccess(true);
        setTimeout(() => { if (mountedRef.current) onClose(); }, 1200);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : m("update_failed"));
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [role, departmentId, onSave, onClose, m]);

  const handleClose      = useCallback(() => { if (!loading) onClose(); }, [loading, onClose]);
  const handleDeptChange = useCallback((e: { target: { value: string } }) => setDepartmentId(e.target.value), []);

  const handleRoleSelect = useCallback((v: string) => {
    setRole(v);
    setRoleOpen(false);
  }, []);

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    return ROLES.filter((r) => roleMatchesSearch(r.value, q, t));
  }, [roleSearch, t]);

  const selectedRole = useMemo(() => ROLES.find((r) => r.value === role), [role]);
  const SelectedRoleIcon = selectedRole?.icon;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
    <DialogContent
      showCloseButton={false}
      className="sm:max-w-sm p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col"
      style={{ borderRadius: 12, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
    >

      <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg" style={{ backgroundColor: `${PURPLE}18`, color: PURPLE }}>
            <EditOutlined size={20} />
          </div>
          <div>
            <p className="text-[1rem] font-bold leading-tight text-[#111827]">
              {m("title")}
            </p>
            <p className="mt-0.5 text-[0.775rem] text-[#9CA3AF]">
              {m("subtitle_intro")}{" "}
              <strong className="text-[#374151]">{memberName}</strong>
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          disabled={loading}
          className="rounded-md p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] disabled:pointer-events-none disabled:opacity-50"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="overflow-y-auto px-6 pt-6 pb-1">
        {error && (
          <Alert variant="destructive" className="mb-4 rounded-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 rounded-lg border-transparent bg-emerald-50 text-emerald-700 [&>svg]:text-emerald-600">
            <CheckCircleIcon />
            <AlertDescription className="text-emerald-700">{m("success")}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-5">

          {/* Role */}
          <div>
            <p className="mb-2 text-[0.8rem] font-semibold text-[#374151]">{m("role_label")}</p>
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
                  {selectedRole && SelectedRoleIcon ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${selectedRole.color}18`, color: selectedRole.color }}
                      >
                        <SelectedRoleIcon size={14} />
                      </span>
                      <span className="truncate font-semibold text-foreground">
                        {getRoleLabel(selectedRole.value, t)}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        — {getRoleDescription(selectedRole.value, t)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{m("select_role_error")}</span>
                  )}
                  <ChevronDown className={cn(
                    "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                    roleOpen && "rotate-180 text-primary",
                  )} />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-(--radix-popover-trigger-width) p-0"
              >
                {/* Search */}
                <div className="flex items-center gap-2 border-b px-3 py-2.5">
                  <Search className="size-4 shrink-0 text-muted-foreground/60" />
                  <input
                    ref={roleSearchRef}
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder={m("search_roles")}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  {roleSearch && (
                    <button onClick={() => setRoleSearch("")} className="text-muted-foreground/60 hover:text-foreground">
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
                      {m("no_roles_match", { term: roleSearch })}
                    </p>
                  ) : filteredRoles.map((r) => {
                    const Icon = r.icon;
                    const selected = r.value === role;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleRoleSelect(r.value)}
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

          {/* Department */}
          <div>
            <p className="mb-2 text-[0.8rem] font-semibold text-[#374151]">
              {m("department_label")}{" "}
              <span className="text-[0.75rem] font-normal text-[#9CA3AF]">
                {m("optional")}
              </span>
            </p>
            <div className="relative">
              <BusinessOutlined size={18} color="#9CA3AF" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={departmentId}
                onChange={(e) => handleDeptChange({ target: { value: e.target.value } })}
                disabled={loading || departmentsLoading}
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-3 text-sm text-[#111827] outline-none transition-colors hover:border-[#CBD5E1] focus:border-2 focus:border-[#8310FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" className="text-[#9CA3AF]">{m("no_department")}</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-5">
        <Button onClick={handleClose} disabled={loading} variant="ghost" className="rounded-lg px-6 font-semibold text-gray-500">
          {m("cancel")}
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || !isChanged}
          loading={loading}
          variant="secondary"
          className="rounded-lg px-6 font-bold shadow-[0_2px_8px_rgba(131,16,255,0.3)]"
        >
          {loading ? m("updating_btn") : m("save")}
        </Button>
      </div>
    </DialogContent>
    </Dialog>
  );
});

EditRoleModal.displayName = "EditRoleModal";
export default EditRoleModal;
