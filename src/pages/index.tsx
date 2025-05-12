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
import { partners } from "../data/partners";
import partnerStyles from "../styles/Partners.module.css";
import { useRouter } from "next/router";
import footerStyles from "../styles/Footer.module.css";

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

const features = [
  {
    title: "AI-Powered Candidate Matching",
    description: "Our advanced algorithms analyze thousands of data points to find the perfect match for your open positions.",
    icon: "🤖"
  },
  {
    title: "Automated Screening",
    description: "Save hours of manual work with our intelligent resume screening and initial candidate assessment.",
    icon: "⚡"
  },
  {
    title: "Predictive Analytics",
    description: "Make data-driven hiring decisions with our predictive analytics and performance insights.",
    icon: "📊"
  },
  {
    title: "Collaborative Hiring",
    description: "Streamline your hiring process with real-time collaboration tools for your entire team.",
    icon: "👥"
  }
];

const metrics = [
  {
    title: "Time to Hire",
    value: "3x",
    description: "Faster than traditional methods",
    trend: "↑",
    color: "#02E2FF"
  },
  {
    title: "Candidate Quality",
    value: "90%",
    description: "Better match rate",
    trend: "↑",
    color: "#00FFC3"
  },
  {
    title: "Cost Savings",
    value: "50%",
    description: "Reduced hiring costs",
    trend: "↓",
    color: "#02E2FF"
  },
  {
    title: "Team Productivity",
    value: "75%",
    description: "More efficient process",
    trend: "↑",
    color: "#00FFC3"
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "HR Director",
    image: "👩‍💼",
    quote: "TalentAI has revolutionized our hiring process. We've reduced our time-to-hire by 60% and improved candidate quality significantly.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Talent Acquisition Lead",
    image: "👨‍💼",
    quote: "The AI-powered matching is incredibly accurate. We're seeing a 90% success rate in our new hires.",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Recruitment Manager",
    image: "👩‍💼",
    quote: "The collaborative features have made our hiring process so much smoother. Our team can now make decisions faster and more effectively.",
    rating: 5
  }
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$299",
    period: "per month",
    description: "Perfect for small teams getting started with AI recruitment",
    features: [
      "Up to 10 job postings",
      "Basic AI matching",
      "Resume screening",
      "Email support",
      "Basic analytics"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$800",
    period: "per month",
    description: "For growing teams that need advanced features",
    features: [
      "Unlimited job postings",
      "Advanced AI matching",
      "Automated screening",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
      "Custom workflows"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    description: "For large organizations with complex needs",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom AI models",
      "API access",
      "SLA guarantee",
      "On-premise deployment",
      "Custom integrations"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Post Your Job",
    description: "Create detailed job descriptions and requirements. Our AI will analyze them to understand your needs.",
    icon: "📝"
  },
  {
    step: "2",
    title: "AI Screening",
    description: "Our AI automatically screens and ranks candidates based on their skills, experience, and cultural fit.",
    icon: "🤖"
  },
  {
    step: "3",
    title: "Smart Matching",
    description: "Get the best matches for your roles with our advanced matching algorithm.",
    icon: "🎯"
  },
  {
    step: "4",
    title: "Collaborate & Hire",
    description: "Work with your team to review candidates and make the final hiring decision.",
    icon: "👥"
  }
];

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeChart, setActiveChart] = useState('candidates');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Check for token in localStorage or cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;

    if (token) {
      router.replace('/preferences');
    }
  }, [router]);

  // Ocean bubbles generation
  useEffect(() => {
    const generateBubble = () => {
      const size = Math.random() * 20 + 10;
      const newBubble = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + size,
        size: size
      };

      setBubbles(prev => [...prev, newBubble]);

      setTimeout(() => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
      }, 4000);
    };

    const interval = setInterval(generateBubble, 1000);
    return () => clearInterval(interval);
  }, []);

  // Custom cursor movement with wave effect
  useEffect(() => {
    let lastUpdate = 0;
    const updateInterval = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < updateInterval) return;
      lastUpdate = now;

      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll animations with smoother transitions
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);

      const elements = document.querySelectorAll('.scrollReveal');
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.75;

        if (isVisible) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`${styles.container} ${geist.variable}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Ocean Waves */}
      <div className={styles.oceanWaves}>
        <div className={styles.wave} />
        <div className={styles.wave} />
        <div className={styles.wave} />
      </div>

      {/* Light Reflection */}
      <div className={styles.reflection} />

      {/* Ocean Bubbles */}
      <div className={styles.cursorTrail}>
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className={styles.bubble}
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
          />
        ))}
      </div>

      {/* Custom Cursor */}
      <div
        className={`${styles.customCursor} ${isHovering ? styles.hover : ''}`}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: `translate(-50%, -50%)`
        }}
      />

      <Head>
        <title>TalentAI - Next-Gen Recruitment Platform</title>
        <meta
          name="description"
          content="Transform your hiring process with AI-powered talent acquisition and management platform"
        />
        <link rel="icon" href="/talentaifavicon.ico" />
        <link rel="apple-touch-icon" href="/talentaifavicon.ico" />
        <link rel="shortcut icon" href="/talentaifavicon.ico" />
      </Head>

      <nav className={`${styles.nav} scrollReveal`}>
        <motion.div
          className={styles.logo}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="/talentai.png"
            alt="TalentAI Logo"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />
        </motion.div>
        <motion.div
          className={styles.navLinks}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a> */}
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
        <section className={`${styles.hero} scrollReveal`}>
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
                href="/signin"
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <span className={styles.buttonIcon}>→</span>
              </motion.a>
              <motion.a
                href="/signin"
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
                <span className={styles.buttonIcon}>▶</span>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className={styles.metricsContainer}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.metricsGrid}>
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    className={styles.metricCard}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className={styles.metricValue} style={{ color: metric.color }}>
                      {metric.value}
                      <span className={styles.metricTrend}>{metric.trend}</span>
                    </div>
                    <h4 className={styles.metricTitle}>{metric.title}</h4>
                    <p className={styles.metricDescription}>{metric.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className={`${styles.features} scrollReveal`}>
          <div className={styles.featuresContainer}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Powerful Features for Modern Recruitment
            </motion.h2>
            <div className={styles.featureGrid}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.benefits} scrollReveal`}>
          <div className={styles.benefitsContainer}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose TalentAI?
            </motion.h2>
            <div className={styles.benefitsGrid}>
              <motion.div
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className={styles.benefitValue}>90%</div>
                <h3 className={styles.benefitTitle}>Better Candidate Matches</h3>
                <p className={styles.benefitDesc}>Our AI algorithms ensure you find the perfect candidate for every role</p>
              </motion.div>
              <motion.div
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.benefitValue}>3x</div>
                <h3 className={styles.benefitTitle}>Faster Hiring Process</h3>
                <p className={styles.benefitDesc}>Automate repetitive tasks and focus on what matters most</p>
              </motion.div>
              <motion.div
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.benefitValue}>50%</div>
                <h3 className={styles.benefitTitle}>Cost Reduction</h3>
                <p className={styles.benefitDesc}>Save on recruitment costs with our efficient platform</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className={`${styles.pricing} scrollReveal`}>
          <div className={styles.pricingContainer}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <p className={styles.pricingSubtitle}>
              Choose the plan that's right for your team. All plans include a 14-day free trial.
            </p>
            <div className={styles.pricingGrid}>
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={index}
                  className={`${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {tier.popular && <div className={styles.popularBadge}>Most Popular</div>}
                  <div className={styles.pricingHeader}>
                    <h3>{tier.name}</h3>
                    <div className={styles.price}>
                      <span className={styles.priceAmount}>{tier.price}</span>
                      <span className={styles.pricePeriod}>{tier.period}</span>
                    </div>
                    <p className={styles.pricingDescription}>{tier.description}</p>
                  </div>
                  <ul className={styles.featuresList}>
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>
                        <span className={styles.checkIcon}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.a
                    href={tier.cta === "Contact Sales" ? "#contact" : "/signup"}
                    className={`${styles.pricingButton} ${tier.popular ? styles.popularButton : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tier.cta}
                  </motion.a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* <section className={`${styles.testimonials} scrollReveal`}>
          <div className={styles.testimonialsContainer}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              What Our Clients Say
            </motion.h2>
            <div className={styles.testimonialsGrid}>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className={styles.testimonialCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.testimonialContent}>
                    <div className={styles.testimonialHeader}>
                      <div className={styles.testimonialImage}>
                        {testimonial.image}
                      </div>
                      <div className={styles.testimonialInfo}>
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.role}</p>
                      </div>
                    </div>
                    <p className={styles.testimonialQuote}>"{testimonial.quote}"</p>
                    <div className={styles.testimonialRating}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        <section className={`${partnerStyles.partnersSection} scrollReveal`}>
          <div className={partnerStyles.partnersContainer}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={partnerStyles.sectionHeader}
            >
              <h2>Our Trusted Partners</h2>
              <p>Working with industry leaders to transform talent acquisition</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className={partnerStyles.partnersGrid}
            >
              {partners.map((partner) => (
                <motion.div
                  key={partner.name}
                  variants={fadeInUp}
                  className={partnerStyles.partnerCard}
                  data-partner={partner.name}
                >
                  <div className={partnerStyles.partnerLogo}>
                    {partner.isImage ? (
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className={partnerStyles.partnerLogoImg}
                      />
                    ) : (
                      partner.logo
                    )}
                  </div>
                  {/* <h3>{partner.name}</h3> */}
                  <p>{partner.description}</p>
                  <span className={partnerStyles.partnerCategory}>{partner.category}</span>
                </motion.div>
              ))}
            </motion.div>
            <div className={partnerStyles.scrollIndicator} />
          </div>
        </section>

        <section className={`${styles.cta} scrollReveal`}>
          <div className={styles.ctaContent}>
            <motion.div
              className={styles.ctaTag}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Hiring?
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Start Your Free Trial Today
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Join thousands of companies already using TalentAI to revolutionize their hiring process
            </motion.p>
            <motion.div
              className={styles.ctaButtons}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.a
                href="/signin"
                className={styles.ctaPrimaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <span className={styles.buttonIcon}>→</span>
              </motion.a>
              <motion.a
                href="#demo"
                className={styles.ctaSecondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
                <span className={styles.buttonIcon}>▶</span>
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className={`${footerStyles.footer} scrollReveal`}>
        <div className={footerStyles.footerContent}>
          <div className={footerStyles.footerLeft}>
            <div className={footerStyles.footerLogo}>
              <img
                src="/talentai.png"
                alt="TalentAI Logo"
                style={{ height: '50px', width: 'auto', borderRadius: '12px' }}
              />
            </div>
            <div className={footerStyles.inspiringMessage}>
              Empowering organizations to discover, hire, and grow the world's best talent with AI-driven precision and heart.
            </div>
          </div>
          <div className={footerStyles.footerRight}>
            <div className={footerStyles.footerLinks}>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
            <div className={footerStyles.socialLinks}>
              <a href="mailto:contact@talentai.bid" className={footerStyles.socialIcon} aria-label="Email" title="Email">
                {/* Email Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="24" height="24" rx="12" fill="none"/><path d="M4 6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v10.4A2.8 2.8 0 0 1 17.2 20H6.8A2.8 2.8 0 0 1 4 17.2V6.8Zm2.1.7 5.9 5.1 5.9-5.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.5 7.5 13 13.5a2 2 0 0 1-2.6 0L4.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="https://pitch.talentai.bid/" target="_blank" rel="noopener noreferrer" className={footerStyles.socialIcon} aria-label="Pitch Deck" title="Pitch Deck">
                {/* Link Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="24" height="24" rx="12" fill="none"/><path d="M14.828 9.172a4 4 0 0 1 0 5.656l-3.535 3.535a4 4 0 0 1-5.657-5.657l1.414-1.414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.172 14.828a4 4 0 0 1 0-5.656l3.535-3.535a4 4 0 0 1 5.657 5.657l-1.414 1.414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="https://www.youtube.com/@TalentAi-w3p" target="_blank" rel="noopener noreferrer" className={footerStyles.socialIcon} aria-label="YouTube" title="YouTube">
                {/* YouTube Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="24" height="24" rx="12" fill="none"/><path d="M21.8 8.001a2.75 2.75 0 0 0-1.934-1.944C18.01 5.5 12 5.5 12 5.5s-6.01 0-7.866.557A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.934 1.944C5.99 18.5 12 18.5 12 18.5s6.01 0 7.866-.557A2.75 2.75 0 0 0 21.8 15.999 28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999Z" stroke="currentColor" strokeWidth="1.5"/><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="currentColor"/></svg>
              </a>
              <a href="#" className={footerStyles.socialIcon} aria-label="Twitter" title="Twitter">
                {/* Twitter Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="24" height="24" rx="12" fill="none"/><path d="M22 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.965-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 11.5 9.5c0 .352.04.695.116 1.022C7.728 10.37 4.1 8.6 1.671 5.965c-.386.663-.607 1.434-.607 2.26 0 1.56.795 2.936 2.005 3.744a4.48 4.48 0 0 1-2.03-.56v.057c0 2.18 1.553 4.002 3.617 4.417-.378.104-.776.16-1.187.16-.29 0-.57-.028-.844-.08.57 1.78 2.223 3.078 4.183 3.113A8.98 8.98 0 0 1 2 19.07a12.7 12.7 0 0 0 6.88 2.017c8.26 0 12.785-6.84 12.785-12.785 0-.195-.004-.39-.013-.583A9.14 9.14 0 0 0 24 4.59a8.98 8.98 0 0 1-2.6.713Z" stroke="currentColor" strokeWidth="1.5"/></svg>
              </a>
              <a href="#" className={footerStyles.socialIcon} aria-label="LinkedIn" title="LinkedIn">
                {/* LinkedIn Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="24" height="24" rx="12" fill="none"/><path d="M6.94 7.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88ZM7.5 9.5v7M12 13.5v3M12 9.5v1.5m0 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5v3c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5v-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#" className={footerStyles.socialIcon} aria-label="GitHub" title="GitHub">
                {/* GitHub Icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="24" height="24" rx="12" fill="none"/><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.34-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.687-4.566 4.936.36.31.68.921.68 1.857 0 1.34-.012 2.422-.012 2.752 0 .268.18.579.688.481C19.135 20.163 22 16.417 22 12c0-5.523-4.477-10-10-10Z" stroke="currentColor" strokeWidth="1.5"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className={footerStyles.footerBottom}>
          &copy; {new Date().getFullYear()} TalentAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
