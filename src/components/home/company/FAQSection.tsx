import { useState } from "react";
import { Box, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import Head from "next/head";

const ACCENT        = "#0CDA8B";
const ACCENT_BG     = "rgba(12,218,139,0.10)";
const ACCENT_BORDER = "rgba(12,218,139,0.40)";

const FAQS = [
  {
    question: "What is TalentAI?",
    answer:
      "TalentAI is an AI-powered recruitment automation platform that replaces manual hiring processes with intelligent, customizable pipelines. The platform deploys specialized conversational AI agents — including Olga (Technical Assessment), Sinda (Soft Skills Evaluation), and Yuka (Process Coordination) — to conduct natural video interviews, score candidates across multiple dimensions, and issue blockchain-verified credentials on the Hedera network. Companies use TalentAI to reduce their average 42-day hiring cycle by up to 75%.",
  },
  {
    question: "How does AI interviewing work?",
    answer:
      "TalentAI's AI agents conduct live video interviews using natural language processing and voice synthesis that sounds genuinely human. Each agent is specialized: Olga handles technical evaluations through interactive coding discussions, Sinda assesses soft skills through behavioral conversation, and Yuka coordinates the entire pipeline. The agents adapt their questions in real time based on candidate responses, evaluate both verbal and non-verbal cues, and produce multi-dimensional assessment reports — all without human intervention.",
  },
  {
    question: "Is AI-powered hiring biased?",
    answer:
      "TalentAI is specifically designed to eliminate unconscious bias in hiring. Every candidate receives identical assessment criteria, standardized questions, and objective scoring — regardless of their name, background, or appearance. All evaluation data is immutably recorded on the Hedera blockchain, creating a transparent audit trail that ensures compliance with equal opportunity employment standards and GDPR requirements.",
  },
  {
    question: "What assessment modules are available?",
    answer:
      "TalentAI offers 8 pre-built assessment modules: Technical Skills Evaluation, Soft Skills Assessment, Cultural Fit Analysis, Language Proficiency Testing, Practical Task Assignments, Problem-Solving Challenges, Behavioral Interviews, and Reference Verification. Each module can be configured with custom pass/fail thresholds, weighted scoring, time limits, and automatic progression rules. Companies mix and match modules to create unique pipelines for different roles, departments, or seniority levels.",
  },
  {
    question: "How much does TalentAI cost?",
    answer:
      "TalentAI offers flexible pricing starting at just $8 per AI interview with zero commitment — pay only for what you use. For teams with recurring hiring needs, subscription plans start at $99/month (Starter, 15 interviews) and scale to $1,499/month (Unlimited, 700 interviews with dedicated 24/7 support and BI benchmarks). Every plan includes Interview AI with scoring and reports, AI-powered job post creation, and a customizable pipeline builder. Extra interviews beyond your plan are discounted from $8 down to $4 depending on tier. A white-label enterprise solution is also available with custom infrastructure and SLA.",
  },
  {
    question: "What is the TAI token?",
    answer:
      "The TAI token is TalentAI's native utility token built on the Hedera Hashgraph network (HTS). It powers all platform transactions, from assessment pipeline fees to blockchain credential issuance. Subscribers receive TAI tokens with their plan, and candidates earn tokens through the Interview-to-Earn model when they complete verified AI assessments. The token also enables governance rights and staking rewards within the TalentAI ecosystem.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const FAQItem: React.FC<{ faq: typeof FAQS[number]; index: number }> = ({ faq, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box
      onClick={() => setOpen((o) => !o)}
      sx={{
        borderBottom: "1px solid rgba(89,91,95,0.12)",
        py: 2.5,
        cursor: "pointer",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: { xs: "14px", md: "15px" },
            color: "#111827",
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {faq.question}
        </Typography>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: open ? ACCENT : ACCENT_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
            mt: 0.25,
          }}
        >
          {open
            ? <RemoveOutlined sx={{ fontSize: 16, color: "#0b1b1f" }} />
            : <AddOutlined sx={{ fontSize: 16, color: ACCENT }} />
          }
        </Box>
      </Box>

      {open && (
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontSize: "14px",
            color: "#4B5563",
            lineHeight: 1.75,
            mt: 1.5,
            pr: { xs: 0, md: 6 },
          }}
        >
          {faq.answer}
        </Typography>
      )}
    </Box>
  );
};

const FAQSection: React.FC = () => (
  <>
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </Head>

    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "left", mb: { xs: 4, md: 6 } }}>
        {/* Overline pill */}
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          bgcolor: ACCENT_BG, border: `1.5px solid ${ACCENT_BORDER}`,
          borderRadius: "24px", px: 2.5, py: 1, mb: 2,
        }}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: "#0CDA8B", letterSpacing: "0.6px" }}>
            FAQ
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: { xs: "26px", md: "36px" },
            lineHeight: 1.2,
            color: "#111827",
            mb: 1.5,
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontSize: "16px",
            color: "#6B7280",
            maxWidth: 550,
            lineHeight: 1.6,
            whiteSpace: "nowrap",
          }}
        >
          Everything you need to know about AI-powered hiring with TalentAI.
        </Typography>
      </Box>

      {/* FAQ list */}
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          bgcolor: "#fff",
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          px: { xs: 3, md: 5 },
          py: { xs: 1, md: 2 },
        }}
      >
        {FAQS.map((faq, i) => (
          <FAQItem key={i} faq={faq} index={i} />
        ))}
      </Box>
    </Box>
  </>
);

export default FAQSection;
