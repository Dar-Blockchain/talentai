import Head from "next/head";
import { Box, Container, Typography, Divider, Link } from "@mui/material";
import NextLink from "next/link";
import { Trans, useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";

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
  const { t } = useTranslation("legal");
  const lastUpdated = t("privacy.lastUpdated");
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <>
      <Head>
        <title>{t("privacy.meta.title")}</title>
        <meta name="description" content={t("privacy.meta.description")} />
        <link rel="canonical" href="https://app.talentai.bid/privacy" />
      </Head>

      <Header />

      {/* Content */}
      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 5, md: 8 },
          background: "linear-gradient(180deg, #111827 0px, #111827 120px, #F9FAFB 120px, #F9FAFB 100%)",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 } }}>

            {/* Title */}
            <Typography sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 800, color: "#111827", mb: 1, fontFamily: "Poppins" }}>
              {t("privacy.title")}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#9CA3AF", mb: 4, fontFamily: "Poppins" }}>
              {t("common.lastUpdated", { date: lastUpdated })}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <P>
              <Trans
                i18nKey="privacy.intro"
                ns="legal"
                components={{ site: <Link href="https://app.talentai.bid" sx={{ color: "#0D9488" }} /> }}
              />
            </P>

            <Section title={t("privacy.sections.appliesTo.title")}>
              <P>{t("privacy.sections.appliesTo.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("privacy.sections.appliesTo.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("privacy.sections.dataCollected.title")}>
              <P><strong>{t("privacy.sections.dataCollected.fromCandidates")}</strong></P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                {list("privacy.sections.dataCollected.candidateItems").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <P><strong>{t("privacy.sections.dataCollected.fromEmployers")}</strong></P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 2 }}>
                {list("privacy.sections.dataCollected.employerItems").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("privacy.sections.dataUse.title")}>
              <P>{t("privacy.sections.dataUse.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("privacy.sections.dataUse.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <P>{t("privacy.sections.dataUse.p2")}</P>
            </Section>

            <Section title={t("privacy.sections.aiProcessing.title")}>
              <P>{t("privacy.sections.aiProcessing.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("privacy.sections.aiProcessing.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <P>{t("privacy.sections.aiProcessing.p2")}</P>
            </Section>

            <Section title={t("privacy.sections.dataSharing.title")}>
              <P>{t("privacy.sections.dataSharing.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("privacy.sections.dataSharing.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
            </Section>

            <Section title={t("privacy.sections.retention.title")}>
              <P>{t("privacy.sections.retention.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("privacy.sections.retention.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <P>
                <Trans
                  i18nKey="privacy.sections.retention.p2"
                  ns="legal"
                  components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }}
                />
              </P>
            </Section>

            <Section title={t("privacy.sections.rights.title")}>
              <P>{t("privacy.sections.rights.p1")}</P>
              <Box component="ul" sx={{ pl: 0, listStyle: "disc", mb: 1.5 }}>
                {list("privacy.sections.rights.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </Box>
              <P>
                <Trans
                  i18nKey="privacy.sections.rights.p2"
                  ns="legal"
                  components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }}
                />
              </P>
            </Section>

            <Section title={t("privacy.sections.cookies.title")}>
              <P>{t("privacy.sections.cookies.p1")}</P>
            </Section>

            <Section title={t("privacy.sections.security.title")}>
              <P><Trans i18nKey="privacy.sections.security.p1" ns="legal" components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }} /></P>
            </Section>

            <Section title={t("privacy.sections.transfers.title")}>
              <P>{t("privacy.sections.transfers.p1")}</P>
            </Section>

            <Section title={t("privacy.sections.changes.title")}>
              <P>{t("privacy.sections.changes.p1")}</P>
            </Section>

            <Section title={t("privacy.sections.contact.title")}>
              <P>
                <Trans
                  i18nKey="privacy.sections.contact.p1"
                  ns="legal"
                  components={{ contact: <Link href="mailto:contact@talentai.bid" sx={{ color: "#0D9488" }} /> }}
                />
              </P>
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
