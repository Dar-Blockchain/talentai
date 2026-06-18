import React from "react";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import VerifiedOutlined       from "@mui/icons-material/VerifiedOutlined";
import { fmtDate } from "@/modules/company/assessment/constants";
import { PostAssessmentData } from "../../types";

interface Props {
  recruiterReview: PostAssessmentData["recruiterReview"];
}

const RecruiterReviewCard: React.FC<Props> = ({ recruiterReview }) => {
  if (!recruiterReview) return null;

  if (recruiterReview.reviewed) {
    return (
      <div className="mx-7 mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <VerifiedOutlined style={{ fontSize: 14, color: "#059669" }} />
        </div>
        <div>
          <div className="text-xs font-bold text-emerald-700">
            Recruiter Reviewed{recruiterReview.reviewedAt ? ` · ${fmtDate(recruiterReview.reviewedAt)}` : ""}
          </div>
          {recruiterReview.feedback && (
            <div className="text-xs text-emerald-800 mt-0.5 leading-relaxed">{recruiterReview.feedback}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-7 mb-5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
      <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
        <HourglassEmptyOutlined style={{ fontSize: 13, color: "#D97706" }} />
      </div>
      <span className="text-xs font-semibold text-amber-800">Pending recruiter review</span>
    </div>
  );
};

export default RecruiterReviewCard;
