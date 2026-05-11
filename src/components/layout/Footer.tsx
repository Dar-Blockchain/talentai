import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import NextLink from "next/link";
import {
  Box,
  Link,
  Stack,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useRouter } from "next/router";

const FooterLink: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href = "#",
}) => (
  <Link
    component={NextLink}
    href={href}
    underline="none"
    sx={{
      color: "#ffffff",
      fontFamily: "Fustat",
      fontWeight: 400,
      fontStyle: "normal",
      fontSize: "12px",
      lineHeight: "18px",
      letterSpacing: "0",
      verticalAlign: "middle",
      "&:hover": { color: "#D1D5DB" },
    }}
  >
    {children}
  </Link>
);

const Footer: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const goHome = useCallback(() => {
    if (router.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [router]);

  return (
    <Box
      sx={{
        backgroundColor: "#111827",
        color: "#fff",
        py: 4,
        px: 3,
        pb: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Top Section - Logo + Copyright and Disclaimer */}
        <Box sx={{ mb: 1 }}>
          {/* Logo */}
          <Box sx={{ mb: 1.5 }}>
            <Image
              onClick={goHome}
              src="/images/home/logoDark.svg"
              alt="TalentAI"
              width={140}
              height={40}
              style={{ objectFit: "contain", cursor: "pointer" }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontFamily: "Fustat",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "10px",
              lineHeight: "15px",
              letterSpacing: "0%",
              verticalAlign: "middle",
            }}
          >
            {t("footer.copyright")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.35)",
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "10px",
              lineHeight: "16px",
              mt: 0.5,
            }}
          >
            {t("footer.disclaimer_prefix")}{" "}
            <Link
              component={NextLink}
              href="/terms"
              sx={{
                color: "rgba(255,255,255,0.5)",
                textDecoration: "underline",
                "&:hover": { color: "rgba(255,255,255,0.8)" },
              }}
            >
              {t("footer.terms_of_use")}
            </Link>{" "}
            ·{" "}
            <Link
              component={NextLink}
              href="/privacy"
              sx={{
                color: "rgba(255,255,255,0.5)",
                textDecoration: "underline",
                "&:hover": { color: "rgba(255,255,255,0.8)" },
              }}
            >
              {t("footer.privacy_policy")}
            </Link>
            . {t("footer.disclaimer_suffix")}
          </Typography>
          {/* <Typography variant="caption" sx={{ color: '#D1D5DB', fontSize: '0.75rem', lineHeight: 1.5 }}>
            *Numbers on this page are based on internal data compiled from existing customer base and speed assumption is based on the fact that standard onboarding may take 30 days and Remote's average onboarding time is 2.3 days.
          </Typography> */}
        </Box>

        {/* Divider Line */}
        <Divider
          sx={{ mb: 2, borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}
        />

        {/* Bottom Section - Links and Social Media */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="flex-end"
          gap={{ xs: 3, md: 6 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={{ xs: 2, md: 0 }}
        >
          {/* Policy Links */}
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <FooterLink href="/terms">{t("footer.terms_of_use")}</FooterLink>
            <FooterLink href="/privacy">
              {t("footer.privacy_policy")}
            </FooterLink>
          </Stack>

          {/* Contact email */}
          <Link
            href="mailto:contact@talent-ai.com"
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "rgba(255,255,255,0.7)",
              fontSize: "12px",
              "&:hover": { color: "#fff" },
            }}
          >
            <EmailOutlinedIcon sx={{ fontSize: 16 }} />
            contact@talentai.bid
          </Link>

          {/* Social Media Icons */}
          <Stack direction="row" spacing={1.5}>
            {/* <IconButton
              sx={{
                color: "#ffffff",
                backgroundColor: "#ffffff",
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
              size="small"
            >
              <YouTubeIcon sx={{ color: "#121212", fontSize: "1rem" }} />
            </IconButton> */}
            <IconButton
              component="a"
              href="https://www.linkedin.com/company/talentai-bid/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "#ffffff",
                backgroundColor: "#ffffff",
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
              size="small"
            >
              <LinkedInIcon sx={{ color: "#121212", fontSize: "1rem" }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://x.com/talentai_bid"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "#ffffff",
                backgroundColor: "#ffffff",
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
              size="small"
            >
              <TwitterIcon sx={{ color: "#121212", fontSize: "1rem" }} />
            </IconButton>
            {/* <IconButton
              sx={{
                color: "#ffffff",
                backgroundColor: "#ffffff",
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
              size="small"
            >
              <InstagramIcon sx={{ color: "#121212", fontSize: "1rem" }} />
            </IconButton> */}
            {/* <IconButton
              sx={{
                color: "#ffffff",
                backgroundColor: "#ffffff",
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
              size="small"
            >
              <FacebookIcon sx={{ color: "#121212", fontSize: "1rem" }} />
            </IconButton> */}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
