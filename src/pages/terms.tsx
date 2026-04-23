import Head from "next/head";
import { Box, Container, Typography, Divider, Link, Chip } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const LAST_UPDATED = "April 1, 2026";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 4.5 }}>
    <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", mb: 1.5, fontFamily: "Poppins" }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const Sub: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#374151", mb: 1, fontFamily: "Poppins" }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: "0.93rem", color: "#374151", lineHeight: 1.85, mb: 1.5, fontFamily: "Poppins" }}>
    {children}
  </Typography>
);

const Li: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography component="li" sx={{ fontSize: "0.93rem", color: "#374151", lineHeight: 1.85, mb: 0.75, fontFamily: "Poppins", ml: 2.5 }}>
    {children}
  </Typography>
);

const InfoBox: React.FC<{ children: React.ReactNode; color?: "blue" | "amber" }> = ({ children, color = "blue" }) => {
  const isAmber = color === "amber";
  return (
    <Box sx={{
      bgcolor: isAmber ? "#FFFBEB" : "#EFF6FF",
      border: `1px solid ${isAmber ? "#FDE68A" : "#BFDBFE"}`,
      borderRadius: "10px",
      p: "14px 18px",
      mb: 2,
      display: "flex",
      gap: 1.5,
      alignItems: "flex-start",
    }}>
      {isAmber
        ? <WarningAmberRoundedIcon sx={{ fontSize: 18, color: "#D97706", mt: "2px", flexShrink: 0 }} />
        : <InfoOutlinedIcon sx={{ fontSize: 18, color: "#2563EB", mt: "2px", flexShrink: 0 }} />
      }
      <Typography sx={{ fontSize: "0.88rem", color: isAmber ? "#92400E" : "#1E40AF", lineHeight: 1.75, fontFamily: "Poppins" }}>
        {children}
      </Typography>
    </Box>
  );
};

