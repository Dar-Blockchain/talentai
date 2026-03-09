import LandingPageLayout from "@/components/home/LandingPageLayout";
import AISpotlight from "@/components/home/company/AISpotlight";
import GlobalCompanies from "@/components/home/company/GlobalCompanies";
import BiasFreeEvaluation from "@/components/home/company/BiasFreeEvaluation";
import Footer from "@/components/layout/Footer";
import SolutionsSection from "@/components/home/company/HowItWorksSection";
import ContactSection from "@/components/home/company/ContactSection";
import { useEffect } from "react";
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
      color="#29D291D4"
      headerLink="Are you a Job Seeker?"
      heroTitle="Revolutionize Your Hiring with"
      heroSubtitle="AI-Powered Intelligence"
      backgroundColor="#EFF0F0"
    >
      <GlobalCompanies />
      <AISpotlight />
      <BiasFreeEvaluation />
      <SolutionsSection />
      <ContactSection />
      <Footer />
    </LandingPageLayout>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
});
