import { Box } from "@mui/material";
import Header from "@/components/layout/Header";
import { ReactNode } from "react";
import CompanyHeroSection from "./company/HeroSection";
import CandidateHeroSection from "./candidate/HeroSection";
import PageContainer from '@/components/layout/PageContainer'

interface LandingPageLayoutProps {
  logo: string;
  type: "candidate" | "company";
  color: string;
  headerLink?: string;
  heroTitle: string;
  heroSubtitle: string;
  backgroundColor?: string;
  children: ReactNode;
}

const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({
  logo,
  type,
  color,
  headerLink,
  heroTitle,
  heroSubtitle,
  backgroundColor,
  children,
}) => {
  return (
    <Box sx={backgroundColor ? { backgroundColor } : undefined}>
      <Header />
      {type === "company" && <CompanyHeroSection />}
      {type === "candidate" &&  <CandidateHeroSection title={heroTitle} color={color} subtitle={heroSubtitle}/>}
      {children}
    </Box>
  );
};

export default LandingPageLayout;

