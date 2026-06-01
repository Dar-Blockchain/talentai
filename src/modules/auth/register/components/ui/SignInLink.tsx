import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { ACCENT } from "@/modules/auth/shared/types";

interface Props {
  returnUrl?: string;
  label: string;
}

const SignInLink: React.FC<Props> = ({ returnUrl, label }) => (
  <Box sx={{ pt: 0.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      <Typography sx={{ fontSize: { xs: "0.6875rem", sm: "0.71875rem", md: "0.75rem" }, color: "#9CA3AF", fontFamily: "Poppins", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
    </Box>
    <Link href={returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin"} style={{ textDecoration: "none" }}>
      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", height: { xs: 44, sm: 46, md: 48 }, borderRadius: "14px", px: { xs: 1.5, sm: 2 }, border: `1.5px solid ${ACCENT}44`, color: ACCENT, fontFamily: "Poppins", fontWeight: 700, fontSize: { xs: "0.82rem", sm: "0.88rem", md: "0.95rem" }, transition: "all 0.2s", "&:hover": { bgcolor: `${ACCENT}08`, borderColor: ACCENT } }}>
        <Box component="span" sx={{ px: { xs: 0.25, md: 0 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: { xs: "normal", sm: "nowrap" }, textAlign: "center", lineHeight: 1.25 }}>
          {label}
        </Box>
      </Box>
    </Link>
  </Box>
);

export default SignInLink;
