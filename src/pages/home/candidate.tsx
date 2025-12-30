import LandingPageLayout from "@/components/home/LandingPageLayout";
import HowItWorksSection from "@/components/home/candidate/HowItWorksSection";
import CandidateRewardsSection from "@/components/home/candidate/CandidateRewardsSection";
import JobListingsSection from "@/components/home/candidate/JobListingsSection";
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
      <Footer />
    </LandingPageLayout>
  );
};
export default JobSeekerLanding;
