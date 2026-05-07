import Head from "next/head";
import { Box, Container, Typography, Divider, Link, Chip } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Trans, useTranslation } from "react-i18next";

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
  const { t } = useTranslation("legal");
  const lastUpdated = t("terms.lastUpdated");
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <>
      <Head>
        <title>{t("terms.meta.title")}</title>
        <meta name="description" content={t("terms.meta.description")} />
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
            {t("common.backToHome")}
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
                {t("terms.title")}
              </Typography>
              <Chip
                label={t("terms.chip")}
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 700, fontSize: "11px", fontFamily: "Poppins", mt: 0.5 }}
              />
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#9CA3AF", mb: 1, fontFamily: "Poppins" }}>
              {t("common.lastUpdated", { date: lastUpdated })}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <InfoBox>
              <Trans
                i18nKey="terms.notice"
                ns="legal"
                components={{ b: <strong /> }}
              />
            </InfoBox>

            <P>
              <Trans
                i18nKey="terms.intro"
                ns="legal"
                components={{ site: <Link href="https://app.talentai.bid" sx={{ color: "#0D9488" }} /> }}
              />
            </P>

            <Section title={t("terms.sections.acceptance.title")}>
              <P>{t("terms.sections.acceptance.p1")}</P>
              <P>{t("terms.sections.acceptance.p2")}</P>
            </Section>

            <Section title={t("terms.sections.service.title")}>
              <P>{t("terms.sections.service.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.service.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <InfoBox color="amber">
                <Trans i18nKey="terms.sections.service.notice" ns="legal" components={{ b: <strong /> }} />
              </InfoBox>
            </Section>

            <Section title={t("terms.sections.ai.title")}>
              <Sub title={t("terms.sections.ai.classification.title")}>
                <P><Trans i18nKey="terms.sections.ai.classification.p1" ns="legal" components={{ b: <strong /> }} /></P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  {list("terms.sections.ai.classification.items").map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </Box>
              </Sub>

              <Sub title={t("terms.sections.ai.transparency.title")}>
                <P>{t("terms.sections.ai.transparency.p1")}</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  {list("terms.sections.ai.transparency.items").map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </Box>
              </Sub>

              <Sub title={t("terms.sections.ai.explanation.title")}>
                <InfoBox>
                  <Trans i18nKey="terms.sections.ai.explanation.notice" ns="legal" components={{ b: <strong /> }} />
                </InfoBox>
                <P>
                  <Trans
                    i18nKey="terms.sections.ai.explanation.p1"
                    ns="legal"
                    components={{
                      contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} />,
                      b: <strong />,
                    }}
                  />
                </P>
              </Sub>

              <Sub title={t("terms.sections.ai.oversight.title")}>
                <P>{t("terms.sections.ai.oversight.p1")}</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  {list("terms.sections.ai.oversight.items").map((item, idx) => (
                    <Li key={`${item}-${idx}`}>{item}</Li>
                  ))}
                </Box>
              </Sub>

              <Sub title={t("terms.sections.ai.contest.title")}>
                <P>{t("terms.sections.ai.contest.p1")}</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                  <Li>
                    <Trans
                      i18nKey="terms.sections.ai.contest.items.0"
                      ns="legal"
                      components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }}
                    />
                  </Li>
                  {list("terms.sections.ai.contest.items").slice(1).map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </Box>
              </Sub>

              <Sub title={t("terms.sections.ai.risk.title")}>
                <P>{t("terms.sections.ai.risk.p1")}</P>
                <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1 }}>
                  {list("terms.sections.ai.risk.items").map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </Box>
              </Sub>
            </Section>

            <Section title={t("terms.sections.accounts.title")}>
              <P>{t("terms.sections.accounts.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.accounts.items").slice(0, 2).map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
                <Li>
                  <Trans
                    i18nKey="terms.sections.accounts.items.2"
                    ns="legal"
                    components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }}
                  />
                </Li>
              </Box>
              <P>{t("terms.sections.accounts.p2")}</P>
            </Section>

            <Section title={t("terms.sections.candidateRights.title")}>
              <P>{t("terms.sections.candidateRights.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                {list("terms.sections.candidateRights.itemsA").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <P>{t("terms.sections.candidateRights.p2")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.candidateRights.itemsB").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("terms.sections.employerResponsibilities.title")}>
              <P>{t("terms.sections.employerResponsibilities.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.employerResponsibilities.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <InfoBox color="amber">
                <Trans i18nKey="terms.sections.employerResponsibilities.notice" ns="legal" components={{ b: <strong /> }} />
              </InfoBox>
            </Section>

            <Section title={t("terms.sections.nonDiscrimination.title")}>
              <InfoBox>
                <Trans i18nKey="terms.sections.nonDiscrimination.notice" ns="legal" components={{ b: <strong /> }} />
              </InfoBox>
              <P>
                <Trans
                  i18nKey="terms.sections.nonDiscrimination.p1"
                  ns="legal"
                  components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }}
                />
              </P>
            </Section>

            <Section title={t("terms.sections.ip.title")}>
              <P>{t("terms.sections.ip.p1")}</P>
              <P>{t("terms.sections.ip.p2")}</P>
            </Section>

            <Section title={t("terms.sections.prohibitedUses.title")}>
              <P>{t("terms.sections.prohibitedUses.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.prohibitedUses.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("terms.sections.blockchain.title")}>
              <P>{t("terms.sections.blockchain.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.blockchain.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("terms.sections.liability.title")}>
              <P>{t("terms.sections.liability.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("terms.sections.liability.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("terms.sections.modifications.title")}>
              <P>{t("terms.sections.modifications.p1")}</P>
            </Section>

            <Section title={t("terms.sections.governingLaw.title")}>
              <P>{t("terms.sections.governingLaw.p1")}</P>
            </Section>

            <Section title={t("terms.sections.contact.title")}>
              <P>{t("terms.sections.contact.p1")}</P>
              <Box sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", p: "16px 20px", mt: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#374151", fontFamily: "Poppins", lineHeight: 2 }}>
                  📧 <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488", fontWeight: 600 }}>contact@talentai.bid</Link><br />
                  🌐 <Link href="https://app.talentai.bid" sx={{ color: "#0D9488" }}>app.talentai.bid</Link><br />
                  ⏱ {t("terms.sections.contact.responseTime")}
                </Typography>
              </Box>
            </Section>


          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#111827", py: 3, px: 3, textAlign: "center" }}>
        <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "Poppins" }}>
          {t("common.footerCopyright")} &nbsp;·&nbsp;{" "}
          <NextLink href="/terms" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("common.termsOfUse")}</NextLink>
          {" "}&nbsp;·&nbsp;{" "}
          <NextLink href="/privacy" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("common.privacyPolicy")}</NextLink>
        </Typography>
      </Box>
    </>
  );
}
