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
      <Header />

      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <SolutionsSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </>
  );
};
export default HomePage;
