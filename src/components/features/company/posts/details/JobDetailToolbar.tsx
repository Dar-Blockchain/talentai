import React from "react";
import { Box, Button, Typography } from "@mui/material";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import SectionCard from "@/components/dashboard-workplace/ui/SectionCard";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  isDraft: boolean;
  isOwner: boolean;
  isEditing: boolean;
  onPublish: () => void;
  onEdit: () => void;
  onPassInterview: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

const JobDetailToolbar: React.FC<Props> = ({
  isDraft,
  isOwner,
  isEditing,
  onPublish,
  onEdit,
  onPassInterview,
  onCopyLink,
  onDelete,
}) => (
  <SectionCard sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mr: 1 }}>
        Actions:
      </Typography>

      {isDraft && isOwner && (
        <Button
          size="small"
          startIcon={<PublishOutlined sx={{ fontSize: 15 }} />}
          onClick={onPublish}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
            color: "#D97706", border: "1px solid #FDE68A", bgcolor: "#FFFBEB",
            "&:hover": { bgcolor: "#FEF3C7" },
          }}
        >
          Publish (1,000 TAI)
        </Button>
      )}

      {isOwner && !isEditing && (
        <Button
          size="small"
          startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
          onClick={onEdit}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
            color: TEAL, border: `1px solid ${TEAL_BORDER}`, bgcolor: TEAL_BG,
            "&:hover": { bgcolor: "#CCFBF1" },
          }}
        >
          Edit Details
        </Button>
      )}

      {!isDraft && (
        <Button
          size="small"
          startIcon={<EmojiEventsOutlined sx={{ fontSize: 15 }} />}
          onClick={onPassInterview}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
            color: "#7C3AED", border: "1px solid #DDD6FE", bgcolor: "#F5F3FF",
            "&:hover": { bgcolor: "#EDE9FE" },
          }}
        >
          Pass Interview
        </Button>
      )}

      {!isDraft && (
        <Button
          size="small"
          startIcon={<ContentCopyOutlined sx={{ fontSize: 15 }} />}
          onClick={onCopyLink}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
            color: "#16A34A", border: "1px solid #BBF7D0", bgcolor: "#F0FDF4",
            "&:hover": { bgcolor: "#DCFCE7" },
          }}
        >
          Copy Interview Link
        </Button>
      )}

      {isOwner && (
        <Button
          size="small"
          startIcon={<DeleteOutlineOutlined sx={{ fontSize: 15 }} />}
          onClick={onDelete}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
            color: "#DC2626", border: "1px solid #FECACA", bgcolor: "#FEF2F2",
            "&:hover": { bgcolor: "#FEE2E2" },
            ml: "auto",
          }}
        >
          Delete Post
        </Button>
      )}
    </Box>
  </SectionCard>
);

export default JobDetailToolbar;
