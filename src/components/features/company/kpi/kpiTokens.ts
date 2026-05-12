export const T      = "#0D9488";
export const T_DARK = "#0A7B6E";
export const T_BG   = "#F0FDFA";
export const T_BRD  = "#CCFBF1";
export const NAVY   = "#0F172A";
export const NAVY2  = "#1E293B";
export const GRAY   = "#64748B";
export const GRAY2  = "#94A3B8";
export const LGRAY  = "#F8FAFC";
export const BORDER = "#E2E8F0";
export const WHITE  = "#FFFFFF";

export const ChartTooltip = {
  contentStyle: {
    fontFamily: "Poppins",
    fontSize: 12,
    borderRadius: 10,
    border: `1px solid ${BORDER}`,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
};

export const FUNNEL_DATA = [
  { key: "funnel_invited",     value: 240, prev: 210 },
  { key: "funnel_started",     value: 186, prev: 170 },
  { key: "funnel_completed",   value: 152, prev: 130 },
  { key: "funnel_shortlisted", value: 64,  prev: 58  },
  { key: "funnel_hired",       value: 18,  prev: 14  },
];

export const POSTS_DATA = [
  { title: "React Engineer",  shortlisted: 12, velocity: 8,  coverage: 1.2,  deadline: 30 },
  { title: "Product Manager", shortlisted: 5,  velocity: 21, coverage: 0.55, deadline: 10 },
  { title: "Data Scientist",  shortlisted: 8,  velocity: 14, coverage: 0.8,  deadline: 18 },
  { title: "DevOps Engineer", shortlisted: 3,  velocity: 35, coverage: 0.4,  deadline: 6  },
  { title: "UX Designer",     shortlisted: 9,  velocity: 11, coverage: 0.95, deadline: 22 },
];

export const VELOCITY_TREND = [
  { period: "Déc", tts: 6.2, tth: 28 },
  { period: "Jan", tts: 5.8, tth: 26 },
  { period: "Fév", tts: 5.1, tth: 24 },
  { period: "Mar", tts: 4.8, tth: 23 },
  { period: "Avr", tts: 4.5, tth: 21 },
  { period: "Mai", tts: 4.1, tth: 20 },
];

export const SOURCING_CHANNELS = [
  { channel: "Referral",   score: 84, color: "#0D9488" },
  { channel: "LinkedIn",   score: 78, color: "#0891B2" },
  { channel: "Indeed",     score: 71, color: "#7C3AED" },
  { channel: "Direct",     score: 69, color: "#D97706" },
  { channel: "Job boards", score: 65, color: "#DC2626" },
];

export const TOP_CANDIDATES = [
  { name: "Alice Martin",  score: 94, status: "shortlisted", post: "React Engineer"  },
  { name: "Omar Benali",   score: 91, status: "completed",   post: "Data Scientist"  },
  { name: "Sofia Leclerc", score: 89, status: "shortlisted", post: "Product Manager" },
  { name: "Youssef Hamdi", score: 88, status: "shortlisted", post: "DevOps Engineer" },
  { name: "Claire Dupont", score: 86, status: "completed",   post: "UX Designer"     },
  { name: "Karim Tazi",    score: 85, status: "shortlisted", post: "React Engineer"  },
  { name: "Nina Müller",   score: 83, status: "completed",   post: "Data Scientist"  },
  { name: "Lena Schmidt",  score: 82, status: "shortlisted", post: "Product Manager" },
  { name: "Rami Hassan",   score: 80, status: "completed",   post: "DevOps Engineer" },
  { name: "Julie Bernard", score: 79, status: "shortlisted", post: "UX Designer"     },
];

export const REPORTING_DATA = [
  { month: "Déc", tth: 28, baseline: 35 },
  { month: "Jan", tth: 26, baseline: 35 },
  { month: "Fév", tth: 24, baseline: 35 },
  { month: "Mar", tth: 23, baseline: 35 },
  { month: "Avr", tth: 21, baseline: 35 },
  { month: "Mai", tth: 20, baseline: 35 },
];

export const coverageColor = (c: number, d: number) => {
  if (c < 0.7 || d < 14) return "#EF4444";
  if (c < 1.0) return "#F59E0B";
  return "#10B981";
};

export const coverageLabel = (c: number, d: number) => {
  if (c < 0.7 || d < 14) return "alerte";
  if (c < 1.0) return "moyen";
  return "ok";
};

export const passRate = (a: number, b: number) =>
  b === 0 ? "—" : `${Math.round((a / b) * 100)}%`;