export default function TermsOfUse() {
  return (
    <>
      <Head>
        <title>Terms of Use — TalentAI</title>
        <meta name="description" content="Read TalentAI's Terms of Use including EU AI Act compliance disclosures. Understand your rights when using our AI-powered recruitment platform." />
        <link rel="canonical" href="https://app.talentai.bid/terms" />
      </Head>

      {/* Header */}
      <Box sx={{ bgcolor: "#111827", py: 2.5, px: 3 }}>
        <Box sx={{ maxWidth: 860, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <NextLink href="/home/company" style={{ textDecoration: "none" }}>
            <Image src="/images/home/TalentAiLogo.png" alt="TalentAI" width={110} height={28} style={{ objectFit: "contain" }} />
          </NextLink>
          <NextLink href="/home/company" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: "13px", fontFamily: "Poppins" }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to home
          </NextLink>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 } }}>

            {/* Title */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 1 }}>
              <Typography sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 800, color: "#111827", fontFamily: "Poppins", lineHeight: 1.2 }}>
                Terms of Use
              </Typography>
              <Chip
                label="EU AI Act Compliant"
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 700, fontSize: "11px", fontFamily: "Poppins", mt: 0.5 }}
              />
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#9CA3AF", mb: 1, fontFamily: "Poppins" }}>
              Last updated: {LAST_UPDATED}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <InfoBox>
              <strong>EU AI Act Notice — Regulation (EU) 2024/1689:</strong> TalentAI operates a system classified as a{" "}
              <strong>high-risk AI system</strong> under Annex III, point 4 of the EU AI Act, as it is used in the
              recruitment and evaluation of candidates. As a user, you benefit from specific rights detailed in these Terms.
            </InfoBox>

            <P>
              Welcome to TalentAI. By accessing or using our platform at{" "}
              <Link href="https://app.talentai.bid" sx={{ color: "#0D9488" }}>app.talentai.bid</Link>,
              you agree to be bound by these Terms of Use. Please read them carefully before using the service.
            </P>

            <Section title="1. Acceptance of Terms">
              <P>
                By creating an account, accessing, or using TalentAI in any way, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please do not use the platform.
              </P>
              <P>
                These Terms apply to all users of the platform, including companies (employers), candidates, team members, and visitors.
              </P>
            </Section>

            <Section title="2. Description of Service">
              <P>
                TalentAI is an AI-powered recruitment platform that helps companies automate hiring workflows. Our services include:
              </P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>AI-conducted video interviews that guide candidates through role-specific questions</Li>
                <Li>Automated candidate scoring and evaluation based on interview performance</Li>
                <Li>Blockchain-verified interview credentials issued to candidates</Li>
                <Li>Recruitment campaign management and team collaboration tools</Li>
                <Li>CV analysis, job post generation, and matching engine</Li>
              </Box>
              <InfoBox color="amber">
                TalentAI is a decision-support tool. <strong>All final hiring decisions remain the sole responsibility of the employer.</strong> No recruitment decision may be based exclusively on AI-generated results.
              </InfoBox>
            </Section>

            <Section title="3. High-Risk AI System — EU AI Act Compliance">
              <Sub title="3.1 System Classification">
                <P>
                  Under <strong>Article 6 and Annex III, point 4 of Regulation (EU) 2024/1689</strong> (the "AI Act"),
                  TalentAI's AI system is classified as a <strong>high-risk AI system</strong> because it is used in:
                </P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  <Li>Recruitment or selection of natural persons, in particular to evaluate candidates</Li>
                  <Li>Decisions affecting employment conditions, promotion, or termination of work relationships</Li>
                </Box>
              </Sub>

              <Sub title="3.2 Transparency towards Candidates (Articles 13 & 50)">
                <P>Before any AI interview, candidates are clearly and explicitly informed of:</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  <Li>The interview being conducted by an AI system, not a human recruiter</Li>
                  <Li>The nature of data collected (video, audio, text responses, behavioural signals)</Li>
                  <Li>The evaluation criteria used by the system to score responses</Li>
                  <Li>The identity of the company accessing the results</Li>
                  <Li>The right to request human review of the evaluation</Li>
                </Box>
              </Sub>

              <Sub title="3.3 Right to Explanation (Article 86)">
                <InfoBox>
                  Every candidate has the right to obtain a <strong>clear explanation</strong> of the role played by
                  the AI system in any decision made about them, including the main criteria considered and how
                  the overall score was determined.
                </InfoBox>
                <P>
                  To exercise this right, contact us at{" "}
                  <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link>.
                  We commit to responding within <strong>15 business days</strong>.
                </P>
              </Sub>

              <Sub title="3.4 Human Oversight (Article 14)">
                <P>TalentAI guarantees that:</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  <Li>Employers retain the ability to <strong>review, override, or disregard</strong> any AI-generated evaluation</Li>
                  <Li>No hiring decision is made in a fully automated manner without the possibility of human intervention</Li>
                  <Li>Technical measures allow the system to be stopped or suspended in case of unexpected behaviour</Li>
                </Box>
              </Sub>

              <Sub title="3.5 Right to Contest">
                <P>
                  Any candidate who believes an AI evaluation was incorrect, biased, or conducted unfairly may:
                </P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  <Li>Contact TalentAI at <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link> to request a review</Li>
                  <Li>Request that the hiring company provide human review of their application</Li>
                  <Li>File a complaint with the relevant national data protection authority</Li>
                </Box>
              </Sub>

              <Sub title="3.6 Risk Management and Testing (Article 9)">
                <P>TalentAI maintains a risk management system covering:</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1 }}>
                  <Li>Regular audits of algorithmic bias in evaluation outputs</Li>
                  <Li>Robustness and performance testing of AI models</Li>
                  <Li>Automatic logging of AI system decisions (logs retained per Article 12)</Li>
                  <Li>Update and correction processes upon detection of anomalies</Li>
                </Box>
              </Sub>
            </Section>

            <Section title="4. User Accounts">
              <P>
                To use certain features, you must create an account and provide accurate, complete information. You are responsible for:
              </P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Keeping your login credentials confidential</Li>
                <Li>All activity that occurs under your account</Li>
                <Li>Notifying us immediately of any unauthorised access at <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link></Li>
              </Box>
              <P>
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or harmful behaviour.
              </P>
            </Section>

            <Section title="5. Candidate Interviews — Rights">
              <P>When you participate in an AI interview on TalentAI, you acknowledge that:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                <Li>The interview is conducted by an AI system, not a human recruiter</Li>
                <Li>Your responses, video, and audio may be recorded, analysed, and shared with the hiring company</Li>
                <Li>Results may be stored and referenced in future applications unless you request deletion</Li>
                <Li>You must have the legal right to work in the jurisdiction you are applying in</Li>
              </Box>
              <P>You hold the following rights:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li><strong>Right to explanation</strong> (Art. 86 AI Act) — obtain a clear account of how your score was determined</Li>
                <Li><strong>Right to contest</strong> — request human review of your evaluation</Li>
                <Li><strong>Right of access & rectification</strong> (Art. 15–16 GDPR) — access your data and request corrections</Li>
                <Li><strong>Right to erasure</strong> (Art. 17 GDPR) — request deletion of your personal data</Li>
                <Li><strong>Right to object</strong> (Art. 21 GDPR) — object to automated processing of your data</Li>
              </Box>
            </Section>

            <Section title="6. Employer Responsibilities">
              <P>As a company using TalentAI to recruit, you agree to:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Use the platform in compliance with applicable employment and data protection laws</Li>
                <Li>Not use AI evaluation results as the sole basis for any employment decision</Li>
                <Li>Inform candidates that their interview will be conducted and evaluated by AI (Article 50 AI Act)</Li>
                <Li>Not post misleading, discriminatory, or illegal job listings</Li>
                <Li>Maintain confidentiality of candidate data obtained through the platform</Li>
                <Li>Retain AI system usage logs as required under Article 26 of the AI Act</Li>
              </Box>
              <InfoBox color="amber">
                As a deployer of a high-risk AI system under the AI Act, your organisation assumes <strong>specific legal obligations</strong> regarding human oversight and incident reporting. Technical documentation required under Article 13 is available upon request.
              </InfoBox>
            </Section>

            <Section title="7. Non-Discrimination and Algorithmic Bias">
              <InfoBox>
                TalentAI is committed to designing and maintaining its AI system to <strong>minimise discriminatory bias</strong> related to gender, ethnic origin, age, disability, or any other characteristic protected by law. Per Article 10 of the AI Act, representative training data and regular audits are implemented.
              </InfoBox>
              <P>
                If you believe you have been discriminated against by the AI system, please report it to{" "}
                <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link>{" "}
                or to the relevant national supervisory authority.
              </P>
            </Section>

            <Section title="8. Intellectual Property">
              <P>
                All content, technology, trademarks, and materials on TalentAI — including AI models, interface design, and software — are owned by TalentAI Inc. and protected by applicable intellectual property laws.
              </P>
              <P>
                You may not copy, modify, distribute, sell, or create derivative works from any part of our platform without our prior written consent.
              </P>
            </Section>

            <Section title="9. Prohibited Uses">
              <P>You agree not to:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Attempt to reverse-engineer, scrape, or extract data from the platform</Li>
                <Li>Use automated tools, bots, or scripts to interact with the service</Li>
                <Li>Impersonate another person or entity</Li>
                <Li>Submit false or misleading information during an interview</Li>
                <Li>Interfere with the security, integrity, or availability of the platform</Li>
                <Li>Use the platform for any unlawful purpose or in violation of any regulation</Li>
              </Box>
            </Section>

            <Section title="10. Blockchain Credentials">
              <P>
                TalentAI issues interview completion credentials on the Hedera blockchain. These credentials are:
              </P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Immutable once issued — they cannot be altered or deleted</Li>
                <Li>Verifiable by third parties who hold the credential identifier</Li>
                <Li>Not a guarantee of employment or a formal qualification</Li>
              </Box>
            </Section>

            <Section title="11. Limitation of Liability">
              <P>
                TalentAI is provided "as is" without warranties of any kind. To the maximum extent permitted by law, TalentAI Inc. shall not be liable for:
              </P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Any indirect, incidental, or consequential damages arising from your use of the platform</Li>
                <Li>Hiring outcomes or decisions made based on AI evaluations</Li>
                <Li>Loss of data, revenue, or business opportunities</Li>
                <Li>Any service interruption or technical failure</Li>
              </Box>
            </Section>

            <Section title="12. Modifications to Terms">
              <P>
                We may update these Terms from time to time. We will notify registered users of material changes via email or an in-app notice. Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.
              </P>
            </Section>

            <Section title="13. Governing Law">
              <P>
                These Terms are governed by applicable law, including Regulation (EU) 2024/1689 (AI Act), Regulation (EU) 2016/679 (GDPR), and relevant national legislation. Any disputes shall first be addressed through good-faith negotiation, and if unresolved, through the competent jurisdiction.
              </P>
            </Section>

            <Section title="14. Contact & Exercise of Rights">
              <P>
                For questions about these Terms or to exercise any right (explanation, contest, access, erasure, objection), contact us:
              </P>
              <Box sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", p: "16px 20px", mt: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#374151", fontFamily: "Poppins", lineHeight: 2 }}>
                  📧 <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488", fontWeight: 600 }}>contact@talentai.bid</Link><br />
                  🌐 <Link href="https://app.talentai.bid" sx={{ color: "#0D9488" }}>app.talentai.bid</Link><br />
                  ⏱ Response time: 15 business days for AI Act-related requests
                </Typography>
              </Box>
            </Section>


          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#111827", py: 3, px: 3, textAlign: "center" }}>
        <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "Poppins" }}>
          © 2026 TalentAI Inc. All rights reserved. &nbsp;·&nbsp;{" "}
          <NextLink href="/terms" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Terms of Use</NextLink>
          {" "}&nbsp;·&nbsp;{" "}
          <NextLink href="/privacy" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Privacy Policy</NextLink>
        </Typography>
      </Box>
    </>
  );
}
