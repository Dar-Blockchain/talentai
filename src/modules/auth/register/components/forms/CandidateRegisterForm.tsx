import React from "react";
import { useCandidateRegister } from "../../hooks";
import CandidateFields from "../fields/CandidateFields";
import CvUpload from "../cv/CvUpload";
import CvAnalysisDialog from "../cv/CvAnalysisDialog";
import SubmitButton from "../ui/SubmitButton";
import type { RegisterFormProps } from "../../types";
import { useTranslation } from "react-i18next";

const CandidateRegisterForm: React.FC<RegisterFormProps> = ({ onOtpReady }) => {
  const { t } = useTranslation("auth");
  const {
    form, loading, analyzingCv, cvProgress,
    cvFile, setCvFile, cvError, setCvError, isDragging, setIsDragging,
    fileInputRef, isJoinTeam, invitationEmail,
    sendCode,
  } = useCandidateRegister({ onOtpReady });

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(sendCode)}
        className="mb-4 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
      >
        <CandidateFields
          control={form.control}
          errors={form.formState.errors}
          loading={loading}
          invitationEmail={invitationEmail}
        />

        {!isJoinTeam && (
          <div className="col-span-full">
            <CvUpload
              fileInputRef={fileInputRef}
              cvFile={cvFile} cvError={cvError} isDragging={isDragging}
              onFileChange={(f) => { setCvFile(f); if (f) setCvError(false); }}
              onDragChange={setIsDragging}
            />
          </div>
        )}

        <div className="col-span-full">
          <SubmitButton
            loading={loading}
            label={t("candidate_form.btn_continue")}
            loadingLabel={t("candidate_form.btn_sending")}
            onClick={() => { if (!isJoinTeam && !cvFile) setCvError(true); }}
          />
        </div>
      </form>

      <CvAnalysisDialog open={analyzingCv} progress={cvProgress} />
    </div>
  );
};

export default CandidateRegisterForm;
