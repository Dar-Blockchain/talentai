import LandingPageLayout from "@/components/features/home/LandingPageLayout";
import HowItWorksSection from "@/components/features/home/candidate/HowItWorksSection";
import CandidateRewardsSection from "@/components/features/home/candidate/CandidateRewardsSection";
import JobListingsSection from "@/components/features/home/candidate/JobListingsSection";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { setUserType } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import dynamic from 'next/dynamic';
import { useRouter } from "next/router";

const JobSeekerLanding: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
};

export default dynamic(() => Promise.resolve(JobSeekerLanding), {
  ssr: false
});
