import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { X as CloseIcon } from "lucide-react";

const DRIVE_PREVIEW = "https://drive.google.com/file/d/1zncILpQW4bIREfhUZKfhivDRCKihsfIC/preview";

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-xl bg-black">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#111827] px-4 py-2">
        <span className="text-[14px] font-semibold text-white">TalentAI — Product Demo</span>
        <button onClick={onClose} className="cursor-pointer rounded-md p-1 text-[#9CA3AF] hover:text-white">
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Drive embed */}
      {open && (
        <iframe
          src={DRIVE_PREVIEW}
          className="w-full"
          style={{ aspectRatio: "16/9", border: "none", display: "block" }}
          allow="autoplay"
          allowFullScreen
        />
      )}
    </DialogContent>
  </Dialog>
);

export default DemoVideoModal;
