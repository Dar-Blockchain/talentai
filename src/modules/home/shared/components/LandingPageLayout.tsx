import Header from "@/modules/shared/layouts/home/HomeHeader";
import { ReactNode } from "react";
import Footer from "@/modules/shared/layouts/home/HomeFooter";

interface LandingPageLayoutProps {
  children: ReactNode;
}

const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({ children }) => {
  return (
    <div className="bg-[#F2F4F7]">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default LandingPageLayout;
