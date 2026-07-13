import * as XLSX from "xlsx";
import { adminWebinarApi } from "../api";
import type { Webinar } from "../types";

export async function exportWebinarSubmissions(w: Webinar): Promise<void> {
  // The admin dashboard is English-only — export columns follow that,
  // independent of whatever language the webinar was authored in.
  const isEn = true;
  const locale = "en-GB";

  const result = await adminWebinarApi.listSubmissions(w._id, { limit: 5000 });
  const submissions = result?.data ?? [];
  const sortedQs = w.questions.slice().sort((a, b) => a.order - b.order);
  const rows = submissions.map((s) => ({
    [isEn ? "Name" : "Nom"]: s.contact?.nom ?? "",
    Email: s.contact?.email ?? "",
    [isEn ? "Company" : "Entreprise"]: s.contact?.entreprise ?? "",
    [isEn ? "Language" : "Langue"]: s.lang ?? "",
    [isEn ? "Completed" : "Complété"]: s.completed ? (isEn ? "Yes" : "Oui") : (isEn ? "No" : "Non"),
    [isEn ? "AI Maturity" : "Maturité IA"]: s.scoring?.maturite_ia ?? "",
    [isEn ? "Pain Intensity" : "Intensité Pain"]: s.scoring?.intensite_pain ?? "",
    Tier: s.scoring?.tier ?? "",
    "ICP Fit": s.scoring?.icp_fit ?? "",
    "UTM Source": s.source?.utm_source ?? "",
    "UTM Campaign": s.source?.utm_campaign ?? "",
    Date: new Date(s.createdAt).toLocaleString(locale),
    ...Object.fromEntries(
      sortedQs.map((q) => {
        const raw = (s.answers as Record<string, unknown>)?.[q.key];
        const opt = q.options.find((o) => o.key === raw);
        const qLabel = (isEn ? q.label_en : q.label_fr) || q.label_fr || q.label_en;
        const optLabel = opt ? ((isEn ? opt.label_en : opt.label_fr) || opt.label_fr || opt.label_en) : null;
        return [qLabel.slice(0, 40), optLabel ?? (raw ?? "")];
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
