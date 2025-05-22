import HeroSection from "@/components/home-page/HeroSection";
import HiringSolutionSection from "@/components/home-page/HiringSolutionSection";
import JoinUsSection from "@/components/home-page/JoinUsSection";
import PricingSection from "@/components/home-page/PricingSection";
import WhyUsSection from "@/components/home-page/WhyUsSection";

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <HiringSolutionSection/>
      <WhyUsSection />
      <PricingSection />
      <JoinUsSection />
    </>
  );
};
export default HomePage;
