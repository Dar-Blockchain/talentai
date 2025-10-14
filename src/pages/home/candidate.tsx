import { Box } from "@mui/material";
import HeroSection from "@/components/home-page/HeroSection";
import HowItWorksSection from "@/components/home-page/HowItWorksSection";
import JobListingsSection from "@/components/home-page/JobListingsSection";
import ModernFooter from "@/components/home-page/ModernFooter";
import Header from "@/components/Header";
import TestimonialsSection from "@/components/home-page/TestimonialsSection";
import FAQSection from "@/components/home-page/FAQSection";

const JobSeekerLanding: React.FC = () => {
  return (
    <Box>
      <Header logo="/images/jobseeker_landing/TalentAiPurpleHome.png" type="jobseeker" color="#8310FF" link="Are you hiring?" />
      <HeroSection title="Get Hired" color="#8310FF" type="jobseeker" subtitle="For Who You Really Are." />
      <HowItWorksSection />
      <JobListingsSection />
      <TestimonialsSection />
      <FAQSection />
      <ModernFooter />
    </Box>
  );
};
export default JobSeekerLanding;
