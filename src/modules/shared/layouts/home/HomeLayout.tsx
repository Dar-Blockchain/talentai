import React from "react";
import HomeHeader from "./HomeHeader";
import HomeFooter from "./HomeFooter";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => (
  <>
    <HomeHeader />
    <main>{children}</main>
    <HomeFooter />
  </>
);

export default HomeLayout;
