import { Box, Card, Container } from "@mui/material";

const SigninContainer : React.FC<{children: React.ReactNode;}>= ({children}) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: '100%',
        background: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
        <Card
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 3.5 },
            borderRadius: 3,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0px 4px 50px 0px rgba(0, 0, 0, 0.12)",
            transform: "translateY(-2vh)",
          }}
        >
          {children}
        </Card>
    </Box>
  );
};

export default SigninContainer;
