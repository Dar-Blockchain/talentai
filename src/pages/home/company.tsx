import HeroSection from "@/components/home-page/HeroSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";
import PartnersSection from "@/components/home-page/PartnersSection";
import AISpotlight from "@/components/home-page/AISpotlight";
import GlobalCompanies from "@/components/home-page/GlobalCompanies";
import BiasFreeEvaluation from "@/components/home-page/BiasFreeEvaluation";
import Testimonials from "@/components/home-page/Testimonials";
import FindSection from "@/components/home-page/FindSection";
import ManageSection from "@/components/home-page/ManageSection";
import AutomateSection from "@/components/home-page/AutomateSection";
import IntegrationsSection from "@/components/home-page/IntegrationsSection";
import AccoladesSection from "@/components/home-page/AccoladesSection";
import FinalPricingCTA from "@/components/home-page/FinalPricingCTA";
import Footer  from "@/components/home-page/Footer";
import Header from "@/components/Header";

const HomePage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#EFF0F0' }}>
      <Header logo="/logo.svg" type="company" color="#29D291D4" link="Are you a Job Seeker?" />

      <HeroSection title="Revolutionize Your Hiring with" color="#29D291D4" type="company" subtitle="AI-Powered Intelligence" />
      <AccoladesSection />
      <AISpotlight />
      <GlobalCompanies />
      <BiasFreeEvaluation />
      <Testimonials />
      <FindSection />
      <AutomateSection />

      <ManageSection />
      <IntegrationsSection />
      {/* <PartnersSection /> */}
      {/* <FeaturesSection type="company" color="#29D291D4" />
      <SolutionsSection type="company" color="#29D291D4" title="Why Choose" subtitle="From Guesswork to Precision—Redefine How You Hire" />
      <PricingSection />
      <ContactSection type="company" color="#29D291D4" />
       <Footer type="company" /> */}
      <FinalPricingCTA />
      <Footer />
    </div>
  );
};
export default HomePage;
