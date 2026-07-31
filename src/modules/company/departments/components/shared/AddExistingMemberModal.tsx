import React, { useState, useEffect, useCallback } from "react";
import { UserCog, Search, X, Building2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/modules/shared/ui/shadcn/dialog";
import { useMembersQuery, useUpdateRoleMutation } from "@/modules/company/employees/queries";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";

interface AddExistingMemberModalProps {
  open: boolean;
  onClose: () => void;
  departmentId: string;
  departmentName: string;
}

const AddExistingMemberModal: React.FC<AddExistingMemberModalProps> = React.memo(({
  open, onClose, departmentId, departmentName,
}) => {
  const { t } = useTranslation("dashboard");
  const m = useCallback(
    (key: string, opts?: Record<string, string>) => t(`pages.departments.members_panel.${key}`, opts),
    [t],
  );
  const { showToast } = useToast();

  const [search, setSearch]     = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => { if (open) setSearch(""); }, [open]);

  const { data: membersData, isLoading } = useMembersQuery({
    search: search || undefined, sortBy: "name", order: "asc", page: 1, limit: 50,
  });
  const members = ((membersData?.members ?? []) as ExtendedMember[]).filter(
    mem => (mem.department?._id ?? mem.departmentId) !== departmentId,
  );

  const updateRoleMutation = useUpdateRoleMutation();

  const handleAdd = useCallback(async (member: ExtendedMember) => {
    setAddingId(member._id);
    try {
      await updateRoleMutation.mutateAsync({
        membershipId: member._id, role: member.role, departmentId,
      });
      showToast({ message: m("toast_member_added"), severity: "success" });
    } finally {
      setAddingId(null);
    }
  }, [updateRoleMutation, departmentId, showToast, m]);

  const displayName = useCallback((mem: ExtendedMember) => (
    (mem.firstName && mem.lastName) ? `${mem.firstName} ${mem.lastName}` : mem.firstName || mem.lastName || mem.username
  ), []);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-md gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCog className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base">{m("add_existing_title")}</DialogTitle>
              <DialogDescription className="text-xs">
                {departmentName
                  ? m("add_existing_subtitle_named", { department: departmentName })
                  : m("add_existing_subtitle")}
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="size-8 p-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-input px-3.5 h-10">
            <Search className="size-4 shrink-0 text-muted-foreground/60" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={m("add_existing_search_placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground/60 hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground px-6">
              {search ? m("add_existing_empty_no_match") : m("add_existing_empty_all_assigned")}
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {members.map(mem => {
                const currentDept = mem.department?.name ?? mem.departmentName;
                const isAdding = addingId === mem._id;
                return (
                  <button
                    key={mem._id}
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAdd(mem)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      "hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {displayName(mem)[0]?.toUpperCase() ?? "U"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {displayName(mem)}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-medium",
                          currentDept ? "bg-muted text-muted-foreground" : "text-muted-foreground/70 italic",
                        )}
                      >
                        {currentDept && <Building2 className="size-2.5 shrink-0" />}
                        {currentDept
                          ? m("add_existing_current_department", { department: currentDept })
                          : m("add_existing_no_department")}
                      </span>
                    </span>
                    {isAdding ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <span
                        className={cn(
                          "shrink-0 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition-colors",
                          "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                        )}
                      >
                        {m("add_existing_action")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

AddExistingMemberModal.displayName = "AddExistingMemberModal";
export default AddExistingMemberModal;
