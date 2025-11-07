import LandingPageLayout from "@/components/home-page/LandingPageLayout";
import AISpotlight from "@/components/home-page/AISpotlight";
import GlobalCompanies from "@/components/home-page/GlobalCompanies";
import BiasFreeEvaluation from "@/components/home-page/BiasFreeEvaluation";
import Testimonials from "@/components/home-page/Testimonials";
import FindSection from "@/components/home-page/FindSection";
import ManageSection from "@/components/home-page/ManageSection";
import AutomateSection from "@/components/home-page/AutomateSection";
import AccoladesSection from "@/components/home-page/AccoladesSection";
import FinalPricingCTA from "@/components/home-page/FinalPricingCTA";
import Footer from "@/components/home-page/Footer";
import FAQSection from "@/components/home-page/FAQSection";
import SolutionsSection from "@/components/home-page/company/HowItWorksSection";

const HomePage: React.FC = () => {
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
      <AccoladesSection />
      <AISpotlight />
      <GlobalCompanies />
      <BiasFreeEvaluation />
      <SolutionsSection/>
      {/* <Testimonials /> */}
      {/* <FAQSection type="company"/> */}
      
      {/* <FindSection /> */}
      {/* <AutomateSection /> */}
      {/* <ManageSection /> */}
      {/* <FinalPricingCTA /> */}
      <Footer />
    </LandingPageLayout>
  );
};
export default HomePage;
