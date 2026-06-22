import ProcessStepper from "./ProcessStepper";
import { motion }      from "framer-motion";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";

const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const HowItWorksSection = () => {
  const { t } = useTranslation("home");

  return (
    <div id="howitworks" className="max-w-[1200px] mx-auto px-4 md:px-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={VP} transition={{ duration: 0.6, ease }}
        className="text-center mb-10 sm:mb-14 md:mb-18"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.07] border border-primary/20 px-4 py-1.5 mb-5">
          <Zap className="size-3 text-primary" />
          <span className="text-[11.5px] font-bold text-primary uppercase tracking-[0.9px]">
            {t("plan.overline")}
          </span>
        </div>

        <h2 className="font-extrabold text-[28px] sm:text-[38px] md:text-[52px] leading-[1.08] tracking-[-0.5px] md:tracking-[-1.5px] text-gray-900 mb-4">
          {t("plan.headline_1")}{" "}
          <span className="italic text-gray-600">{t("plan.headline_accent")}</span>
        </h2>

        <p className="text-[15px] md:text-[16px] text-gray-500 max-w-[440px] mx-auto leading-[1.75]">
          {t("plan.body")}
        </p>
      </motion.div>

      <ProcessStepper />
    </div>
  );
};

export default HowItWorksSection;
