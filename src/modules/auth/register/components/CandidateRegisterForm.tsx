import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCandidateRegister } from "../hooks";
import CandidateFields from "./ui/CandidateFields";
import CvUpload from "./ui/CvUpload";
import CvAnalysisDialog from "./ui/CvAnalysisDialog";
import OtpVerifyStep from "./ui/OtpVerifyStep";
import SubmitButton from "./ui/SubmitButton";
import type { CandidateFormValues, RegisterFormProps } from "../types";

const full = { flex: "1 1 100%" };

const CandidateRegisterForm: React.FC<RegisterFormProps> = ({ onStepChange, onEmailChange }) => {
  const { t } = useTranslation("auth");
  const {
    step, loading, resendLoading, analyzingCv, cvProgress, setCvProgress,
    cvFile, setCvFile, cvError, setCvError, isDragging, setIsDragging,
    savedEmail, otp, fileInputRef, isJoinTeam, invitationEmail, timer,
    sendCode, verifyCode, resendCode,
  } = useCandidateRegister({ onStepChange, onEmailChange });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CandidateFormValues>({ mode: "onTouched" });

  useEffect(() => { if (invitationEmail) setValue("email", invitationEmail); }, [invitationEmail]);

  useEffect(() => {
    if (!analyzingCv) { setCvProgress(0); return; }
    const id = setInterval(() => setCvProgress((p) => p >= 90 ? (clearInterval(id), 90) : p + (p < 60 ? 4 : 1)), 300);
    return () => clearInterval(id);
  }, [analyzingCv]);

  if (step === 2) return (
    <OtpVerifyStep
      savedEmail={savedEmail} otp={otp} timer={timer}
      loading={loading} resendLoading={resendLoading}
      onVerify={verifyCode} onResend={resendCode}
      tPrefix="candidate_form"
    />
  );

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit(sendCode)}
        sx={{ mb: 2, textAlign: "left", display: "flex", flexWrap: "wrap", gap: { xs: 2.25, sm: 2.75, md: 3 } }}
      >
        <CandidateFields register={register} errors={errors} loading={loading} invitationEmail={invitationEmail} />

        {!isJoinTeam && (
          <Box sx={full}>
            <CvUpload
              fileInputRef={fileInputRef}
              cvFile={cvFile} cvError={cvError} isDragging={isDragging}
              onFileChange={(f) => { setCvFile(f); if (f) setCvError(false); }}
              onDragChange={setIsDragging}
            />
          </Box>
        )}

        <Box sx={full}>
          <SubmitButton
            loading={loading}
            label={t("candidate_form.btn_continue")}
            loadingLabel={t("candidate_form.btn_sending")}
            onClick={() => { if (!isJoinTeam && !cvFile) setCvError(true); }}
          />
        </Box>
      </Box>

      <CvAnalysisDialog open={analyzingCv} progress={cvProgress} />
    </Box>
  );
};

export default CandidateRegisterForm;
