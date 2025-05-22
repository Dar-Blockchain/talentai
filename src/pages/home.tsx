import HeroSection from "@/components/home-page/HeroSection";
import HiringSolutionSection from "@/components/home-page/HiringSolutionSection";
import WhyUsSection from "@/components/home-page/WhyUsSection";

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <HiringSolutionSection/>
      <WhyUsSection />
    </>
  );
};
export default HomePage;
