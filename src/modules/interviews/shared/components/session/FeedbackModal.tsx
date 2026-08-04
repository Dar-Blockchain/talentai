import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { submitFeedback } from '@/modules/interviews/shared/api/feedback.api';
import {
  Dialog, DialogContent,
} from '@/modules/shared/ui/shadcn/dialog';
import { Button } from '@/modules/shared/ui/shadcn/button';

interface FeedbackModalProps {
  open: boolean;
  interviewId?: string;
  interviewType?: string;
  onDone: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, interviewId, interviewType, onDone }) => {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const mutation = useMutation({ mutationFn: submitFeedback });

  useEffect(() => {
    if (open) {
      mutation.reset();
      setRating(0);
      setHovered(0);
      setComment('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mutation.isSuccess) return;
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [mutation.isSuccess, onDone]);

  const followUpQuestion =
    rating === 0  ? null :
    rating <= 3   ? 'What could be improved?' :
                    'What did you like most?';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xs rounded-[20px] p-0 overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
      >
        {/* Purple accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#8310FF] to-[#6d0ee0]" />

        <div className="p-6 md:p-7">
          {mutation.isSuccess ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 size={52} color="#16a34a" />
              <p className="font-sans font-bold text-[1.05rem] text-[#15803d]">Thank you for your feedback!</p>
              <p className="font-sans text-[0.82rem] text-[#6B7280] text-center">We appreciate your response.</p>
            </div>
          ) : (
            <>
              <p className="font-sans font-bold text-[1.05rem] text-[#111827] mb-1">How was your interview experience?</p>
              <p className="font-sans text-[0.82rem] text-[#6B7280] mb-5">Your feedback helps us improve.</p>

              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hovered || rating);
                  return (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="cursor-pointer transition-colors"
                      style={{ color: active ? '#F59E0B' : '#D1D5DB' }}
                    >
                      <Star size={36} fill={active ? 'currentColor' : 'none'} />
                    </button>
                  );
                })}
              </div>

              {/* Follow-up */}
              {followUpQuestion && (
                <div className="mb-4">
                  <p className="font-sans font-semibold text-[0.88rem] text-[#374151] mb-2">{followUpQuestion}</p>
                  <textarea
                    rows={3}
                    placeholder="Write your comment here…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                    className="w-full border border-[#E5E7EB] rounded-[10px] px-3 py-2 text-[0.85rem] font-sans resize-none outline-none focus:border-[#8310FF] hover:border-[#9CA3AF] transition-colors"
                  />
                  <p className="text-[0.75rem] text-[#9CA3AF] text-right mt-1">{comment.length}/1000</p>
                </div>
              )}

              {mutation.error && (
                <p className="text-[0.82rem] text-[#DC2626] mb-3 font-sans">
                  {(mutation.error as Error).message}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={!rating || mutation.isPending}
                  onClick={() => mutation.mutate({ rating, comment, interviewId, interviewType })}
                  className="flex-1 h-auto font-sans font-bold text-[0.88rem] text-white py-3 rounded-[12px] bg-[#8310FF] hover:bg-[#6d0ee0] hover:text-white"
                >
                  {mutation.isPending
                    ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : 'Submit'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={mutation.isPending}
                  onClick={onDone}
                  className="h-auto font-sans font-semibold text-[0.82rem] text-[#6B7280] px-5 py-3 rounded-[12px] hover:bg-[#f9fafb]"
                >
                  Skip
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
