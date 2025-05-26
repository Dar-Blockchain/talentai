import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";

const ContactSection = () => {
  return (
    <Box
      id="contact"
      sx={{
        backgroundColor: "rgba(41, 210, 145, 0.18)",
        color: "#000000",
        mx: 3,
        py: { xs: 3, sm: 4, md: 5 },
        borderRadius: "10px",
        position: "relative",
        maxHeight: "max-content",
      }}
    >
      <Stack
        direction="row"
        spacing={4}
        flexWrap="wrap"
        alignItems="center"
        useFlexGap
        sx={{ pt: {sm: 0 , md:2}, zIndex: 2 }}
      >
        <Box
          component="img"
          src="/images/home/joinus.png"
          alt="Join Us"
          sx={{
            display: {xs: 'none', sm: 'none', md: 'flex'},
            maxWidth: "60%",
            maxHeight: "auto",
            borderRadius: 2,
            position: "relative",
            zIndex: 1,
            flex: 1,
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: {xs:'center', sm:'center', md:"flex-start"},
            gap: "16px",
            flex: 1,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              fontSize: {
                xs: "1.75rem",
                sm: "2rem",
                md: "2.25rem",
                lg: "2.5rem",
              },
              textAlign: {xs: 'center',sm: 'center', md: 'start'}
            }}
          >
            Start Your Free Trial
            <br />
            Today
          </Typography>
          <Typography
            fontWeight={400}
            sx={{
              fontSize: {
                xs: "0.75rem",
                sm: "1rem",
                md: "1,25rem",
                lg: "1.5rem",
              },
              textAlign: {xs: 'center',sm: 'center', md: 'start'},
              mt: 1,
            }}
          >
            Join thousands of companies already <br /> using TalentAI to
            revolutionize their
            <br /> hiring process
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgba(41, 210, 145, 0.83)",
              color: "#fff",
              borderRadius: 999,
              textTransform: "none",
              padding: "6px 20px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(41, 210, 145, 0.73)",
              },
            }}
          >
            Get Started Free
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ContactSection;
