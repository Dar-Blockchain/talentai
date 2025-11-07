import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  type: "candidate" | "company";
}

const FAQSection: React.FC<FAQSectionProps> = ({ type }) => {
  const [expanded, setExpanded] = useState<number | false>(0);

  const handleChange =
    (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // ---- Candidate FAQs ----
  const candidateFaqs: FAQItem[] = [
    {
      id: 0,
      question: "How does TalentAI match me with the right job opportunities?",
      answer:
        "TalentAI uses advanced AI algorithms to evaluate your skills, interview performance, and professional background. Our system analyzes your responses, technical abilities, and career preferences to recommend the most suitable job opportunities that align with your expertise and career goals.",
    },
    {
      id: 1,
      question: "Is TalentAI free to use for job seekers?",
      answer:
        "Yes. Creating a TalentAI account, building your profile, and applying for jobs are all completely free for candidates.",
    },
    {
      id: 2,
      question: "Can I apply to multiple jobs at once?",
      answer:
        "Absolutely. Once your profile is verified and your skills are matched, you can apply to several opportunities instantly through our smart application dashboard.",
    },
    {
      id: 3,
      question: "Is my data secure with TalentAI?",
      answer:
        "Your privacy is our top priority. All user data is encrypted, and TalentAI fully complies with international data protection regulations (GDPR).",
    },
  ];

  // ---- Company FAQs ----
  const companyFaqs: FAQItem[] = [
    {
      id: 0,
      question: "How can TalentAI help my company hire faster?",
      answer:
        "TalentAI automates the candidate screening and shortlisting process using AI-driven assessments. It instantly matches your open roles with top candidates, reducing hiring time by up to 70%.",
    },
    {
      id: 1,
      question: "Can I customize skill assessments for my roles?",
      answer:
        "Yes. You can create custom AI-powered assessments or select from our predefined tests based on the job category and required skill set.",
    },
    {
      id: 2,
      question: "How does TalentAI ensure candidate quality?",
      answer:
        "Candidates undergo multi-stage evaluations that include AI interviews, skill testing, and blockchain-verified credentials — ensuring you only receive top-quality profiles.",
    },
    {
      id: 3,
      question: "Is TalentAI suitable for startups?",
      answer:
        "Definitely. Our platform is designed for all company sizes, from early-stage startups to large enterprises, offering scalable pricing and smart automation tools.",
    },
  ];

  const faqs = type === "company" ? companyFaqs : candidateFaqs;

  return (
    <Box
      id="faq"
      sx={{
        pb: 6,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Section Title */}
        <Typography
          variant="h3"
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "28px", md: "48px" },
            textAlign: "center",
            mb: 6,
            color: "#1a1a1a",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          FAQ
        </Typography>

        {/* FAQ Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleChange(faq.id)}
                sx={{
                  boxShadow: "none",
                  "&:before": { display: "none" },
                  "&:not(:last-child)": {
                    borderBottom: "1px solid #e0e0e0",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor:
                          expanded === faq.id ? "#1a1a1a" : "#f5f5f5",
                        color: expanded === faq.id ? "#ffffff" : "#1a1a1a",
                        "&:hover": {
                          backgroundColor:
                            expanded === faq.id ? "#333333" : "#e0e0e0",
                        },
                      }}
                    >
                      {expanded === faq.id ? (
                        <CloseIcon sx={{ fontSize: "16px" }} />
                      ) : (
                        <AddIcon sx={{ fontSize: "16px" }} />
                      )}
                    </Box>
                  }
                  sx={{
                    px: 4,
                    py: 3,
                    minHeight: "auto",
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                      alignItems: "center",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <Typography
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#999999",
                        mr: 3,
                        minWidth: "40px",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        flex: 1,
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    px: 4,
                    pb: 3,
                    pt: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      lineHeight: 1.6,
                      color: "#666666",
                      ml: 7,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default FAQSection;
