import HeroSection from "@/components/home-page/HeroSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";
import PartnersSection from "@/components/home-page/PartnersSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from 'next/image';
import { Box, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <>
      <Header logo="/logo.svg" type="company" color="#29D291D4" link="Are you a Job Seeker?" />

      <HeroSection title="Revolutionize Your Hiring with" color="#29D291D4" type="company" subtitle="AI-Powered Intelligence" />

      {/* F6S Top Company AI Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
          background: 'linear-gradient(90deg, #F8FAFF 0%, #E3F2FD 100%)',
          borderRadius: 4,
          my: 4,
          mx: 2,
          boxShadow: '0 4px 32px 0 rgba(44, 62, 80, 0.08)',
          textAlign: 'center',
        }}
      >
        <a href="https://www.f6s.com/talentai.bid" target="_blank" rel="noopener noreferrer">
          <Image
            src="/F6S_Top_Company_AI (Artificial Intelligence).png"
            alt="F6S Top Company AI"
            width={500}
            height={200}
            style={{ borderRadius: 24, background: '#fff', boxShadow: '0 2px 32px #29D29122', width: '100%', height: 'auto', maxWidth: 500, display: 'block', marginBottom: 24, cursor: 'pointer' }}
          />
        </a>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#29D291', mb: 1 }}>
          F6S Top Company AI (Artificial Intelligence)
        </Typography>
        <Typography variant="body1" sx={{ color: '#222', maxWidth: 480 }}>
          Proudly recognized as a top AI company by F6S. Our platform leverages cutting-edge artificial intelligence to transform hiring, matching, and talent development for the future of work.
        </Typography>
      </Box>

      {/* <PartnersSection /> */}
      <FeaturesSection type="company" color="#29D291D4" />
      <SolutionsSection type="company" color="#29D291D4" title="Why Choose" subtitle="From Guesswork to Precision—Redefine How You Hire" />
      <PricingSection />
      <ContactSection type="company" color="#29D291D4" />
      <Footer type="company" />
    </>
  );
};
export default HomePage;
