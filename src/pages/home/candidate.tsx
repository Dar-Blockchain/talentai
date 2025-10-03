import HeroSection from "@/components/home-page/HeroSection";
import HowItWorksSection from "@/components/home-page/HowItWorksSection";
import JobListingsSection from "@/components/home-page/JobListingsSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";
import PartnersSection from "@/components/home-page/PartnersSection";
import ModernFooter from "@/components/home-page/ModernFooter";
import Header from "@/components/Header";
import CareerSection from "@/components/home-page/CareerSection";
import TestimonialsSection from "@/components/home-page/TestimonialsSection";
import FAQSection from "@/components/home-page/FAQSection";

const JobSeekerLanding: React.FC = () => {
  return (
    <>
      <Header logo="/logo-purple.png" type="jobseeker" color="#8310FF" link="Are you hiring?" />

      <HeroSection title="Get Hired" color="#8310FF" type="jobseeker" subtitle="For Who You Really Are." />
      <HowItWorksSection />
      <JobListingsSection />
      {/* <PartnersSection /> */}
      {/* <PricingSection /> */}
      <TestimonialsSection />
      <FAQSection />
      
      <ModernFooter />
    </>
  );
};
export default JobSeekerLanding;
