import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const clients = [
  { name: "Dar Blockchain", logo: "/images/GLOBAL_COMPANIES/DarBlockchain.png" },
  { name: "Lightency",      logo: "/images/GLOBAL_COMPANIES/Lightency.png" },
];
const partners = [
  { logo: "/images/partners/nivdia.png",  alt: "NVIDIA Inception Program" },
  { logo: "/images/partners/F6s.png",     alt: "F6S #22 Top AI Company" },
  { logo: "/images/partners/hedera.png",  alt: "Built on Hedera Hashgraph" },
];

const allLogos = [
  ...clients.map((c) => ({ src: c.logo, alt: c.name, h: 26 })),
  ...partners.map((p) => ({ src: p.logo, alt: p.alt,  h: 32 })),
];

/* Triple so the marquee has enough content to loop seamlessly */
const LOOPED = [...allLogos, ...allLogos, ...allLogos];

const VP   = { once: true, margin: "-40px" };
const ease = [0.22, 1, 0.36, 1] as const;

const GlobalCompanies: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8">

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.5, ease }}
        className="text-center text-[11px] font-medium uppercase tracking-[2px] text-gray-400 mb-8"
      >
        {t("trusted")}
      </motion.p>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VP}
        transition={{ duration: 0.6, delay: 0.15, ease }}
      >
        {/* Edge fades */}
        <div
          className="overflow-hidden relative"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            maskImage:        "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <style>{`
            @keyframes marquee {
              from { transform: translateX(0); }
              to   { transform: translateX(-33.333%); }
            }
          `}</style>

          <div
            className="flex items-center gap-14 w-max"
            style={{ animation: "marquee 22s linear infinite" }}
            onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
            onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
          >
            {LOOPED.map((logo, i) => (
              <div key={i} className="flex-shrink-0 flex items-center">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  style={{ height: logo.h, width: "auto" }}
                  className="object-contain opacity-75 hover:opacity-100 transition-all duration-300"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default GlobalCompanies;
