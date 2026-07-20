import React, { memo, useMemo, useCallback } from "react";
import { Plus, Sparkles, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Switch } from "@/modules/shared/ui/shadcn/switch";
import { Checkbox } from "@/modules/shared/ui/shadcn/checkbox";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/ui/shadcn/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { Question, QuestionnaireModule, QuestionType } from "@/modules/company/campaigns/types/campaign";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionnaireConfig {
  questions: Question[];
  aiScoringEnabled?: boolean;
  showResultsToParticipants?: boolean;
}

interface Props {
  config: NonNullable<QuestionnaireModule["config"]>;
  onChange: (config: NonNullable<QuestionnaireModule["config"]>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const QuestionnaireForm = memo<Props>(({ config, onChange }) => {
  const { t } = useTranslation("dashboard");
  const cf = "pages.campaigns.detail.configure_form.questionnaire";

  const typeOptions = useMemo(
    () =>
      (["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RATING"] as QuestionType[]).map((type) => ({
        label: t(`${cf}.qtype_${type}`),
        value: type,
      })),
    [t, cf],
  );
  const addQuestion = useCallback(() =>
    onChange({ ...config, questions: [...config.questions, { question: "", type: "TEXT" }] }), [onChange, config]);

  const updateQuestion = useCallback((i: number, updates: Partial<Question>) =>
    onChange({
      ...config,
      questions: config.questions.map((q, idx) => (idx === i ? { ...q, ...updates } : q)),
    }), [onChange, config]);

  const removeQuestion = useCallback((i: number) =>
    onChange({ ...config, questions: config.questions.filter((_, idx) => idx !== i) }), [onChange, config]);

  const addOption = useCallback((qi: number) => {
    const q = config.questions[qi];
    updateQuestion(qi, { options: [...(q.options ?? []), ""] });
  }, [config.questions, updateQuestion]);

  const updateOption = useCallback((qi: number, oi: number, value: string) => {
    const options = (config.questions[qi].options ?? []).map((o, idx) =>
      idx === oi ? value : o,
    );
    updateQuestion(qi, { options });
  }, [config.questions, updateQuestion]);

  const removeOption = useCallback((qi: number, oi: number) => {
    const q = config.questions[qi];
    updateQuestion(qi, {
      options: (q.options ?? []).filter((_, idx) => idx !== oi),
      correctOptionIndexes: (q.correctOptionIndexes ?? [])
        .filter((idx) => idx !== oi)
        .map((idx) => (idx > oi ? idx - 1 : idx)),
    });
  }, [config.questions, updateQuestion]);

  const setSingleCorrectOption = useCallback((qi: number, oi: number) => {
    updateQuestion(qi, { correctOptionIndexes: [oi] });
  }, [updateQuestion]);

  const toggleMultiCorrectOption = useCallback((qi: number, oi: number, checked: boolean) => {
    const current = config.questions[qi].correctOptionIndexes ?? [];
    updateQuestion(qi, {
      correctOptionIndexes: checked
        ? [...current, oi].sort((a, b) => a - b)
        : current.filter((idx) => idx !== oi),
    });
  }, [config.questions, updateQuestion]);

  const aiScoringEnabled = config.aiScoringEnabled !== false;
  const toggleAiScoring = useCallback(
    (checked: boolean) => onChange({ ...config, aiScoringEnabled: checked }),
    [onChange, config],
  );

  const showResultsToParticipants = config.showResultsToParticipants !== false;
  const toggleShowResults = useCallback(
    (checked: boolean) => onChange({ ...config, showResultsToParticipants: checked }),
    [onChange, config],
  );

  return (
    <div className="flex flex-col gap-3">
      <ToggleRow
        icon={<Sparkles className="size-4" />}
        iconBg="#F5F3FF"
        iconColor="#7C3AED"
        label={t(`${cf}.ai_scoring_label`)}
        hint={t(`${cf}.ai_scoring_hint`)}
        checked={aiScoringEnabled}
        onCheckedChange={toggleAiScoring}
      />
      <ToggleRow
        icon={<Eye className="size-4" />}
        iconBg="#ECFEFF"
        iconColor="#0891B2"
        label={t(`${cf}.show_results_label`)}
        hint={t(`${cf}.show_results_hint`)}
        checked={showResultsToParticipants}
        onCheckedChange={toggleShowResults}
      />

      {config.questions.length === 0 ? (
        <EmptyState label={t(`${cf}.empty`)} />
      ) : (
        <div className="flex flex-col gap-3">
          {config.questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-border bg-muted/30 p-3.5">
              {/* Question header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold text-foreground/80">
                  {t(`${cf}.question_heading`, { n: i + 1 })}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeQuestion(i)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Question text */}
                <Input
                  placeholder={t(`${cf}.placeholder_question`)}
                  value={q.question}
                  onChange={(e) => updateQuestion(i, { question: e.target.value })}
                  className="bg-background"
                />

                {/* Question type */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(`${cf}.type_label`)}
                  </Label>
                  <Select
                    value={q.type}
                    onValueChange={(val) => {
                      const nextType = val as QuestionType;
                      const isChoice = nextType === "SINGLE_CHOICE" || nextType === "MULTIPLE_CHOICE";
                      updateQuestion(i, {
                        type: nextType,
                        options: isChoice ? [""] : undefined,
                        correctOptionIndexes: isChoice ? q.correctOptionIndexes?.slice(0, 1) : undefined,
                      });
                    }}
                  >
                    <SelectTrigger size="sm" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Options (single choice or multiple choice) */}
                {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && (
                  <div className="flex flex-col gap-2 mt-0.5">
                    <Label className="text-[11px] font-normal text-muted-foreground">
                      {t(`${cf}.correct_answer_hint`)}
                    </Label>
                    {q.type === "SINGLE_CHOICE" ? (
                      <RadioGroup
                        value={q.correctOptionIndexes?.[0] !== undefined ? String(q.correctOptionIndexes[0]) : ""}
                        onValueChange={(val) => setSingleCorrectOption(i, Number(val))}
                        className="gap-2"
                      >
                        {(q.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <RadioGroupItem
                              value={String(oi)}
                              aria-label={t(`${cf}.mark_correct_single_aria`, { n: oi + 1 })}
                              className="shrink-0"
                            />
                            <Input
                              placeholder={t(`${cf}.option_placeholder`, { n: oi + 1 })}
                              value={opt}
                              onChange={(e) => updateOption(i, oi, e.target.value)}
                              className="bg-background"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeOption(i, oi)}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      (q.options ?? []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <Checkbox
                            checked={(q.correctOptionIndexes ?? []).includes(oi)}
                            onCheckedChange={(checked) => toggleMultiCorrectOption(i, oi, checked === true)}
                            aria-label={t(`${cf}.mark_correct_multi_aria`, { n: oi + 1 })}
                            className="shrink-0"
                          />
                          <Input
                            placeholder={t(`${cf}.option_placeholder`, { n: oi + 1 })}
                            value={opt}
                            onChange={(e) => updateOption(i, oi, e.target.value)}
                            className="bg-background"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeOption(i, oi)}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(i)}
                      className="self-start text-muted-foreground"
                    >
                      <Plus className="size-3.5" />
                      {t(`${cf}.add_option`)}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddRowButton label={t(`${cf}.add_question`)} onClick={addQuestion} />
    </div>
  );
});
QuestionnaireForm.displayName = "QuestionnaireForm";

// ─── Local helpers ────────────────────────────────────────────────────────────

export const ToggleRow: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ icon, iconBg, iconColor, label, hint, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3">
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="flex items-center justify-center size-8 rounded-lg shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="mt-1 py-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
    <p className="text-[13px] text-muted-foreground">{label}</p>
  </div>
);

const AddRowButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    className="border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/40"
  >
    <Plus className="size-4" />
    {label}
  </Button>
);

export { EmptyState, AddRowButton };
export default QuestionnaireForm;
