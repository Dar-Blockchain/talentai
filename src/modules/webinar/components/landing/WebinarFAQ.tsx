import { motion } from "framer-motion";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/modules/shared/ui/shadcn/accordion";

const VP   = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

export function WebinarFAQ({ lang, aboutText }: { lang: "fr" | "en"; aboutText?: string }) {
  const isEn = lang === "en";

  const faq = [
    ...(aboutText ? [{ q: isEn ? "What is this webinar?" : "C'est quoi ce webinar ?", a: aboutText }] : []),
    { q: isEn ? "Is it really free?" : "Est-ce vraiment gratuit ?",
      a: isEn ? "Yes, 100% free — no credit card, no hidden fees." : "Oui, 100% gratuit — sans carte bancaire, sans frais cachés." },
    { q: isEn ? "Do I need to attend live?" : "Dois-je y assister en direct ?",
      a: isEn ? "No — answer a few questions and we'll email your personalised AI report whenever it's ready." : "Non — répondez à quelques questions et nous vous enverrons votre rapport IA personnalisé par email." },
    { q: isEn ? "What happens to my answers?" : "Que deviennent mes réponses ?",
      a: isEn ? "They're used only to personalise your report and are handled per our Privacy Policy." : "Elles servent uniquement à personnaliser votre rapport, conformément à notre politique de confidentialité." },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-px bg-[#6AD39C]" />
        <span className="text-[11px] font-semibold uppercase text-[#10453F]/60" style={{ letterSpacing: "0.16em" }}>
          FAQ
        </span>
      </div>
      <h2
        className="text-[#10453F] mb-8"
        style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.6rem, 2vw + 1rem, 2.2rem)", letterSpacing: "-0.01em" }}
      >
        {isEn ? "Good to know" : "Bon à savoir"}
      </h2>

      <Accordion type="single" collapsible className="space-y-3">
        {faq.map((item, i) => (
          <AccordionItem
            key={i} value={`item-${i}`}
            className="!border bg-[#FBFBF9] border-[#E7E5DE] rounded-xl px-5 shadow-[0_10px_30px_-16px_rgba(16,69,63,0.25)] hover:border-[#6AD39C]/50 transition-colors"
          >
            <AccordionTrigger className="text-[15px] font-semibold text-[#10453F] py-5 hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-[14px] text-slate-500 leading-relaxed whitespace-pre-line pb-5">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.section>
  );
}
