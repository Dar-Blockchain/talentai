import HeroSection from "@/components/home-page/HeroSection";
import FeaturesSection from "@/components/home-page/FeaturesSection";
import ContactSection from "@/components/home-page/ContactSection";
import PricingSection from "@/components/home-page/PricingSection";
import SolutionsSection from "@/components/home-page/SolutionsSection";
import PartnersSection from "@/components/home-page/PartnersSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CareerSection from "@/components/home-page/CareerSection";
import TestimonialsSection from "@/components/home-page/TestimonialsSection";
import Image from 'next/image';
import { Box, Typography } from '@mui/material';

const JobSeekerLanding: React.FC = () => {
  return (
    <>
      <Header logo="/logojobSeeker.png" type="jobseeker" color="#8310FF" link="Are you hiring?" />

      <HeroSection title="Get Hired" color="#8310FF" type="jobseeker" subtitle="For Who You Really Are." />

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
        <Image
          src="/F6S_Top_Company_AI (Artificial Intelligence).png"
          alt="F6S Top Company AI"
          width={500}
          height={200}
          style={{ borderRadius: 24, background: '#fff', boxShadow: '0 2px 32px #8310FF22', width: '100%', height: 'auto', maxWidth: 500, display: 'block', marginBottom: 24 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8310FF', mb: 1 }}>
          F6S Top Company AI (Artificial Intelligence)
        </Typography>
        <Typography variant="body1" sx={{ color: '#222', maxWidth: 480 }}>
          TalentAI is recognized as a top AI company by F6S. Our platform empowers candidates with AI-driven career tools, smart matching, and verified skills for the future of work.
        </Typography>
      </Box>

      <FeaturesSection type="jobseeker" color="#8310FF" />
      <SolutionsSection type="jobseeker" color="#8310FF" title="How It Works" subtitle="Three steps to unlock career-changing opportunities:" />
      {/* <PricingSection /> */}
      <CareerSection type="jobseeker" color="#8310FF" />
      <TestimonialsSection />
      <PartnersSection />
      <ContactSection type="jobseeker" color="#8310FF26" />
      <Footer type="jobseeker" />
    </>
  );
};
export default JobSeekerLanding;
