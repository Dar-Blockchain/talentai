import React from "react";
import type { JSX } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Container,
  Stack,
} from "@mui/material";
import {
  AccessTime,
  VolumeUp,
  Assignment,
  Computer,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7c3aed",
    },
    secondary: {
      main: "#f97316",
    },
    background: {
      default: "#fbfeff",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

interface InstructionItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

export const TestInstructions = (): JSX.Element => {
  const instructions: InstructionItem[] = [
    {
      icon: <AccessTime />,
      title: "Time Commitment",
      description: "Set aside 30 minutes of uninterrupted time. The test cannot be paused once started.",
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
    },
    {
      icon: <VolumeUp />,
      title: "Quiet Environment",
      description: "Find a quiet room with no background noise. Background sounds can affect your test results.",
      iconBg: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      icon: <Assignment />,
      title: "Individual Assessment",
      description: "Complete the test alone. No other people should be present or helping during the assessment.",
      iconBg: "#f3e8ff",
      iconColor: "#8b5cf6",
    },
    {
      icon: <Computer />,
      title: "Technical Setup",
      description: "Use a stable internet connection. Close other applications to optimize your computer's performance.",
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            py: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
                AI
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              TALENT
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Ahmed Mokhessi
            </Typography>
            <IconButton size="small">
              <KeyboardArrowDown />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ py: 6 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h4" sx={{ mb: 2, color: "text.primary" }}>
              Test Instructions
            </Typography>
            <Typography
              variant="h6"
              sx={{ 
                color: "text.secondary", 
                fontWeight: 400, 
                maxWidth: 500, 
                mx: "auto",
                lineHeight: 1.6
              }}
            >
              Follow these guidelines to complete your interview successfully. Each question type has a specific time limit.
            </Typography>
          </Box>

          {/* Instructions Cards */}
          <Box sx={{ mb: 6 }}>
            <Stack spacing={3}>
              {instructions.map((instruction, index) => (
                <Card key={index} sx={{ transition: "transform 0.2s", "&:hover": { transform: "translateY(-2px)" } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: instruction.iconBg,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Box sx={{ color: instruction.iconColor, fontSize: 28 }}>
                          {instruction.icon}
                        </Box>
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 1, 
                            fontWeight: 600,
                            color: "text.primary"
                          }}
                        >
                          {instruction.title}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: "text.secondary",
                            lineHeight: 1.6
                          }}
                        >
                          {instruction.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Start Button */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: "1.1rem",
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                minWidth: 120,
              }}
            >
              Start
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TestInstructions;