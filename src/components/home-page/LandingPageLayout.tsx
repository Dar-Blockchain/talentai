import { Box } from "@mui/material";
import Header from "@/components/Header";
import HeroSection from "@/components/home-page/HeroSection";
import { ReactNode } from "react";

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
      <HeroSection title={heroTitle} color={color} type={type} subtitle={heroSubtitle} />
      {children}
    </Box>
  );
};

export default LandingPageLayout;

