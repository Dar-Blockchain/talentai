import * as XLSX from "xlsx";
import { adminWebinarApi } from "../api";
import { formatAnswerDisplay } from "./formatAnswer";
import type { Webinar } from "../types";

// The admin dashboard is English-only — export columns follow that,
// independent of whatever language the webinar was authored in.
const LOCALE = "en-GB";

export async function exportWebinarSubmissions(w: Webinar): Promise<void> {
  const result = await adminWebinarApi.listSubmissions(w._id, { limit: 5000 });
  const submissions = result?.data ?? [];
  const sortedQs = w.questions.slice().sort((a, b) => a.order - b.order);
  const rows = submissions.map((s) => ({
    Name: s.contact?.nom ?? "",
    Email: s.contact?.email ?? "",
    Company: s.contact?.entreprise ?? "",
    Language: s.lang ?? "",
    Completed: s.completed ? "Yes" : "No",
    "AI Maturity": s.scoring?.maturite_ia ?? "",
    "Pain Intensity": s.scoring?.intensite_pain ?? "",
    Tier: s.scoring?.tier ?? "",
    "ICP Fit": s.scoring?.icp_fit ?? "",
    "UTM Source": s.source?.utm_source ?? "",
    "UTM Campaign": s.source?.utm_campaign ?? "",
    Date: new Date(s.createdAt).toLocaleString(LOCALE),
    ...Object.fromEntries(
      sortedQs.map((q) => {
        const raw = (s.answers as Record<string, unknown>)?.[q.key];
        const qLabel = q.label_en || q.label_fr;
        return [qLabel.slice(0, 40), formatAnswerDisplay(q, raw)];
      }),
    ),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Submissions");
  XLSX.writeFile(
    wb,
    `${w.title.replace(/[^a-z0-9]/gi, "_").slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
