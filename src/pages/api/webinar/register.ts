import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { nom, email, webinarId } = req.body;
  if (!nom || !email || !webinarId) {
    return res.status(400).json({ error: "nom, email and webinarId are required" });
  }

  try {
    const { data } = await axios.post(`${BACKEND}/webinar-agent/progress`, {
      webinarId,
      contact: { nom, email, entreprise: null },
      consent: false,
      lang: req.headers["accept-language"]?.startsWith("en") ? "en" : "fr",
      source: {
        utm_source:   (req.query.utm_source as string) || null,
        utm_campaign: (req.query.utm_campaign as string) || null,
      },
    });

    return res.status(200).json({ submissionId: data.submissionId });
  } catch {
    // If backend is unreachable, still let the user proceed
    return res.status(200).json({ submissionId: null });
  }
}
