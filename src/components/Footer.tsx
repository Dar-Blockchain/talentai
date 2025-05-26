import React from "react";
import { Box, Typography, Link, IconButton, Stack } from "@mui/material";
import YoutubeIcon from "./icons/YoutubeIcon";
import XIcon from "./icons/XIcon";
import LinkedinIcon from "./icons/LinkedinIcon";
import GithubIcon from "./icons/GithubIcon";

const footerSections = [
  {
    title: "Product",
    items: ["Features", "Solutions", "Hiring", "Demo"],
  },
  {
    title: "Company",
    items: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    items: ["Help Center", "Documentation", "API", "Status"],
  },
  {
    title: "Legal",
    items: ["Privacy", "Terms & Conditions", "Security", "Cookies"],
  },
];

const socialLinks = [
  { name: "YouTube", icon: <YoutubeIcon />, href: "#" },
  { name: "X (twitter)", icon: <XIcon />, href: "#" },
  { name: "LinkedIn", icon: <LinkedinIcon />, href: "#" },
  { name: "GitHub", icon: <GithubIcon />, href: "#" },
];

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        color: "#000",
        pt: { xs: 5, sm: 6, md: 8 },
        pb: 2,
        px: 3,
        width: "100%",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap"
        sx={{ gap: "1rem" }}
      >
        <Box sx={{ minWidth: 200 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="TalentAI Logo"
            sx={{ height: 32 }}
          />
          <Typography variant="body2" sx={{ mt: 2, lineHeight: "160%" }}>
            Verified Talent. <br />
            Decentralized Hiring. <br />
            AI-Powered Speed.
          </Typography>
        </Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          flexWrap="wrap"
          sx={{ gap: "1rem" }}
        >
          {footerSections.map((section) => (
            <Box key={section.title} sx={{ minWidth: 120 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {section.title}
              </Typography>
              {section.items.map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="none"
                  color="inherit"
                  variant="body2"
                  sx={{ display: "block", mb: 1 }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          ))}
        </Stack>
      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        sx={{
          mt: { xs: 3, sm: 3, md: 6 },
          justifyContent: { xs: "center", sm: "center", md: "space-between" },
          pt: 2,
          gap: "1rem",
        }}
      >
        {socialLinks.map(({ name, icon, href }) => (
          <Stack
            key={name}
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{
              minWidth: { md: "max-content" },
              gap: "0.25rem",
              px: 2,
              pt: 1,
              borderTop: { md: "2px solid rgba(32, 32, 32, 0.2)" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
            >
              {name}
            </Typography>
            <IconButton href={href} aria-label={name} sx={{ color: "#000" }}>
              {icon}
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Typography
        variant="body2"
        sx={{
          mt: { xs: 2, sm: 2, md: 5 },
          color: "rgba(32, 32, 32, 0.5)",
          textAlign: { xs: "center", sm: "center", md: "start" },
        }}
      >
        © 2025 TalentAI. All rights reserved
      </Typography>
    </Box>
  );
};

export default Footer;
