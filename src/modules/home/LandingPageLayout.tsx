import Header from "@/modules/shared/layouts/home/HomeHeader";
import { ReactNode } from "react";
import CompanyHeroSection   from "./company/HeroSection";

interface LandingPageLayoutProps {
  type: "candidate" | "company";
  children: ReactNode;
}

const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({
  type, children,
}) => {
  return (
    <div className="bg-[#F2F4F7]">
      <Header />
      {type === "company"   && <CompanyHeroSection />}
      {children}
    </div>
  );
};

export default LandingPageLayout;
