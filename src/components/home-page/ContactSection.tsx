import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { useRouter } from "next/router";

const ContactSection = ({ type, color }: { type: string; color: string }) => {
  const router = useRouter();
  return (
    <Box
      id="contact"
      sx={{
        backgroundColor: color,
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
                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              textAlign: {xs: 'center',sm: 'center', md: 'start'}
            }}
          >
            {type === "jobseeker" ? "Start Now. For Free." : "Start Your Free Trial"}
            <br />
            {type === "company" ? "Today" : ""}
          
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

          {type === "company" ? "Join thousands of companies already using TalentAI to revolutionize their hiring process" : "No résumé. No cover letter. Just real skills, verified."}
           
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/signin')}
            sx={{
              backgroundColor: type === "company" ? "rgba(41, 210, 145, 0.83)" : "#8310FF",
              color: "#fff",
              borderRadius: 999,
              textTransform: "none",
              padding: "6px 20px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: type === "company" ? "rgba(41, 210, 145, 0.73)" : "#8310FF",
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
