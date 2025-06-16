import HeroSection from "@/components/home-page/HeroSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";
import PartnersSection from "@/components/home-page/PartnersSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const HomePage: React.FC = () => {
  return (
    <>
      <Header logo="/logo.svg" type="company" color="#29D291D4" link="Are you a Job Seeker?" />

      <HeroSection title="Revolutionize Your Hiring with" color="#29D291D4" type="company" subtitle="AI-Powered Intelligence" />
      {/* <PartnersSection /> */}
      <FeaturesSection type="company" color="#29D291D4" />
      <SolutionsSection type="company" color="#29D291D4" title="Why Choose" subtitle="From Guesswork to Precision—Redefine How You Hire" />
      <PricingSection />
      <ContactSection type="company" color="#29D291D4" />
      <Footer type="company" />
    </>
  );
};
export default HomePage;
