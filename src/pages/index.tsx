import LandingPageLayout from "@/components/features/home/LandingPageLayout";
import AISpotlight from "@/components/features/home/company/AISpotlight";
import GlobalCompanies from "@/components/features/home/company/GlobalCompanies";
import BiasFreeEvaluation from "@/components/features/home/company/BiasFreeEvaluation";
import Footer from "@/components/layout/Footer";
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
import dynamic from "next/dynamic";

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    localStorage.setItem("userType", "company");
    dispatch(setUserType("company"));
  }, [dispatch]);

  return (
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
  );
};

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false,
});
