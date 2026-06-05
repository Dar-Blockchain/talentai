import Head from "next/head";
import LandingPageLayout from "@/components/features/home/LandingPageLayout";
import AISpotlight from "@/components/features/home/company/AISpotlight";
import GlobalCompanies from "@/components/features/home/company/GlobalCompanies";
import BiasFreeEvaluation from "@/components/features/home/company/BiasFreeEvaluation";
import Footer from "@/modules/shared/layouts/home/HomeFooter";
import SolutionsSection from "@/components/features/home/company/HowItWorksSection";
import ContactSection from "@/components/features/home/company/ContactSection";
import FAQSection from "@/components/features/home/company/FAQSection";
import FinalCTA from "@/components/features/home/company/FinalCTA";
import StakesSection from "@/components/features/home/company/StakesSection";
import SuccessSection from "@/components/features/home/company/SuccessSection";
import { useEffect } from "react";
import { Box } from "@mui/material";
import { setUserType } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import type { GetStaticProps } from "next";

const CANONICAL = "https://talentai.bid/";
const OG_IMAGE  = "https://talentai.bid/images/home/og-cover.png";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TalentAI",
  url: "https://talentai.bid",
  logo: "https://talentai.bid/images/home/logo.svg",
  description:
    "AI-powered recruitment automation platform that replaces manual hiring with intelligent, conversational AI agents.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "contact@talentai.bid",
  },
  sameAs: ["https://www.linkedin.com/company/talentai-bid"],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TalentAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://talentai.bid",
  description:
    "Automate your entire hiring pipeline with AI agents that conduct natural video interviews, score candidates objectively, and deliver explainable evaluation reports. Cut 42-day hiring cycles by up to 75%.",
  brand: { "@type": "Brand", name: "TalentAI" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "8",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "8",
      priceCurrency: "USD",
      unitText: "per AI interview",
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is TalentAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TalentAI is an AI-powered recruitment automation platform that replaces manual hiring processes with intelligent, customizable pipelines. The platform deploys conversational AI agents to conduct natural video interviews, score candidates across technical, behavioral, and cultural dimensions, and deliver explainable reports. Companies use TalentAI to reduce their average 42-day hiring cycle by up to 75%.",
      },
    },
    {
      "@type": "Question",
      name: "How does AI interviewing work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TalentAI's AI agents conduct live video interviews using natural language processing and voice synthesis. The agents adapt their questions in real time based on candidate responses, evaluate both verbal and non-verbal cues, and produce multi-dimensional assessment reports — all without human intervention.",
      },
    },
    {
      "@type": "Question",
      name: "Is AI-powered hiring biased?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TalentAI is designed to eliminate unconscious bias. Every candidate receives identical assessment criteria, standardized questions, and objective scoring. All evaluation data is logged and auditable, ensuring compliance with equal opportunity employment standards and GDPR requirements.",
      },
    },
    {
      "@type": "Question",
      name: "What assessment modules are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TalentAI offers 8 pre-built assessment modules: Technical Skills Evaluation, Soft Skills Assessment, Cultural Fit Analysis, Language Proficiency Testing, Practical Task Assignments, Problem-Solving Challenges, Behavioral Interviews, and Reference Verification. Each module is configurable with custom pass/fail thresholds, weighted scoring, time limits, and automatic progression rules.",
      },
    },
    {
      "@type": "Question",
      name: "How much does TalentAI cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TalentAI offers flexible pricing starting at $8 per AI interview with zero commitment. Subscription plans start at $99/month (Starter, 15 interviews) and scale to $1,499/month (Unlimited, 700 interviews with dedicated support). Every plan includes AI interview scoring, AI-powered job post creation, and a customizable pipeline builder.",
      },
    },
  ],
};

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    localStorage.setItem("userType", "company");
    dispatch(setUserType("company"));
  }, [dispatch]);

  return (
    <>
      <Head>
        <title>TalentAI | AI Recruitment Platform — Hire 75% Faster with Conversational AI Agents</title>
        <meta
          name="description"
          content="TalentAI automates your entire hiring pipeline with AI agents that conduct natural video interviews, score candidates objectively, and deliver explainable reports. Cut 42-day hiring cycles by up to 75%. AI interviews from $8 each."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="TalentAI" />
        <meta property="og:title" content="TalentAI — AI Agents That Interview Candidates For You" />
        <meta
          property="og:description"
          content="Automate screening, interviews, and evaluation with conversational AI. Reduce hiring time by 75%. Trusted by NVIDIA Inception."
        />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="TalentAI — AI-powered recruitment platform" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalentAI — AI Agents That Interview Candidates For You" />
        <meta
          name="twitter:description"
          content="Automate screening, interviews, and evaluation with conversational AI. Reduce hiring time by 75%."
        />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <LandingPageLayout
        logo="/images/home/logo.svg"
        type="company"
        color="#0D9488"
        headerLink="Are you a Job Seeker?"
        heroTitle="Revolutionize Your Hiring with"
        heroSubtitle="AI-Powered Intelligence"
        backgroundColor="#F2F3F4"
      >
        <Box sx={{ background: "#F2F3F4", py: { xs: 5, md: 7 } }}>
          <GlobalCompanies />
        </Box>

        <Box sx={{ background: "#111827", py: { xs: 6, md: 9 } }}>
          <AISpotlight />
        </Box>

        <Box sx={{ background: "#ffffff", py: { xs: 6, md: 9 } }}>
          <BiasFreeEvaluation />
        </Box>

        <Box sx={{ background: "#111827", py: { xs: 6, md: 9 } }}>
          <StakesSection />
        </Box>

        <Box sx={{ background: "#F2F3F4", py: { xs: 6, md: 9 } }}>
          <SolutionsSection />
        </Box>

        <Box sx={{ background: "#ffffff", py: { xs: 6, md: 9 } }}>
          <SuccessSection />
        </Box>

        <Box sx={{ background: "#111827" }}>
          <FinalCTA />
        </Box>

        <Box sx={{ background: "#F2F3F4" }}>
          <FAQSection />
        </Box>

        <Box sx={{ background: "#ffffff", py: { xs: 6, md: 9 } }}>
          <ContactSection />
        </Box>

        <Footer />
      </LandingPageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};

export default HomePage;
