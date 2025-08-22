import HeroSection from "@/components/home-page/HeroSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";
import PartnersSection from "@/components/home-page/PartnersSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CareerSection from "@/components/home-page/CareerSection";
import TestimonialsSection from "@/components/home-page/TestimonialsSection";

const JobSeekerLanding: React.FC = () => {
  return (
    <>
      <Header logo="/logojobSeeker.png" type="jobseeker" color="#8310FF" link="Are you hiring?" />

      <HeroSection title="Get Hired" color="#8310FF" type="jobseeker" subtitle="For Who You Really Are." />
      {/* <PartnersSection /> */}
      <FeaturesSection type="jobseeker" color="#8310FF" />
      <SolutionsSection type="jobseeker" color="#8310FF" title="How It Works" subtitle="Three steps to unlock career-changing opportunities:" />
      {/* <PricingSection /> */}
      <CareerSection type="jobseeker" color="#8310FF" />
      <TestimonialsSection />
      <PartnersSection />
      <ContactSection type="jobseeker" color="#8310FF26" />
      <Footer type="jobseeker" />
    </>
  );
};
export default JobSeekerLanding;
