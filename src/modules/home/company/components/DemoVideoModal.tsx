import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Google Drive file ID extracted from the share URL
const DRIVE_FILE_ID = "1zncILpQW4bIREfhUZKfhivDRCKihsfIC";
const EMBED_SRC = `https://drive.google.com/file/d/${DRIVE_FILE_ID}/preview`;

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden", bgcolor: "#000" } } }}
    >
      {/* Header bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, bgcolor: "#111827" }}>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "14px", color: "#fff" }}>
          TalentAI — Product Demo
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#fff" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Video area */}
      <DialogContent sx={{ p: 0, bgcolor: "#000" }}>
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
          {open && (
            <iframe
              src={EMBED_SRC}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="autoplay"
              allowFullScreen
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;
