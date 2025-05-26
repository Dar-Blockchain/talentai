import HeroSection from "@/components/home-page/HeroSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection/>
      <SolutionsSection />
      <PricingSection />
      <ContactSection />
    </>
  );
};
export default HomePage;
