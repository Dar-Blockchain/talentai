import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Image from "next/image";

// w is derived from each PNG's real intrinsic size (w/h) scaled to the display height h,
// so the CSS "width: auto" resolves to the same value as the width attribute — mismatching
// it triggers Next.js's "width or height modified, but not the other" warning.
const partners = [
  { src: "/images/supporters/darblockchain.png", alt: "Dar Blockchain", h: 26, w: 101 },
  { src: "/images/supporters/lightency.png", alt: "Lightency", h: 26, w: 96 },
  { src: "/images/supporters/nivdia.png",  alt: "NVIDIA Inception Program", h: 32, w: 74 },
  { src: "/images/supporters/f6s.png",     alt: "F6S #22 Top AI Company", h: 32, w: 168 },
  { src: "/images/supporters/hedera.png",  alt: "Built on Hedera Hashgraph", h: 32, w: 110 },
];

/* Triple so the marquee has enough content to loop seamlessly */
const LOOPED = [...partners, ...partners, ...partners];

const VP   = { once: true, margin: "-40px" };
const ease = [0.22, 1, 0.36, 1] as const;

const ClientsSection: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8">

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.5, ease }}
        className="text-center text-[11px] font-medium uppercase tracking-[2px] text-gray-500 mb-8"
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
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.w}
                  height={logo.h}
                  style={{ height: logo.h, width: logo.w }}
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

export default ClientsSection;
