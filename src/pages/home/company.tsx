import HeroSection from "@/components/home-page/HeroSection";

import AISpotlight from "@/components/home-page/AISpotlight";
import GlobalCompanies from "@/components/home-page/GlobalCompanies";
import BiasFreeEvaluation from "@/components/home-page/BiasFreeEvaluation";
import Testimonials from "@/components/home-page/Testimonials";
import FindSection from "@/components/home-page/FindSection";
import ManageSection from "@/components/home-page/ManageSection";
import AutomateSection from "@/components/home-page/AutomateSection";
import AccoladesSection from "@/components/home-page/AccoladesSection";
import FinalPricingCTA from "@/components/home-page/FinalPricingCTA";
import Footer  from "@/components/home-page/Footer";
import Header from "@/components/Header";

const HomePage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#EFF0F0' }}>
      <Header logo="/images/home/TalentaiCompany.svg" type="company" color="#29D291D4" link="Are you a Job Seeker?" />

      <HeroSection title="Revolutionize Your Hiring with" color="#29D291D4" type="company" subtitle="AI-Powered Intelligence" />
      <AccoladesSection />
      <AISpotlight />
      <GlobalCompanies />
      <BiasFreeEvaluation />
      <Testimonials />
      <FindSection />
      <AutomateSection />
      <ManageSection />
      <FinalPricingCTA />
      <Footer />
    </div>
  );
};
export default HomePage;
