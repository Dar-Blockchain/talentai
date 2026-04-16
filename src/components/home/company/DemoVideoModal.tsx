import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DEMO_VIDEO_SRC } from "@/constants";

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden", bgcolor: "#000" } } }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, bgcolor: "#111827" }}>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "14px", color: "#fff" }}>
        TalentAI — Product Demo
      </Typography>
      <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#fff" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <DialogContent sx={{ p: 0, bgcolor: "#000" }}>
      <iframe
        src={DEMO_VIDEO_SRC}
        width="100%"
        allow="autoplay"
        style={{ border: "none", display: "block", aspectRatio: "16/9" }}
        allowFullScreen
      />
    </DialogContent>
  </Dialog>
);

export default DemoVideoModal;
