import React from "react";
import type { FieldErrors } from "react-hook-form";
import type { WebinarBasicsForm } from "../../schemas/webinarBasicsSchema";
import type { WebinarFormValues } from "../../types";
import { LangBox } from "./LangBox";

const inp =
  "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";
const errTxt = "mt-1 text-[11px] text-red-500";
const lbl = "block text-[12px] font-semibold text-slate-600 mb-1.5";

export function WebinarContentStep({
  form,
  set,
  errors,
}: {
  form: WebinarFormValues;
  set: <K extends keyof WebinarFormValues>(k: K, v: WebinarFormValues[K]) => void;
  errors: FieldErrors<WebinarBasicsForm>;
}) {
  return (
    <div className="space-y-5">
      {/* Title */}
      {form.lang === "both" ? (
        <div className="grid grid-cols-2 gap-4">
          <LangBox flag="🇫🇷" name="French">
            <label className={lbl}>
              Title <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px] ml-1">(Hero heading)</span>
            </label>
            <input
              className={inp}
              value={form.title_fr}
              onChange={(e) => set("title_fr", e.target.value)}
              placeholder="Titre du webinar"
              autoFocus
              aria-invalid={!!errors.title_fr}
            />
            {errors.title_fr && <p className={errTxt}>{errors.title_fr.message}</p>}
          </LangBox>
          <LangBox flag="🇬🇧" name="English">
            <label className={lbl}>
              Title <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px] ml-1">(Hero heading)</span>
            </label>
            <input
              className={inp}
              value={form.title_en}
              onChange={(e) => set("title_en", e.target.value)}
              placeholder="Webinar title"
              aria-invalid={!!errors.title_en}
            />
            {errors.title_en && <p className={errTxt}>{errors.title_en.message}</p>}
          </LangBox>
        </div>
      ) : (
        <div>
          <label className={lbl}>
            Title <span className="text-red-400">*</span>{" "}
            <span className="text-slate-400 font-normal text-[11px] ml-1">(Hero heading)</span>
          </label>
          <input
            className={inp}
            value={form.lang === "fr" ? form.title_fr : form.title_en}
            onChange={(e) => set(form.lang === "fr" ? "title_fr" : "title_en", e.target.value)}
            placeholder={form.lang === "fr" ? "Titre du webinar" : "Webinar title"}
            autoFocus
            aria-invalid={!!(form.lang === "fr" ? errors.title_fr : errors.title_en)}
          />
          {(form.lang === "fr" ? errors.title_fr : errors.title_en) && (
            <p className={errTxt}>{(form.lang === "fr" ? errors.title_fr : errors.title_en)?.message}</p>
          )}
        </div>
      )}

      {/* Short description */}
      {form.lang === "both" ? (
        <div className="grid grid-cols-2 gap-4">
          <LangBox flag="🇫🇷" name="French">
            <label className={lbl}>
              Short description <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px] ml-1">(Hero subtext)</span>
            </label>
            <textarea
              className={inp}
              rows={2}
              value={form.description_fr}
              onChange={(e) => set("description_fr", e.target.value)}
              placeholder="De quoi parle ce webinar ?"
              style={{ resize: "none" }}
              aria-invalid={!!errors.description_fr}
            />
            {errors.description_fr && <p className={errTxt}>{errors.description_fr.message}</p>}
          </LangBox>
          <LangBox flag="🇬🇧" name="English">
            <label className={lbl}>
              Short description <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px] ml-1">(Hero subtext)</span>
            </label>
            <textarea
              className={inp}
              rows={2}
              value={form.description_en}
              onChange={(e) => set("description_en", e.target.value)}
              placeholder="What's this webinar about?"
              style={{ resize: "none" }}
              aria-invalid={!!errors.description_en}
            />
            {errors.description_en && <p className={errTxt}>{errors.description_en.message}</p>}
          </LangBox>
        </div>
      ) : (
        <div>
          <label className={lbl}>
            Short description <span className="text-red-400">*</span>{" "}
            <span className="text-slate-400 font-normal text-[11px] ml-1">(Hero subtext)</span>
          </label>
          <textarea
            className={inp}
            rows={2}
            value={form.lang === "fr" ? form.description_fr : form.description_en}
            onChange={(e) => set(form.lang === "fr" ? "description_fr" : "description_en", e.target.value)}
            placeholder={form.lang === "fr" ? "De quoi parle ce webinar ?" : "What's this webinar about?"}
            style={{ resize: "none" }}
            aria-invalid={!!(form.lang === "fr" ? errors.description_fr : errors.description_en)}
          />
          {(form.lang === "fr" ? errors.description_fr : errors.description_en) && (
            <p className={errTxt}>
              {(form.lang === "fr" ? errors.description_fr : errors.description_en)?.message}
            </p>
          )}
        </div>
      )}

      {/* About */}
      {form.lang === "both" ? (
        <div className="grid grid-cols-2 gap-4">
          <LangBox flag="🇫🇷" name="French">
            <label className={lbl}>
              About <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px] ml-1">(About section)</span>
            </label>
            <textarea
              className={inp}
              rows={6}
              value={form.about_fr}
              onChange={(e) => set("about_fr", e.target.value)}
              placeholder="Décrivez ce webinar en français…"
              style={{ resize: "vertical" }}
              aria-invalid={!!errors.about_fr}
            />
            {errors.about_fr && <p className={errTxt}>{errors.about_fr.message}</p>}
          </LangBox>
          <LangBox flag="🇬🇧" name="English">
            <label className={lbl}>
              About <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px] ml-1">(About section)</span>
            </label>
            <textarea
              className={inp}
              rows={6}
              value={form.about_en}
              onChange={(e) => set("about_en", e.target.value)}
              placeholder="Describe this webinar in English…"
              style={{ resize: "vertical" }}
              aria-invalid={!!errors.about_en}
            />
            {errors.about_en && <p className={errTxt}>{errors.about_en.message}</p>}
          </LangBox>
        </div>
      ) : (
        <div>
          <label className={lbl}>
            About <span className="text-red-400">*</span>{" "}
            <span className="text-slate-400 font-normal text-[11px] ml-1">(About section)</span>
          </label>
          <textarea
            className={inp}
            rows={6}
            value={form.lang === "fr" ? form.about_fr : form.about_en}
            onChange={(e) => set(form.lang === "fr" ? "about_fr" : "about_en", e.target.value)}
            placeholder={
              form.lang === "fr" ? "Décrivez ce webinar en français…" : "Describe this webinar in English…"
            }
            style={{ resize: "vertical" }}
            aria-invalid={!!(form.lang === "fr" ? errors.about_fr : errors.about_en)}
          />
          {(form.lang === "fr" ? errors.about_fr : errors.about_en) && (
            <p className={errTxt}>{(form.lang === "fr" ? errors.about_fr : errors.about_en)?.message}</p>
          )}
        </div>
      )}

      {/* Highlights — at least one bullet is required per language */}
      {form.lang === "both" ? (
        <div className="grid grid-cols-2 gap-4">
          <LangBox flag="🇫🇷" name="French">
            <label className={lbl}>
              Highlights <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px]">(About section, at least 1 of 3)</span>
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    className={inp}
                    value={form.highlights_fr[i] ?? ""}
                    onChange={(e) => {
                      const next = [...form.highlights_fr];
                      next[i] = e.target.value;
                      set("highlights_fr", next);
                    }}
                    placeholder={`Bénéfice ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            {errors.highlights_fr && <p className={errTxt}>{errors.highlights_fr.message}</p>}
          </LangBox>
          <LangBox flag="🇬🇧" name="English">
            <label className={lbl}>
              Highlights <span className="text-red-400">*</span>{" "}
              <span className="text-slate-400 font-normal text-[11px]">(About section, at least 1 of 3)</span>
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    className={inp}
                    value={form.highlights_en[i] ?? ""}
                    onChange={(e) => {
                      const next = [...form.highlights_en];
                      next[i] = e.target.value;
                      set("highlights_en", next);
                    }}
                    placeholder={`Benefit ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            {errors.highlights_en && <p className={errTxt}>{errors.highlights_en.message}</p>}
          </LangBox>
        </div>
      ) : (
        <div>
          <label className={lbl}>
            Highlights <span className="text-red-400">*</span>{" "}
            <span className="text-slate-400 font-normal text-[11px]">(About section, at least 1 of 3)</span>
          </label>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => {
              const key = form.lang === "fr" ? "highlights_fr" : "highlights_en";
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    className={inp}
                    value={form[key][i] ?? ""}
                    onChange={(e) => {
                      const next = [...form[key]];
                      next[i] = e.target.value;
                      set(key, next);
                    }}
                    placeholder={form.lang === "fr" ? `Bénéfice ${i + 1}` : `Benefit ${i + 1}`}
                  />
                </div>
              );
            })}
          </div>
          {(form.lang === "fr" ? errors.highlights_fr : errors.highlights_en) && (
            <p className={errTxt}>
              {(form.lang === "fr" ? errors.highlights_fr : errors.highlights_en)?.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default WebinarContentStep;
