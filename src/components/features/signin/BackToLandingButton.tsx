import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  themeColors: any;
};

const BackToLandingButton: React.FC<Props> = ({ themeColors }) => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const registerHref = returnUrl
    ? `/register?returnUrl=${encodeURIComponent(returnUrl)}`
    : "/register";

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Don't have an account?{" "}
        <Link href={registerHref} style={{ color: themeColors.primary, fontWeight: 600, textDecoration: "none" }}>
          Register
        </Link>
      </Typography>
    </Box>
  );
};

export default BackToLandingButton;
