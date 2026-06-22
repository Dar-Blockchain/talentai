import Head from "next/head";
import NextLink from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import Header from "@/modules/shared/layouts/home/HomeHeader";
import { APP_URL, CONTACT_EMAIL } from "@/constants";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-[1.05rem] font-bold text-gray-900 mb-3">{title}</h2>
    {children}
  </div>
);

const Sub: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-[0.95rem] font-bold text-gray-700 mb-2">{title}</h3>
    {children}
  </div>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[0.93rem] text-gray-600 leading-[1.85] mb-3">{children}</p>
);

const Li: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="text-[0.93rem] text-gray-600 leading-[1.85] mb-1.5 ml-5 list-disc">{children}</li>
);

const InfoBox: React.FC<{ children: React.ReactNode; color?: "blue" | "amber" }> = ({ children, color = "blue" }) => {
  const isAmber = color === "amber";
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 mb-4 ${
      isAmber
        ? "bg-amber-50 border-amber-200"
        : "bg-blue-50 border-blue-200"
    }`}>
      {isAmber
        ? <AlertTriangle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
        : <Info className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
      }
      <p className={`text-[0.88rem] leading-[1.75] ${isAmber ? "text-amber-800" : "text-blue-800"}`}>
        {children}
      </p>
    </div>
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
        <link rel="canonical" href={`${APP_URL}/terms`} />
      </Head>

      <Header />

      <div
        className="min-h-screen py-10 md:py-16"
        style={{ background: "linear-gradient(180deg,#111827 0px,#111827 120px,#F9FAFB 120px,#F9FAFB 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 md:px-10 py-8 md:py-10">

            {/* Title */}
            <div className="flex items-start gap-3 flex-wrap mb-1">
              <h1 className="text-[1.6rem] md:text-[2rem] font-extrabold text-gray-900 leading-tight">
                {t("terms.title")}
              </h1>
              <span className="mt-1.5 inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                {t("terms.chip")}
              </span>
            </div>
            <p className="text-[0.85rem] text-gray-400 mb-6">
              {t("common.lastUpdated", { date: lastUpdated })}
            </p>

            <hr className="border-gray-200 mb-7" />

            <InfoBox>
              <Trans i18nKey="terms.notice" ns="legal" components={{ b: <strong /> }} />
            </InfoBox>

            <P>
              <Trans
                i18nKey="terms.intro"
                ns="legal"
                components={{ site: <NextLink href={APP_URL} className="text-primary hover:underline" /> }}
              />
            </P>

            <Section title={t("terms.sections.acceptance.title")}>
              <P>{t("terms.sections.acceptance.p1")}</P>
              <P>{t("terms.sections.acceptance.p2")}</P>
            </Section>

            <Section title={t("terms.sections.service.title")}>
              <P>{t("terms.sections.service.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.service.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <InfoBox color="amber">
                <Trans i18nKey="terms.sections.service.notice" ns="legal" components={{ b: <strong /> }} />
              </InfoBox>
            </Section>

            <Section title={t("terms.sections.ai.title")}>
              <Sub title={t("terms.sections.ai.classification.title")}>
                <P><Trans i18nKey="terms.sections.ai.classification.p1" ns="legal" components={{ b: <strong /> }} /></P>
                <ul className="mb-4">
                  {list("terms.sections.ai.classification.items").map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </ul>
              </Sub>

              <Sub title={t("terms.sections.ai.transparency.title")}>
                <P>{t("terms.sections.ai.transparency.p1")}</P>
                <ul className="mb-4">
                  {list("terms.sections.ai.transparency.items").map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </ul>
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
                      contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" />,
                      b: <strong />,
                    }}
                  />
                </P>
              </Sub>

              <Sub title={t("terms.sections.ai.oversight.title")}>
                <P>{t("terms.sections.ai.oversight.p1")}</P>
                <ul className="mb-4">
                  {list("terms.sections.ai.oversight.items").map((item, idx) => (
                    <Li key={`${item}-${idx}`}>{item}</Li>
                  ))}
                </ul>
              </Sub>

              <Sub title={t("terms.sections.ai.contest.title")}>
                <P>{t("terms.sections.ai.contest.p1")}</P>
                <ul className="mb-4">
                  <Li>
                    <Trans
                      i18nKey="terms.sections.ai.contest.items.0"
                      ns="legal"
                      components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                    />
                  </Li>
                  {list("terms.sections.ai.contest.items").slice(1).map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </ul>
              </Sub>

              <Sub title={t("terms.sections.ai.risk.title")}>
                <P>{t("terms.sections.ai.risk.p1")}</P>
                <ul className="mb-3">
                  {list("terms.sections.ai.risk.items").map((item) => (
                    <Li key={item}>{item}</Li>
                  ))}
                </ul>
              </Sub>
            </Section>

            <Section title={t("terms.sections.accounts.title")}>
              <P>{t("terms.sections.accounts.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.accounts.items").slice(0, 2).map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
                <Li>
                  <Trans
                    i18nKey="terms.sections.accounts.items.2"
                    ns="legal"
                    components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                  />
                </Li>
              </ul>
              <P>{t("terms.sections.accounts.p2")}</P>
            </Section>

            <Section title={t("terms.sections.candidateRights.title")}>
              <P>{t("terms.sections.candidateRights.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.candidateRights.itemsA").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
              <P>{t("terms.sections.candidateRights.p2")}</P>
              <ul className="mb-4">
                {list("terms.sections.candidateRights.itemsB").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("terms.sections.employerResponsibilities.title")}>
              <P>{t("terms.sections.employerResponsibilities.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.employerResponsibilities.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
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
                  components={{ contact: <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline" /> }}
                />
              </P>
            </Section>

            <Section title={t("terms.sections.ip.title")}>
              <P>{t("terms.sections.ip.p1")}</P>
              <P>{t("terms.sections.ip.p2")}</P>
            </Section>

            <Section title={t("terms.sections.prohibitedUses.title")}>
              <P>{t("terms.sections.prohibitedUses.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.prohibitedUses.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("terms.sections.reports.title")}>
              <P>{t("terms.sections.reports.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.reports.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("terms.sections.liability.title")}>
              <P>{t("terms.sections.liability.p1")}</P>
              <ul className="mb-4">
                {list("terms.sections.liability.items").map((item) => (
                  <Li key={item}>{item}</Li>
                ))}
              </ul>
            </Section>

            <Section title={t("terms.sections.modifications.title")}>
              <P>{t("terms.sections.modifications.p1")}</P>
            </Section>

            <Section title={t("terms.sections.governingLaw.title")}>
              <P>{t("terms.sections.governingLaw.p1")}</P>
            </Section>

            <Section title={t("terms.sections.contact.title")}>
              <P>{t("terms.sections.contact.p1")}</P>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mt-2 space-y-1">
                <p className="text-[0.9rem] text-gray-600 leading-loose">
                  📧 <NextLink href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-semibold hover:underline">{CONTACT_EMAIL}</NextLink>
                </p>
                <p className="text-[0.9rem] text-gray-600 leading-loose">
                  🌐 <NextLink href={APP_URL} className="text-primary hover:underline">{APP_URL.replace("https://", "")}</NextLink>
                </p>
                <p className="text-[0.9rem] text-gray-600 leading-loose">
                  ⏱ {t("terms.sections.contact.responseTime")}
                </p>
              </div>
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
