import { useState }    from "react";
import { Plus }         from "lucide-react";
import Head             from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;
const FAQ_KEYS = ["1", "2", "3", "4", "5"] as const;

interface FaqItem { question: string; answer: string }

const FAQItem: React.FC<{ faq: FaqItem; index: number; open: boolean; onToggle: () => void }> = ({ faq, index, open, onToggle }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}>
    <div
      onClick={onToggle}
      className={cn(
        "relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200",
        open
          ? "border-primary/30 bg-primary/[0.03] shadow-[0_4px_24px_rgba(13,148,136,0.10)]"
          : "border-black/[0.07] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-primary/25 hover:shadow-[0_4px_20px_rgba(13,148,136,0.08)]"
      )}
    >
      {/* Left accent bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-colors duration-200",
        open ? "bg-primary" : "bg-transparent"
      )} />

      {/* Question row */}
      <div className="flex items-center gap-4 px-5 md:px-6 py-4 md:py-5">
        <div className={cn(
          "size-8 rounded-[10px] flex-shrink-0 flex items-center justify-center transition-colors duration-200",
          open ? "bg-primary/10" : "bg-black/[0.04]"
        )}>
          <span className={cn("text-[11px] font-extrabold tracking-[0.5px]", open ? "text-primary" : "text-gray-400")}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <span className={cn(
          "font-semibold text-[14px] md:text-[15px] leading-snug flex-1 transition-colors duration-200",
          open ? "text-gray-900" : "text-gray-700"
        )}>
          {faq.question}
        </span>

        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.22, ease }} className="flex-shrink-0">
          <div className={cn(
            "size-7 rounded-full flex items-center justify-center transition-colors duration-200",
            open ? "bg-primary" : "bg-black/[0.05]"
          )}>
            <Plus className={cn("size-4", open ? "text-white" : "text-gray-400")} />
          </div>
        </motion.div>
      </div>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease }} style={{ overflow: "hidden" }}>
            <div className="px-5 md:px-6 pb-5 md:pb-6 pl-12 sm:pl-[68px] md:pl-[76px]">
              <p className="text-[13.5px] md:text-[14px] text-gray-500 leading-[1.8]">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const FAQSection: React.FC = () => {
  const { t } = useTranslation("home");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const faqs: FaqItem[] = FAQ_KEYS.map((k) => ({
    question: t(`faq.q${k}`),
    answer:   t(`faq.a${k}`),
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <div className="relative overflow-hidden py-16 md:py-24">

        {/* Subtle ambient shapes */}
        <motion.div
          animate={{ borderRadius: ["60% 40% 30% 70%/60% 30% 70% 40%","30% 60% 70% 40%/50% 60% 30% 60%","60% 40% 30% 70%/60% 30% 70% 40%"], x: [0,25,0], y: [0,-20,0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[380px]"
          style={{ background: "radial-gradient(circle at 40% 40%,rgba(13,148,136,0.07) 0%,transparent 70%)" }} />
        <motion.div
          animate={{ borderRadius: ["40% 60% 60% 40%/40% 50% 60% 50%","60% 40% 40% 60%/60% 40% 50% 40%","40% 60% 60% 40%/40% 50% 60% 50%"], x: [0,-20,0], y: [0,18,0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="pointer-events-none absolute -bottom-20 -right-20 w-[380px] h-[340px]"
          style={{ background: "radial-gradient(circle at 60% 55%,rgba(13,148,136,0.05) 0%,transparent 70%)" }} />
        <motion.div animate={{ y: [0,-22,0], rotate: [45,68,45], opacity: [0.08,0.16,0.08] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none hidden sm:block absolute top-[6%] right-[6%] size-14 border-[1.5px] border-primary/25 rotate-45" />
        <motion.div animate={{ y: [0,18,0], rotate: [45,22,45], opacity: [0.06,0.12,0.06] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="pointer-events-none hidden sm:block absolute bottom-[8%] left-[5%] size-10 border-[1.5px] border-primary/20 rotate-45" />

        <div className="max-w-[760px] mx-auto px-4 md:px-8 relative">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.55, ease }}>
            <div className="text-center mb-8 sm:mb-10 md:mb-14">
              <div className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1.2px]">
                  {t("faq.overline")}
                </span>
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[32px] md:text-[44px] leading-[1.1] text-gray-900 mb-3 tracking-[-0.5px]">
                {t("faq.headline_1")}{" "}
                <span className="italic text-gray-600">{t("faq.headline_accent")}</span>
              </h2>
              <p className="text-[14px] md:text-base text-gray-500 leading-[1.7]">{t("faq.body")}</p>
            </div>
          </motion.div>

          {/* Accordion */}
          <motion.div initial="hidden" whileInView="visible" viewport={VP}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}>
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} open={openIndex === i} onToggle={() => toggle(i)} />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default FAQSection;
