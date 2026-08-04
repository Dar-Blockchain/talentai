import React from 'react';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/modules/shared/ui/shadcn/dialog';
import CandidateNotificationsPanel from './CandidateNotificationsPanel';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CandidateNotificationsModal: React.FC<Props> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent
      showCloseButton
      className="max-w-2xl w-full overflow-hidden rounded-[20px] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.14)]"
    >
      <DialogTitle className="sr-only">Notifications</DialogTitle>
      <div className="px-5 pt-10 pb-5">
        <CandidateNotificationsPanel variant="tab" />
      </div>
    </DialogContent>
  </Dialog>
);

export default CandidateNotificationsModal;
