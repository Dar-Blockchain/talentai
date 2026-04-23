import Head from "next/head";
import { Box, Container, Typography, Divider, Link } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const LAST_UPDATED = "April 1, 2026";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 4.5 }}>
    <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", mb: 1.5, fontFamily: "Poppins" }}>
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

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — TalentAI</title>
        <meta name="description" content="Read TalentAI's Privacy Policy. Learn how we collect, use, and protect your personal data on our AI-powered recruitment platform." />
        <link rel="canonical" href="https://app.talentai.bid/privacy" />
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
            <Typography sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 800, color: "#111827", mb: 1, fontFamily: "Poppins" }}>
              Privacy Policy
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#9CA3AF", mb: 4, fontFamily: "Poppins" }}>
              Last updated: {LAST_UPDATED}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <P>
              TalentAI Inc. ("TalentAI", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal data when you use our platform at{" "}
              <Link href="https://app.talentai.bid" sx={{ color: "#0D9488" }}>app.talentai.bid</Link>.
            </P>

            <Section title="1. Who This Policy Applies To">
              <P>This policy applies to all users of TalentAI, including:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li><strong>Candidates</strong> — individuals who apply for jobs and complete AI interviews</Li>
                <Li><strong>Employers</strong> — companies and recruiters who use TalentAI to hire</Li>
                <Li><strong>Team Members</strong> — employees invited to a company account</Li>
                <Li><strong>Visitors</strong> — anyone browsing our website</Li>
              </Box>
            </Section>

            <Section title="2. Data We Collect">
              <P><strong>From Candidates:</strong></P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                <Li>Personal identifiers: name, email address, phone number</Li>
                <Li>Resume / CV documents and the data extracted from them</Li>
                <Li>Video and audio recordings from AI interview sessions</Li>
                <Li>Interview responses, AI evaluation scores, and matching results</Li>
                <Li>Skills, work experience, and education history from your profile</Li>
                <Li>Device information, IP address, and browser data (collected automatically)</Li>
              </Box>
              <P><strong>From Employers:</strong></P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                <Li>Company name, website, and contact details</Li>
                <Li>Account credentials and billing information</Li>
                <Li>Job post content, recruitment campaign data, and interview configurations</Li>
                <Li>Usage data and feature interaction logs</Li>
              </Box>
            </Section>

            <Section title="3. How We Use Your Data">
              <P>We use the data we collect to:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Operate and improve the TalentAI platform</Li>
                <Li>Conduct AI-powered interviews and generate evaluation results</Li>
                <Li>Match candidates with relevant job opportunities</Li>
                <Li>Issue and verify blockchain-based interview credentials</Li>
                <Li>Send transactional emails (interview invitations, reminders, account notifications)</Li>
                <Li>Prevent fraud, abuse, and unauthorised access</Li>
                <Li>Comply with legal obligations</Li>
                <Li>Conduct analytics to improve our service (aggregated and anonymised where possible)</Li>
              </Box>
              <P>
                We do not sell your personal data to third parties.
              </P>
            </Section>

            <Section title="4. AI Processing and Automated Decisions">
              <P>
                TalentAI uses artificial intelligence to analyse candidate responses, generate interview scores, and produce matching assessments. You have the right to:
              </P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Be informed that automated processing is taking place (as disclosed at the point of interview)</Li>
                <Li>Request human review of any automated decision that significantly affects you</Li>
                <Li>Object to solely automated decision-making where required by applicable law</Li>
              </Box>
              <P>
                All AI-generated evaluations are provided as decision-support tools. Final hiring decisions are made by the employer, not TalentAI.
              </P>
            </Section>

            <Section title="5. Data Sharing">
              <P>We may share your data with:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li><strong>Hiring companies</strong> — employers receive candidate profiles, interview recordings, and evaluation scores for roles you applied to</Li>
                <Li><strong>Service providers</strong> — trusted third parties who process data on our behalf (cloud infrastructure, email delivery, payment processing) under strict data protection agreements</Li>
                <Li><strong>Hedera network</strong> — anonymised credential hashes are recorded on the Hedera public blockchain for verification purposes</Li>
                <Li><strong>Legal authorities</strong> — where required by law, court order, or to protect the rights and safety of our users</Li>
              </Box>
            </Section>

            <Section title="6. Data Retention">
              <P>We retain your personal data for as long as your account is active or as needed to provide our services. Specifically:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li>Interview recordings and scores are retained for up to 24 months after the application</Li>
                <Li>Account data is retained until account deletion is requested</Li>
                <Li>Blockchain credential hashes are permanent and cannot be deleted by nature of the technology</Li>
                <Li>Billing records are retained as required by applicable tax law</Li>
              </Box>
              <P>
                You may request deletion of your personal data at any time by contacting us at{" "}
                <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link>.
                Deletion requests will be processed within 30 days, subject to legal retention requirements.
              </P>
            </Section>

            <Section title="7. Your Rights">
              <P>Depending on your location, you may have the right to:</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                <Li><strong>Access</strong> — request a copy of the personal data we hold about you</Li>
                <Li><strong>Rectification</strong> — ask us to correct inaccurate or incomplete data</Li>
                <Li><strong>Erasure</strong> — request deletion of your data ("right to be forgotten")</Li>
                <Li><strong>Portability</strong> — receive your data in a machine-readable format</Li>
                <Li><strong>Objection</strong> — object to certain types of processing, including automated decisions</Li>
                <Li><strong>Restriction</strong> — request that we limit how we use your data</Li>
              </Box>
              <P>
                To exercise any of these rights, contact us at{" "}
                <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link>.
              </P>
            </Section>

            <Section title="8. Cookies and Tracking">
              <P>
                TalentAI uses cookies and similar technologies to keep you logged in, remember your preferences, and understand how you use the platform. You can control cookie settings through your browser. Disabling certain cookies may affect platform functionality.
              </P>
            </Section>

            <Section title="9. Data Security">
              <P>
                We implement industry-standard security measures including encryption in transit (TLS), access controls, and secure cloud infrastructure. However, no method of transmission or storage is 100% secure. We encourage you to use a strong, unique password and to report any suspected security issues to{" "}
                <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link>.
              </P>
            </Section>

            <Section title="10. International Data Transfers">
              <P>
                TalentAI operates globally. Your data may be processed in countries outside your own. Where we transfer data internationally, we ensure appropriate safeguards are in place in accordance with applicable data protection law.
              </P>
            </Section>

            <Section title="11. Changes to This Policy">
              <P>
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. The "Last updated" date at the top of this page will always reflect the most recent version.
              </P>
            </Section>

            <Section title="12. Contact Us">
              <P>
                For any privacy-related questions, requests, or concerns, please contact our team at:{" "}
                <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }}>contact@talentai.bid</Link>
              </P>
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
