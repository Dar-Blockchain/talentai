import * as XLSX from "xlsx";
import { adminWebinarApi } from "../api";
import { formatAnswerDisplay } from "./formatAnswer";
import type { Webinar } from "../types";

// The admin dashboard is English-only — export columns follow that,
// independent of whatever language the webinar was authored in.
const LOCALE = "en-GB";

const HR_TEAM_SIZE_LABEL: Record<string, string> = {
  lt10: "Under 10", "10_50": "10 – 50", "50_200": "50 – 200", gt200: "200+",
};

const SECTOR_LABEL: Record<string, string> = {
  technology: "Technology", finance: "Finance", healthcare: "Healthcare",
  retail: "Retail", manufacturing: "Manufacturing", education: "Education",
  telecom: "Telecom", public_sector: "Public Sector", other: "Other",
};

const SOURCE_CHANNEL_LABEL: Record<string, string> = {
  linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook",
  twitter_x: "X / Twitter", google_search: "Google Search",
  referral: "Referral", newsletter: "Newsletter", other: "Other",
};

export async function exportWebinarSubmissions(w: Webinar): Promise<void> {
  const result = await adminWebinarApi.listSubmissions(w._id, { limit: 5000 });
  const submissions = result?.data ?? [];
  const sortedQs = w.questions.slice().sort((a, b) => a.order - b.order);
  const rows = submissions.map((s) => ({
    Name: s.contact?.nom ?? "",
    Email: s.contact?.email ?? "",
    Phone: s.contact?.phone ?? "",
    Company: s.contact?.entreprise ?? "",
    Position: s.contact?.position ?? "",
    Sector: s.contact?.sector ? SECTOR_LABEL[s.contact.sector] ?? s.contact.sector : "",
    "HR Team Size": s.contact?.hr_team_size ? HR_TEAM_SIZE_LABEL[s.contact.hr_team_size] ?? s.contact.hr_team_size : "",
    Segment: s.contact?.profile_type ?? "",
    Language: s.lang ?? "",
    Completed: s.completed ? "Yes" : "No",
    "Total Score": s.scoring?.total100 ?? "",
    "Maturity Level": s.scoring?.maturityLevel ?? "",
    "Adoption & Tools": s.scoring?.subScores?.adoption ?? "",
    "Governance & Compliance": s.scoring?.subScores?.governance ?? "",
    "Quality & Measurement": s.scoring?.subScores?.quality ?? "",
    "Anti-Fraud Vigilance": s.scoring?.subScores?.antifraud ?? "",
    Qualification: s.scoring?.qualification?.status ?? "",
    "Pain Signal": s.scoring?.qualification?.painSignal ? "Yes" : "No",
    "Recommend 1:1": s.scoring?.routing?.recommend1on1 ? "Yes" : "No",
    Script: s.scoring?.routing?.script ?? "",
    "Follow-up Timeframe": s.scoring?.routing?.followUpTimeframe ?? "",
    "UTM Source": s.source?.utm_source ?? "",
    "UTM Campaign": s.source?.utm_campaign ?? "",
    "Discovery Channel": s.source?.channel ? SOURCE_CHANNEL_LABEL[s.source.channel] ?? s.source.channel : "",
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
