import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Upload as UploadIcon, Send as SendIcon, X as CloseIcon } from "lucide-react";
import { adminWebinarApi } from "../api";

const EMAIL_RE = /[^\s,;<>()[\]"]+@[^\s,;<>()[\]"]+\.[^\s,;<>()[\]"]+/g;

/** Splits pasted text on commas/semicolons/whitespace and keeps only
 * email-shaped tokens — tolerant of "Name <email>" / CSV-ish paste too. */
function extractEmails(text: string): string[] {
  return text.match(EMAIL_RE) ?? [];
}

async function extractEmailsFromFile(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const emails: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const rows: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    for (const row of rows) {
      for (const cell of row) {
        emails.push(...extractEmails(String(cell ?? "")));
      }
    }
  }
  return emails;
}

export function WebinarInviteDialog({
  webinarId,
  webinarTitle,
  open,
  onClose,
}: {
  webinarId: string | null;
  webinarTitle?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [emailsText, setEmailsText] = useState("");
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);

  const emails = Array.from(new Set(extractEmails(emailsText).map((e) => e.toLowerCase())));

  const handleClose = () => {
    if (sending) return;
    setEmailsText("");
    onClose();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    try {
      const found = await extractEmailsFromFile(file);
      if (found.length === 0) {
        toast.error("No email addresses found in that file.");
        return;
      }
      setEmailsText((prev) => (prev.trim() ? `${prev.trim()}\n${found.join("\n")}` : found.join("\n")));
      toast.success(`Added ${found.length} email${found.length !== 1 ? "s" : ""} from the file.`);
    } catch {
      toast.error("Couldn't read that file. Try a CSV or Excel export.");
    } finally {
      setImporting(false);
    }
  };

  const handleSend = async () => {
    if (!webinarId || emails.length === 0) return;
    setSending(true);
    try {
      const result = await adminWebinarApi.invite(webinarId, emails);
      toast.success(
        `Invitations sent to ${result.sent} address${result.sent !== 1 ? "es" : ""}${result.failed ? ` (${result.failed} failed)` : ""}.`,
      );
      setEmailsText("");
      onClose();
    } catch {
      toast.error("Failed to send invitations.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg p-0 gap-0 flex flex-col max-h-[85vh] overflow-hidden"
        style={{ borderRadius: "20px" }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <DialogTitle asChild>
              <h2 className="text-[17px] font-black text-slate-900">Invite people</h2>
            </DialogTitle>
            {webinarTitle && (
              <p className="text-[12px] text-slate-400 mt-0.5">to "{webinarTitle}"</p>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="p-1.5 h-auto rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <CloseIcon size={18} />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Email addresses
            </label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white"
              rows={6}
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder={"jane@company.com\njohn@company.com, alex@company.com"}
              style={{ resize: "vertical" }}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Paste any number of addresses — separated by commas, spaces, or new lines.
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-[13px] font-semibold text-slate-500 hover:border-teal-300 hover:text-teal-600 cursor-pointer transition-colors">
            {importing ? <Spinner className="size-4" /> : <UploadIcon size={16} />}
            {importing ? "Reading file…" : "Upload a CSV or Excel file"}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              disabled={importing}
              onChange={(e) => {
                void handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>

          {emails.length > 0 && (
            <p className="text-[12px] text-slate-500">
              <span className="font-bold text-teal-600">{emails.length}</span> valid address
              {emails.length !== 1 ? "es" : ""} ready to send.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl text-[13px] font-semibold text-slate-500"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleSend}
            disabled={sending || emails.length === 0}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 hover:text-white text-white text-[13px] font-bold"
          >
            {sending ? <Spinner className="size-3.5 text-white" /> : <SendIcon size={14} />}
            Send {emails.length > 0 ? `${emails.length} ` : ""}invitation{emails.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WebinarInviteDialog;
