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
  { month: "Jan", candidates: 65, placements: 40 },
  { month: "Feb", candidates: 85, placements: 55 },
  { month: "Mar", candidates: 120, placements: 75 },
  { month: "Apr", candidates: 150, placements: 90 },
  { month: "May", candidates: 180, placements: 110 },
  { month: "Jun", candidates: 210, placements: 130 },
];

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={`${styles.container} ${geist.variable}`}>
      <Head>
        <title>TalentAI - Revolutionizing Talent Acquisition</title>
        <meta
          name="description"
          content="Next-generation AI-powered talent acquisition and management platform"
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
          TalentAI
        </motion.div>
        <motion.div 
          className={styles.navLinks}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/signin" className={styles.signInButton}>
            Sign In
          </a>
        </motion.div>
      </nav>

      <main>
        <section className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1>
              <span className={styles.gradientText}>Transform</span> Your Hiring
              <br />With AI-Powered Intelligence
            </h1>
            <p>
              Experience the future of recruitment with our advanced AI platform.
              Streamline your hiring process, find perfect matches, and make data-driven
              decisions with unprecedented accuracy.
            </p>
            <div className={styles.ctaButtons}>
              <motion.a 
                href="/signin" 
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.a>
              <motion.a 
                href="#demo" 
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.a>
            </div>
            <div className={styles.trustBadges}>
              <span>Trusted by leading companies worldwide</span>
              <div className={styles.companyLogos}>
                {/* Add company logo placeholders */}
                <div className={styles.logoPlaceholder}></div>
                <div className={styles.logoPlaceholder}></div>
                <div className={styles.logoPlaceholder}></div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className={styles.heroChart}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {isClient && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={demoData}>
                  <defs>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="candidates"
                    stroke="#8884d8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCandidates)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </section>

        <section className={styles.features} id="features">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
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
                <p>Advanced algorithms that understand both technical skills and cultural fit</p>
              </motion.div>
              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 1 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(1)}
              >
                <div className={styles.featureIcon}>📊</div>
                <h3>Smart Analytics</h3>
                <p>Real-time insights and predictive analytics for better decision making</p>
              </motion.div>
              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 2 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(2)}
              >
                <div className={styles.featureIcon}>⚡</div>
                <h3>Automated Workflow</h3>
                <p>Streamline your recruitment process with intelligent automation</p>
              </motion.div>
              <motion.div 
                className={`${styles.featureCard} ${activeFeature === 3 ? styles.active : ''}`}
                variants={fadeInUp}
                onHoverStart={() => setActiveFeature(3)}
              >
                <div className={styles.featureIcon}>🔄</div>
                <h3>Seamless Integration</h3>
                <p>Connect with your existing tools and workflows effortlessly</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className={styles.stats}>
          <motion.div 
            className={styles.statsContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className={styles.sectionTitle}
            >
              Proven Results
            </motion.h2>
            <div className={styles.statsGrid}>
              <motion.div 
                className={styles.statCard}
                variants={fadeInUp}
              >
                <div className={styles.statValue}>50%</div>
                <p>Faster Hiring Process</p>
                <div className={styles.statDetail}>Average time-to-hire reduced by half</div>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                variants={fadeInUp}
              >
                <div className={styles.statValue}>90%</div>
                <p>Match Accuracy</p>
                <div className={styles.statDetail}>AI-powered candidate matching precision</div>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                variants={fadeInUp}
              >
                <div className={styles.statValue}>2x</div>
                <p>Quality of Hire</p>
                <div className={styles.statDetail}>Double the successful placements</div>
              </motion.div>
            </div>
          </motion.div>
          <motion.div 
            className={styles.statsChart}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {isClient && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="placements"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
            <h2>Ready to Transform Your Hiring?</h2>
            <p>Join thousands of companies already hiring smarter with TalentAI</p>
            <motion.button 
              className={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
          </motion.div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>TalentAI</h4>
            <p>Revolutionizing talent acquisition with AI</p>
            <div className={styles.socialLinks}>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                LinkedIn
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Twitter
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Facebook
              </motion.a>
            </div>
          </div>
          <div className={styles.footerSection}>
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Case Studies</a>
            <a href="#">Documentation</a>
          </div>
          <div className={styles.footerSection}>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Press Kit</a>
          </div>
          <div className={styles.footerSection}>
            <h4>Contact</h4>
            <p>contact@talentai.com</p>
            <p>+1 (555) 123-4567</p>
            <p>123 AI Street, Tech City</p>
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
