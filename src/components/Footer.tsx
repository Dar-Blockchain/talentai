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
        pt: 6,
        pb: 2,
        px: 3,
        width: "100%",
      }}
    >
      <Stack
        spacing={4}
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap"
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

      <Stack
        direction="row"
        spacing={4}
        flexWrap="wrap"
        justifyContent="space-between"
        alignItems="center"
        mt={6}
        sx={{ borderTop: "2px solid rgba(32, 32, 32, 0.2)", pt: 2 }}
      >
        {socialLinks.map(({ name, icon, href }) => (
          <Stack
            key={name}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 150 }}
          >
            <Typography variant="body2">{name}</Typography>
            <IconButton href={href} aria-label={name} sx={{ color: "#000" }}>
              {icon}
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Typography
        variant="body2"
        sx={{
          mt: 5,
          color: "rgba(32, 32, 32, 0.5)",
          textAlign: "start",
        }}
      >
        © 2025 TalentAI. All rights reserved
      </Typography>
    </Box>
  );
};

export default Footer;