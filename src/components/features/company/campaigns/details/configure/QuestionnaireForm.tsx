import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { AddOutlined, CloseOutlined, DeleteOutlined } from "@mui/icons-material";
import AppInput from "@/components/ui/AppInput";
import AppSelect from "@/components/ui/AppSelect";
import { Question, QuestionnaireModule, QuestionType } from "@/types/campaign";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionnaireConfig {
  questions: Question[];
}

interface Props {
  config: NonNullable<QuestionnaireModule["config"]>;
  onChange: (config: NonNullable<QuestionnaireModule["config"]>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: "Text", value: "TEXT" },
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
  { label: "Rating", value: "RATING" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const QuestionnaireForm: React.FC<Props> = ({ config, onChange }) => {
  const addQuestion = () =>
    onChange({ questions: [...config.questions, { question: "", type: "TEXT" }] });

  const updateQuestion = (i: number, updates: Partial<Question>) =>
    onChange({
      questions: config.questions.map((q, idx) => (idx === i ? { ...q, ...updates } : q)),
    });

  const removeQuestion = (i: number) =>
    onChange({ questions: config.questions.filter((_, idx) => idx !== i) });

  const addOption = (qi: number) => {
    const q = config.questions[qi];
    updateQuestion(qi, { options: [...(q.options ?? []), ""] });
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    const options = (config.questions[qi].options ?? []).map((o, idx) =>
      idx === oi ? value : o,
    );
    updateQuestion(qi, { options });
  };

  const removeOption = (qi: number, oi: number) => {
    updateQuestion(qi, {
      options: (config.questions[qi].options ?? []).filter((_, idx) => idx !== oi),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {config.questions.length === 0 ? (
        <EmptyState label="No questions yet. Add your first question." />
      ) : (
        config.questions.map((q, i) => (
          <Box
            key={i}
            sx={{ p: 2, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#FAFAFA" }}
          >
            {/* Question header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                Question {i + 1}
              </Typography>
              <IconButton
                size="small"
                onClick={() => removeQuestion(i)}
                sx={{ color: "#EF4444", p: 0.5, "&:hover": { bgcolor: "#FEF2F2" } }}
              >
                <DeleteOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Question text */}
              <AppInput
                placeholder="Enter your question..."
                value={q.question}
                onChange={(e) => updateQuestion(i, { question: e.target.value })}
              />

              {/* Question type */}
              <AppSelect
                label="Type"
                value={q.type}
                options={TYPE_OPTIONS}
                onChange={(val) =>
                  updateQuestion(i, {
                    type: val as QuestionType,
                    options: val === "MULTIPLE_CHOICE" ? [""] : undefined,
                  })
                }
              />

              {/* Options (multiple choice only) */}
              {q.type === "MULTIPLE_CHOICE" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
                  {(q.options ?? []).map((opt, oi) => (
                    <Box key={oi} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <AppInput
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(i, oi, e.target.value)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeOption(i, oi)}
                        sx={{
                          color: "#9CA3AF",
                          flexShrink: 0,
                          "&:hover": { color: "#EF4444" },
                        }}
                      >
                        <CloseOutlined sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
                    onClick={() => addOption(i)}
                    sx={{
                      alignSelf: "flex-start",
                      fontSize: "12px",
                      color: "#6B7280",
                      textTransform: "none",
                    }}
                  >
                    Add Option
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        ))
      )}

      <AddRowButton label="Add Question" onClick={addQuestion} />
    </Box>
  );
};

// ─── Local helpers ────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <Box
    sx={{
      mt: 2,
      py: 3,
      textAlign: "center",
      bgcolor: "#F9FAFB",
      borderRadius: 2,
      border: "1px dashed #E5E7EB",
    }}
  >
    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{label}</Typography>
  </Box>
);

const AddRowButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <Button
    variant="outlined"
    startIcon={<AddOutlined />}
    onClick={onClick}
    sx={{
      borderStyle: "dashed",
      borderColor: "#D1D5DB",
      color: "#6B7280",
      textTransform: "none",
      fontSize: "13px",
      "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
    }}
  >
    {label}
  </Button>
);

export { EmptyState, AddRowButton };
export default QuestionnaireForm;
