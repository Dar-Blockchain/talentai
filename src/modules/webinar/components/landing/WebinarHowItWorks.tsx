import { motion } from "framer-motion";
import { Card } from "@/modules/shared/ui/shadcn/card";

const VP   = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS_FR = [
  { title: "Accédez au webinar",        desc: "Remplissez le formulaire ci-dessus — aucun compte requis." },
  { title: "Répondez aux questions",    desc: "3 minutes sur votre maturité IA et vos défis recrutement." },
  { title: "L'IA analyse votre profil", desc: "Calcul de votre score de maturité et de vos points clés." },
  { title: "Recevez votre rapport",     desc: "Un rapport personnalisé livré directement par email." },
];

const STEPS_EN = [
  { title: "Access the webinar",       desc: "Fill in the form above — no account needed." },
  { title: "Answer the questions",     desc: "3 minutes on your AI maturity and hiring challenges." },
  { title: "AI analyses your profile", desc: "We calculate your maturity score and key pain points." },
  { title: "Receive your report",      desc: "A personalised report lands straight in your inbox." },
];

export function WebinarHowItWorks({ lang }: { lang: "fr" | "en" }) {
  const isEn = lang === "en";
  const steps = isEn ? STEPS_EN : STEPS_FR;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-px bg-[#6AD39C]" />
        <span className="text-[11px] font-semibold uppercase text-[#10453F]/60" style={{ letterSpacing: "0.16em" }}>
          {isEn ? "Process" : "Déroulement"}
        </span>
      </div>
      <h2
        className="text-[#10453F] mb-8"
        style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.6rem, 2vw + 1rem, 2.2rem)", letterSpacing: "-0.01em" }}
      >
        {isEn ? "How does it work?" : "Comment ça marche ?"}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <Card
            key={i}
            className="bg-[#FBFBF9] border-[#E7E5DE] p-5 gap-0 shadow-[0_10px_30px_-16px_rgba(16,69,63,0.25)] hover:border-[#6AD39C]/50 hover:shadow-[0_14px_34px_-14px_rgba(16,69,63,0.3)] transition-all"
          >
            <span
              className="block text-[1.75rem] leading-none text-[#6AD39C] mb-3"
              style={{ fontFamily: "var(--font-fraunces)", fontWeight: 500 }}
            >
              0{i + 1}
            </span>
            <h3 className="text-[15px] font-semibold text-[#10453F] mb-1.5">{s.title}</h3>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
