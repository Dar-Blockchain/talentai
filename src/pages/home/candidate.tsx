import LandingPageLayout from "@/components/home-page/LandingPageLayout";
import HowItWorksSection from "@/components/home-page/HowItWorksSection";
import CandidateRewardsSection from "@/components/home-page/CandidateRewardsSection";
import JobListingsSection from "@/components/home-page/JobListingsSection";
import ModernFooter from "@/components/home-page/ModernFooter";
import TestimonialsSection from "@/components/home-page/TestimonialsSection";
import FAQSection from "@/components/home-page/FAQSection";
import Footer from "@/components/layout/Footer";

const JobSeekerLanding: React.FC = () => {
  return (
    <LandingPageLayout
      logo="/images/home/logocandidate.png"
      type="jobseeker"
      color="#8310FF"
      headerLink="Are you hiring?"
      heroTitle="Get Hired"
      heroSubtitle="For Who You Really Are"
    >
      <HowItWorksSection />
      <CandidateRewardsSection />
      <JobListingsSection />
      {/* <TestimonialsSection /> */}
      {/* <FAQSection type="candidate"/> */}
      {/* <ModernFooter /> */}
      <Footer />

    </LandingPageLayout>
  );
};
export default JobSeekerLanding;
