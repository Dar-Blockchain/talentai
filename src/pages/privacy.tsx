import Head from "next/head";
import NextLink from "next/link";
import { Trans, useTranslation } from "react-i18next";
import Header from "@/modules/shared/layouts/home/HomeHeader";
import { SITE_URL, APP_URL, CONTACT_EMAIL } from "@/modules/shared/constants";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-[1.05rem] font-bold text-gray-900 mb-3">{title}</h2>
    {children}
  </div>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[0.93rem] text-gray-600 leading-[1.85] mb-3">{children}</p>
);

const Li: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="text-[0.93rem] text-gray-600 leading-[1.85] mb-1.5 ml-5 list-disc">{children}</li>
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
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t("privacy.meta.title")} />
        <meta property="og:description" content={t("privacy.meta.description")} />
      </Head>

      <Header />

      <div
        className="min-h-screen py-10 md:py-16"
        style={{ background: "linear-gradient(180deg,#111827 0px,#111827 120px,#F9FAFB 120px,#F9FAFB 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 md:px-10 py-8 md:py-10">

            {/* Title */}
            <h1 className="text-[1.6rem] md:text-[2rem] font-extrabold text-gray-900 mb-1">
              {t("privacy.title")}
            </h1>
            <p className="text-[0.85rem] text-gray-400 mb-6">
              {t("common.lastUpdated", { date: lastUpdated })}
            </p>

            <hr className="border-gray-200 mb-7" />

            <P>
              <Trans
                i18nKey="privacy.intro"
                ns="legal"
                components={{ site: <NextLink href={APP_URL} className="text-primary hover:underline" /> }}
              />
            </P>

            <Section title={t("privacy.sections.appliesTo.title")}>
              <P>{t("privacy.sections.appliesTo.p1")}</P>
              <ul className="mb-4">
                {list("privacy.sections.appliesTo.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("privacy.sections.dataCollected.title")}>
              <P><strong>{t("privacy.sections.dataCollected.fromCandidates")}</strong></P>
              <ul className="mb-5">
                {list("privacy.sections.dataCollected.candidateItems").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <P><strong>{t("privacy.sections.dataCollected.fromEmployers")}</strong></P>
              <ul className="mb-4">
                {list("privacy.sections.dataCollected.employerItems").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("privacy.sections.dataUse.title")}>
              <P>{t("privacy.sections.dataUse.p1")}</P>
              <ul className="mb-4">
                {list("privacy.sections.dataUse.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <P>{t("privacy.sections.dataUse.p2")}</P>
            </Section>

            <Section title={t("privacy.sections.aiProcessing.title")}>
              <P>{t("privacy.sections.aiProcessing.p1")}</P>
              <ul className="mb-4">
                {list("privacy.sections.aiProcessing.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <P>{t("privacy.sections.aiProcessing.p2")}</P>
            </Section>

            <Section title={t("privacy.sections.dataSharing.title")}>
              <P>{t("privacy.sections.dataSharing.p1")}</P>
              <ul className="mb-4">
                {list("privacy.sections.dataSharing.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("privacy.sections.retention.title")}>
              <P>{t("privacy.sections.retention.p1")}</P>
              <ul className="mb-4">
                {list("privacy.sections.retention.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <P>
                <Trans
                  i18nKey="privacy.sections.retention.p2"
                  ns="legal"
                  components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                />
              </P>
            </Section>

            <Section title={t("privacy.sections.rights.title")}>
              <P>{t("privacy.sections.rights.p1")}</P>
              <ul className="mb-4">
                {list("privacy.sections.rights.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <P>
                <Trans
                  i18nKey="privacy.sections.rights.p2"
                  ns="legal"
                  components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                />
              </P>
            </Section>

            <Section title={t("privacy.sections.cookies.title")}>
              <P>{t("privacy.sections.cookies.p1")}</P>
            </Section>

            <Section title={t("privacy.sections.security.title")}>
              <P>
                <Trans
                  i18nKey="privacy.sections.security.p1"
                  ns="legal"
                  components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                />
              </P>
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
                  components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                />
              </P>
            </Section>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-5 px-4 text-center">
        <p className="text-[12px] text-gray-400">
          {t("common.footerCopyright")} &nbsp;·&nbsp;{" "}
          <NextLink href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors">{t("common.termsOfUse")}</NextLink>
          {" "}&nbsp;·&nbsp;{" "}
          <NextLink href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors">{t("common.privacyPolicy")}</NextLink>
        </p>
      </div>
    </>
  );
}
