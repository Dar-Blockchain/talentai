import LandingPageLayout from "@/components/home/LandingPageLayout";
import AISpotlight from "@/components/home/company/AISpotlight";
import GlobalCompanies from "@/components/home/company/GlobalCompanies";
import BiasFreeEvaluation from "@/components/home/company/BiasFreeEvaluation";
import Footer from "@/components/layout/Footer";
import SolutionsSection from "@/components/home/company/HowItWorksSection";
import ContactSection from "@/components/home/company/ContactSection";
import FAQSection from "@/components/home/company/FAQSection";
import FinalCTA from "@/components/home/company/FinalCTA";
import StakesSection from "@/components/home/company/StakesSection";
import SuccessSection from "@/components/home/company/SuccessSection";
import { useEffect } from "react";
import { Box } from "@mui/material";
import { setUserType } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import dynamic from 'next/dynamic';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    localStorage.setItem("userType", "company");
    dispatch(setUserType("company"));
    
  }, [dispatch]);


  return (
    <LandingPageLayout
      logo="/images/home/logocompany.png"
      type="company"
      color="#0D9488"
      headerLink="Are you a Job Seeker?"
      heroTitle="Revolutionize Your Hiring with"
      heroSubtitle="AI-Powered Intelligence"
      backgroundColor="#F2F3F4"
    >
      {/* Block 1 — Stats & Trust (light grey) */}
      <Box sx={{ background: "#F2F3F4", py: { xs: 5, md: 7 } }}>
        <GlobalCompanies />
      </Box>

      {/* Block 2 — Problem (dark) */}
      <Box sx={{ background: "#111827", py: { xs: 6, md: 9 } }}>
        <AISpotlight />
      </Box>

      {/* Block 3 — Solution (white) */}
      <Box sx={{ background: "#ffffff", py: { xs: 6, md: 9 } }}>
        <BiasFreeEvaluation />
      </Box>

      {/* Block 4 — Stakes (dark) */}
      <Box sx={{ background: "#111827", py: { xs: 6, md: 9 } }}>
        <StakesSection />
      </Box>

      {/* Block 5 — The Plan / 3 Steps (light grey) */}
      <Box sx={{ background: "#F2F3F4", py: { xs: 6, md: 9 } }}>
        <SolutionsSection />
      </Box>

      {/* Block 6 — Before / After (white) */}
      <Box sx={{ background: "#ffffff", py: { xs: 6, md: 9 } }}>
        <SuccessSection />
      </Box>

      {/* Block 7 — Final CTA (dark) */}
      <Box sx={{ background: "#111827" }}>
        <FinalCTA />
      </Box>

      {/* Block 8 — FAQ (light grey) */}
      <Box sx={{ background: "#F2F3F4" }}>
        <FAQSection />
      </Box>

      {/* Block 9 — Contact (white) */}
      <Box sx={{ background: "#ffffff", py: { xs: 6, md: 9 } }}>
        <ContactSection />
      </Box>

      <Footer />
    </LandingPageLayout>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
});
