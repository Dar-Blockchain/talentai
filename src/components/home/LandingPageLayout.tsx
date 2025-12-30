import { Box } from "@mui/material";
import Header from "@/components/layout/Header";
import { ReactNode } from "react";
import CompanyHeroSection from "./company/HeroSection";
import CandidateHeroSection from "./candidate/HeroSection";

interface LandingPageLayoutProps {
  logo: string;
  type: "jobseeker" | "company";
  color: string;
  headerLink: string;
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
    <Box style={backgroundColor ? { backgroundColor } : undefined}>
      <Header logo={logo} type={type} color={color} link={headerLink} />
      {type === "company" && <CompanyHeroSection title={heroTitle} color={color} subtitle={heroSubtitle}/>}
      {type === "jobseeker" &&  <CandidateHeroSection title={heroTitle} color={color} subtitle={heroSubtitle}/>}
      {children}
    </Box>
  );
};

export default LandingPageLayout;

