import LandingPageLayout from "@/components/home/LandingPageLayout";
import HowItWorksSection from "@/components/home/candidate/HowItWorksSection";
import CandidateRewardsSection from "@/components/home/candidate/CandidateRewardsSection";
import JobListingsSection from "@/components/home/candidate/JobListingsSection";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { setUserType } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

const JobSeekerLanding: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    localStorage.setItem("userType", "candidate");
    dispatch(setUserType("candidate"));
  }, [dispatch]);

  return (
    <LandingPageLayout
      logo="/images/home/logocandidate.png"
      type="candidate"
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
