import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import {
  Close as CloseIcon,
  WorkOutline as WorkIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Quiz as QuizIcon,
  Repeat as RepeatIcon,
} from '@mui/icons-material';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { scoreTone } from './AdminAtoms';
import { ADMIN_ACCENT } from '../theme';

interface AssessmentDetailsDialogProps {
  open: boolean;
  assessment: any | null;
  onClose: () => void;
  onEdit?: (assessment: any) => void;
}

const AssessmentDetailsDialog: React.FC<AssessmentDetailsDialogProps> = ({
  open,
  assessment,
  onClose,
}) => {
  if (!assessment) return null;

  const score = assessment.averageScore ?? 0;
  const tone = scoreTone(score);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <div
        className="relative px-6 pt-6 pb-8"
        style={{ background: ADMIN_ACCENT }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <span className="text-[11px] uppercase tracking-[1.5px] text-white/70">
          Assessment Details
        </span>
        <h2 className="text-[1.5rem] font-bold text-white mt-1 pr-8">
          {assessment.jobId?.title || assessment.jobName || 'Unnamed Job'}
        </h2>
        {assessment.jobId?.location && (
          <div className="flex items-center gap-1 mt-2">
            <LocationIcon style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
            <span className="text-[13px] text-white/70">{assessment.jobId.location}</span>
          </div>
        )}
      </div>

      <DialogContent sx={{ p: 0 }}>
        {/* Score Card - overlapping header */}
        <div className="px-6 -mt-5">
          <div className="bg-white rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200 flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${tone.color}14` }}
            >
              <span className="text-[1.5rem] font-extrabold" style={{ color: tone.color }}>
                {score.toFixed(0)}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] font-semibold text-slate-900">Average Score</span>
                <Badge variant="outline" className="border-transparent font-semibold" style={{ background: `${tone.color}14`, color: tone.color }}>
                  {tone.label}
                </Badge>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${score}%`, background: tone.color }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 px-6 mt-5">
          <div className="flex-1 p-4 rounded-xl bg-indigo-50 text-center">
            <RepeatIcon style={{ color: ADMIN_ACCENT, fontSize: 22, marginBottom: 4 }} />
            <div className="text-[1.1rem] font-bold text-slate-900">{assessment.numberOfAttempts || 0}</div>
            <div className="text-[11px] text-slate-500">Attempts</div>
          </div>
          <div className="flex-1 p-4 rounded-xl bg-indigo-50 text-center">
            <QuizIcon style={{ color: ADMIN_ACCENT, fontSize: 22, marginBottom: 4 }} />
            <div className="text-[1.1rem] font-bold text-slate-900">{assessment.totalQuestions || 'N/A'}</div>
            <div className="text-[11px] text-slate-500">Questions</div>
          </div>
          <div className="flex-1 p-4 rounded-xl bg-indigo-50 text-center">
            <TrendingUpIcon style={{ color: ADMIN_ACCENT, fontSize: 22, marginBottom: 4 }} />
            <div className="text-[1.1rem] font-bold text-slate-900">
              {score >= 70 ? 'High' : score >= 50 ? 'Mid' : 'Low'}
            </div>
            <div className="text-[11px] text-slate-500">Performance</div>
          </div>
        </div>

        {/* Job Details */}
        <div className="px-6 mt-5 pb-6">
          <span className="text-[11px] uppercase tracking-[1.2px] text-slate-500">Job Information</span>
          <div className="mt-3 flex flex-col gap-3">
            {assessment.jobId?.description && (
              <p className="text-[13px] text-slate-600 leading-[1.7]">{assessment.jobId.description}</p>
            )}
            <div className="flex gap-2 flex-wrap mt-0.5">
              {assessment.jobId?.employmentType && (
                <Badge variant="outline" className="gap-1 border-slate-200 text-slate-500 capitalize">
                  <WorkIcon style={{ fontSize: 14 }} />
                  {assessment.jobId.employmentType}
                </Badge>
              )}
              {assessment.jobId?.experienceLevel && (
                <Badge variant="outline" className="gap-1 border-slate-200 text-slate-500">
                  <TrendingUpIcon style={{ fontSize: 14 }} />
                  {assessment.jobId.experienceLevel}
                </Badge>
              )}
              {assessment.createdAt && (
                <Badge variant="outline" className="gap-1 border-slate-200 text-slate-500">
                  <TimeIcon style={{ fontSize: 14 }} />
                  {new Date(assessment.createdAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] font-mono text-slate-400">ID: {assessment._id}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AssessmentDetailsDialog);
