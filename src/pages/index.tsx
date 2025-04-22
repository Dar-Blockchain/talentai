import Head from "next/head";
import { useEffect, useState } from "react";
import { Geist } from "next/font/google";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import styles from "./Landing.module.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const demoData = [
  { month: "Jan", candidates: 65, placements: 40, revenue: 80 },
  { month: "Feb", candidates: 85, placements: 55, revenue: 100 },
  { month: "Mar", candidates: 120, placements: 75, revenue: 140 },
  { month: "Apr", candidates: 150, placements: 90, revenue: 180 },
  { month: "May", candidates: 180, placements: 110, revenue: 220 },
  { month: "Jun", candidates: 210, placements: 130, revenue: 260 },
];

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } }
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeChart, setActiveChart] = useState('candidates');

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={`${styles.container} ${geist.variable}`}>
      <Head>
        <title>TalentAI - Next-Gen Recruitment Platform</title>
        <meta
          name="description"
          content="Transform your hiring process with AI-powered talent acquisition and management platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <motion.div 
          className={styles.logo}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.logoIcon}>🎯</span>
          TalentAI
        </motion.div>
        <motion.div 
          className={styles.navLinks}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <motion.a 
            href="/signin" 
            className={styles.signInButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.a>
        </motion.div>
      </nav>

      <main>
        <section className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className={styles.heroTag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🚀 The Future of Recruitment is Here
            </motion.div>
            <h1>
              <span className={styles.gradientText}>Revolutionize</span> Your Hiring
              <br />With AI-Powered Intelligence
            </h1>
            <p className={styles.heroParagraph}>
              Experience 3x faster hiring, 90% better candidate matches, and data-driven
              decisions with our advanced AI recruitment platform. Join 1000+ companies
              already transforming their hiring process.
            </p>
            <div className={styles.ctaButtons}>
              <motion.a 
                href="/demo" 
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <span className={styles.buttonIcon}>→</span>
              </motion.a>
              <motion.a 
                href="#demo" 
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
                <span className={styles.buttonIcon}>▶</span>
              </motion.a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Enterprise Clients</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Satisfaction Rate</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>50K+</span>
                <span className={styles.statLabel}>Successful Placements</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={styles.heroChartSection}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className={styles.chartControls}>
              <button 
                className={`${styles.chartButton} ${activeChart === 'candidates' ? styles.active : ''}`}
                onClick={() => setActiveChart('candidates')}
              >
                Candidates
              </button>
              <button 
                className={`${styles.chartButton} ${activeChart === 'placements' ? styles.active : ''}`}
                onClick={() => setActiveChart('placements')}
              >
                Placements
              </button>
              <button 
                className={`${styles.chartButton} ${activeChart === 'revenue' ? styles.active : ''}`}
                onClick={() => setActiveChart('revenue')}
              >
                Revenue
              </button>
            </div>
            {isClient && (
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={demoData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeChart}
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </section>

        <section className={styles.features} id="features">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className={styles.featuresContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className={styles.sectionTitle}
            >
              Powerful Features for Modern Recruitment
            </motion.h2>
            <div className={styles.featureGrid}>
              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 0 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(0)}
              >
                <div className={styles.featureIcon}>🎯</div>
                <h3>AI-Powered Matching</h3>
                <p>Smart algorithms that understand both technical skills and cultural fit</p>
                <motion.a 
                  href="#learn-more"
                  className={styles.featureLink}
                  whileHover={{ x: 5 }}
                >
                  Learn more →
                </motion.a>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 1 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(1)}
              >
                <div className={styles.featureIcon}>📊</div>
                <h3>Advanced Analytics</h3>
                <p>Real-time insights and predictive analytics for informed decisions</p>
                <motion.a 
                  href="#learn-more"
                  className={styles.featureLink}
                  whileHover={{ x: 5 }}
                >
                  Learn more →
                </motion.a>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 2 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(2)}
              >
                <div className={styles.featureIcon}>⚡</div>
                <h3>Smart Automation</h3>
                <p>Streamline your recruitment workflow with intelligent automation</p>
                <motion.a 
                  href="#learn-more"
                  className={styles.featureLink}
                  whileHover={{ x: 5 }}
                >
                  Learn more →
                </motion.a>
              </motion.div>

              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 3 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(3)}
              >
                <div className={styles.featureIcon}>🔄</div>
                <h3>Seamless Integration</h3>
                <p>Connect with your existing tools and workflows effortlessly</p>
                <motion.a 
                  href="#learn-more"
                  className={styles.featureLink}
                  whileHover={{ x: 5 }}
                >
                  Learn more →
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className={styles.testimonials}>
          <motion.div
            className={styles.testimonialsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className={styles.sectionTitle}
            >
              What Our Clients Say
            </motion.h2>
            <div className={styles.testimonialGrid}>
              <motion.div 
                className={styles.testimonialCard}
                variants={fadeInUp}
              >
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p>"TalentAI has transformed our hiring process. We've reduced our time-to-hire by 60% and found amazing candidates that perfectly match our culture."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>SG</div>
                  <div>
                    <h4>Sarah Green</h4>
                    <p>HR Director, TechCorp</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className={styles.testimonialCard}
                variants={fadeInUp}
              >
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p>"The AI-powered matching is incredibly accurate. We've seen a 45% improvement in candidate quality and retention rates since using TalentAI."</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>MR</div>
                  <div>
                    <h4>Michael Rodriguez</h4>
                    <p>Talent Acquisition Lead, InnovateCo</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className={styles.testimonialCard}
                variants={fadeInUp}
              >
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p>"The analytics and insights provided by TalentAI have been game-changing for our recruitment strategy. Highly recommended!"</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>EL</div>
                  <div>
                    <h4>Emma Lewis</h4>
                    <p>CEO, GrowthStart</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className={styles.cta}>
          <motion.div 
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.ctaTag}>Ready to Get Started? 🚀</span>
            <h2>Transform Your Hiring Today</h2>
            <p>Join thousands of companies already hiring smarter with TalentAI</p>
            <div className={styles.ctaButtons}>
              <motion.button 
                className={styles.ctaPrimaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button 
                className={styles.ctaSecondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <span className={styles.logoIcon}>🎯</span>
              TalentAI
            </div>
            <p>Revolutionizing talent acquisition with AI</p>
            <div className={styles.socialLinks}>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={styles.socialIcon}
              >
                LinkedIn
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={styles.socialIcon}
              >
                Twitter
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={styles.socialIcon}
              >
                Facebook
              </motion.a>
            </div>
          </div>
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Solutions</a>
              <a href="#">Pricing</a>
              <a href="#">Case Studies</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Help Center</a>
              <a href="#">Community</a>
              <a href="#">Partners</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Contact</h4>
              <p>hello@talentai.com</p>
              <p>+1 (555) 123-4567</p>
              <p>123 Innovation Drive</p>
              <p>San Francisco, CA 94107</p>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 TalentAI. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
