import React from 'react';
import { useRouter } from 'next/router';
import { CheckCircle2, BarChart2, ClipboardCheck, FileCheck2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/modules/shared/ui/shadcn/dialog';
import { Button } from '@/modules/shared/ui/shadcn/button';

interface FeedbackModalProps {
  open: boolean;
  onDone: () => void;
  reportPath?: string;
  dashboardPath?: string;
}

const HIGHLIGHTS = [
  { icon: BarChart2,      text: 'Your interview has been analyzed by AI' },
  { icon: ClipboardCheck, text: 'Your skill profile has been updated' },
  { icon: FileCheck2,     text: 'Full report is ready to view' },
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onDone,
  reportPath,
  dashboardPath = '/candidate/dashboard',
}) => {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm rounded-2xl p-0 overflow-hidden shadow-2xl border-0"
      >
        <div className="flex flex-col items-center gap-5 p-7 pt-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border-2 border-green-200">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">Interview Complete</h2>
            <p className="text-sm text-gray-500 mt-1">Thank you for completing this assessment.</p>
          </div>

          <div className="w-full border-t border-gray-100" />

          <div className="w-full flex flex-col gap-2">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 shrink-0">
                  <Icon size={14} className="text-violet-600" />
                </span>
                <span className="text-sm text-gray-700 font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="w-full flex gap-3 mt-1">
            {reportPath && (
              <Button
                onClick={() => router.push(reportPath)}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl h-11 "
              >
                View Your Report
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => { onDone(); router.push(dashboardPath); }}
              className="flex-1 rounded-xl h-11 font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 "
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
