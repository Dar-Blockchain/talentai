import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Plus as AddIcon, Video as WebinarIcon } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { adminWebinarApi } from "../api";
import { exportWebinarSubmissions } from "../utils/exportSubmissions";
import { toFormValues } from "../utils/webinarForm";
import {
  AdminPageHeading,
  AdminQueryError,
  AdminChartCard,
  ADMIN_ACCENT,
  ConfirmDialog,
} from "@/modules/admin/shared";
import {
  useAdminWebinarsQuery,
  useCreateWebinarMutation,
  useUpdateWebinarMutation,
  useDeleteWebinarMutation,
  useVerifyWebinarMutation,
} from "../queries";
import { WebinarCard } from "./WebinarCard";
import { WebinarFormDialog } from "./WebinarFormDialog";
import type { Webinar, WebinarFormValues } from "../types";

const STATUS_FILTERS = ["", "draft", "active"] as const;
const statusFilterLabel = (s: (typeof STATUS_FILTERS)[number]) =>
  s === "" ? "All" : s === "active" ? "Published" : "Draft";

const WebinarManagement: React.FC = () => {
  const router = useRouter();
  const page = 1;
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, isError, refetch } = useAdminWebinarsQuery({
    page,
    status: statusFilter || undefined,
  });

  const createMut = useCreateWebinarMutation();
  const updateMut = useUpdateWebinarMutation();
  const deleteMut = useDeleteWebinarMutation();
  const verifyMut = useVerifyWebinarMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Webinar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [reminderTarget, setReminderTarget] = useState<Webinar | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  // Deep link from the webinar detail page's "Edit" action (?edit=<id>).
  React.useEffect(() => {
    const editId = router.query.edit as string | undefined;
    if (!editId || !data?.data) return;
    const target = data.data.find((w) => w._id === editId);
    if (target) {
      setEditTarget(target);
      setFormOpen(true);
      router.replace({ pathname: router.pathname, query: { tab: "webinars" } }, undefined, { shallow: true });
    }
  }, [router, data]);

  const handleExport = async (w: Webinar) => {
    setExportingId(w._id);
    try {
      await exportWebinarSubmissions(w);
    } catch {
      toast.error("Export failed.");
    } finally {
      setExportingId(null);
    }
  };

  const handleSave = (values: WebinarFormValues) => {
    if (createMut.isPending || updateMut.isPending) return;
    if (editTarget) {
      updateMut.mutate(
        { id: editTarget._id, values },
        {
          onSuccess: () => {
            toast.success("Webinar updated.");
            setFormOpen(false);
            setEditTarget(null);
          },
          onError: () => toast.error("Failed to update webinar."),
        },
      );
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          toast.success("Webinar created.");
          setFormOpen(false);
        },
        onError: () => toast.error("Failed to create webinar."),
      });
    }
  };

  const handleVerify = (w: Webinar) =>
    verifyMut.mutate(w._id, {
      onSuccess: () => toast.success(`"${w.title}" is now Published.`),
      onError: () => toast.error("Failed to publish webinar."),
    });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Webinar deleted.");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete.");
        setDeleteTarget(null);
      },
    });
  };

  const handleSendReminder = async () => {
    if (!reminderTarget) return;
    setSendingReminderId(reminderTarget._id);
    setReminderTarget(null);
    try {
      const result = await adminWebinarApi.sendLinkReminder(reminderTarget._id);
      toast.success(
        `Reminder sent to ${result.sent} participant${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}.`,
      );
    } catch {
      toast.error("Failed to send reminder.");
    } finally {
      setSendingReminderId(null);
    }
  };

  const webinars = data?.data ?? [];

  return (
    <div>
      <AdminPageHeading
        title="Webinar Management"
        subtitle="Create webinars, let AI build the question set, then verify to publish"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border
                ${statusFilter === s ? "bg-teal-600 border-teal-600 text-white" : "border-slate-200 text-slate-600 hover:border-teal-300 bg-white"}`}
            >
              {statusFilterLabel(s)}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold shadow-sm"
        >
          <AddIcon size={16} /> New Webinar
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner style={{ color: ADMIN_ACCENT }} />
        </div>
      ) : isError ? (
        <AdminQueryError message="Failed to load webinars." onRetry={refetch} />
      ) : webinars.length === 0 ? (
        <AdminChartCard>
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <WebinarIcon size={48} className="mb-4 opacity-40" />
            <p className="text-[15px] font-medium">No webinars yet</p>
            <p className="text-[13px] mt-1">
              Create your first webinar to get started
            </p>
          </div>
        </AdminChartCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {webinars.map((w) => (
            <WebinarCard
              key={w._id}
              w={w}
              onEdit={() => {
                setEditTarget(w);
                setFormOpen(true);
              }}
              onVerify={() => handleVerify(w)}
              verifyPending={verifyMut.isPending}
              onExport={() => handleExport(w)}
              exportPending={exportingId === w._id}
              onSendLink={() => setReminderTarget(w)}
              sendLinkPending={sendingReminderId === w._id}
              onDelete={() => setDeleteTarget(w._id)}
            />
          ))}
        </div>
      )}

      <WebinarFormDialog
        open={formOpen}
        initial={editTarget ? toFormValues(editTarget) : null}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        saving={editTarget ? updateMut.isPending : createMut.isPending}
      />

      <ConfirmDialog
        open={!!reminderTarget}
        title="Send webinar link to all participants?"
        description={`This will send the webinar join link to all completed participants of "${reminderTarget?.title}". The reminder email will be sent immediately to everyone.`}
        confirmLabel="Send now"
        loading={!!sendingReminderId}
        onConfirm={handleSendReminder}
        onCancel={() => setReminderTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete webinar?"
        description="This will permanently delete the webinar. Submissions are not affected."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default WebinarManagement;
