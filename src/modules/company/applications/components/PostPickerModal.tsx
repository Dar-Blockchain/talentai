import React, { memo, useCallback } from "react";
import { Search, Briefcase, Layers, X, Check, CalendarDays } from "lucide-react";
import LoadingState from "@/modules/shared/ui/LoadingState";
import EmptyState   from "@/modules/shared/ui/EmptyState";
import { usePostPicker } from "../hooks/usePostPicker";
import { PostPickerItem } from "../queries";
import { TEAL } from "./constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/ui/shadcn/dialog";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { cn } from "@/lib/utils";

// ─── PostRow ──────────────────────────────────────────────────────────────────

interface PostRowProps {
  id: string;
  title: string;
  selectedId: string;
  icon?: React.ReactNode;
  empType?: string;
  createdAt?: string;
  onSelect: () => void;
}

const PostRow = memo<PostRowProps>(({ id, title, selectedId, icon, empType, createdAt, onSelect }) => {
  const isActive = id === selectedId || (!id && !selectedId);
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-[10px] border transition-all duration-150 text-left",
        isActive
          ? "border-teal-500 bg-teal-50"
          : "border-transparent bg-transparent hover:bg-slate-50",
      )}
    >
      <div
        className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: isActive ? `${TEAL}18` : "#F3F4F6" }}
      >
        {icon ?? <Briefcase size={16} style={{ color: isActive ? TEAL : "#9CA3AF" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] truncate"
          style={{ fontWeight: isActive ? 700 : 500, color: isActive ? TEAL : "#111827" }}
        >
          {title}
        </div>
        {(empType || createdAt) && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {empType && <span className="text-[10px] text-slate-400">{empType}</span>}
            {empType && createdAt && <span className="text-[10px] text-slate-300">·</span>}
            {createdAt && (
              <div className="flex items-center gap-0.5">
                <CalendarDays size={10} className="text-gray-400" />
                <span className="text-[10px] text-slate-400">{createdAt}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {isActive && <Check size={16} style={{ color: TEAL }} className="shrink-0" />}
    </button>
  );
});
PostRow.displayName = "PostRow";

// ─── PostPickerModal ──────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  selectedId: string;
  onSelect: (id: string, title: string) => void;
  onClose: () => void;
}

const PostPickerModal = memo<Props>(({ open, selectedId, onSelect, onClose }) => {
  const { searchInput, setSearchInput, page, setPage, posts, totalPages, isLoading } = usePostPicker(open);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value),
    [setSearchInput],
  );
  const handleClearSearch = useCallback(() => setSearchInput(""), [setSearchInput]);
  const handleSelectAll   = useCallback(() => onSelect("", ""), [onSelect]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-xs w-full rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.14)] p-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${TEAL}12` }}>
              <Briefcase size={16} style={{ color: TEAL }} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-slate-900 leading-snug">Filter by Job</div>
              <div className="text-[11px] text-slate-400">Select a job to filter applications</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {/* Search */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 h-9 mb-3 transition-colors focus-within:border-teal-500">
            <Search size={15} className="text-gray-400" />
            <input
              className="bg-transparent ml-2 text-[13px] flex-1 outline-none placeholder:text-slate-400"
              placeholder="Search jobs…"
              value={searchInput}
              onChange={handleSearchChange}
              autoFocus
            />
            {searchInput && (
              <button onClick={handleClearSearch} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* All jobs option */}
          <PostRow
            id="" title="All Jobs" selectedId={selectedId}
            icon={<Layers size={16} style={{ color: !selectedId ? TEAL : "#9CA3AF" }} />}
            onSelect={handleSelectAll}
          />

          <div className="border-t border-slate-100 mb-2" />

          {isLoading ? (
            <LoadingState message="" color={TEAL} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={36} />}
              title={searchInput ? "No matches" : "No jobs posted yet"}
              minHeight={120}
            />
          ) : (
            <div className="flex flex-col gap-0.5">
              {(posts as PostPickerItem[]).map((p) => {
                const id        = p._id ?? p.id ?? "";
                const title     = p.jobDetails?.title ?? p.title ?? "Untitled";
                const empType   = p.jobDetails?.employmentType ?? "";
                const createdAt = p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : undefined;
                return (
                  <PostRow
                    key={id} id={id} title={title} empType={empType}
                    createdAt={createdAt} selectedId={selectedId}
                    onSelect={() => onSelect(id, title)}
                  />
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size="sm" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
PostPickerModal.displayName = "PostPickerModal";

export default PostPickerModal;
