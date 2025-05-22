import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  onStartTrial?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  onStartTrial,
}) => {
  return (
    <Paper
      elevation={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        background:
          "linear-gradient(100.42deg, rgba(200, 214, 229, 0.45) 16.09%, rgba(138, 233, 179, 0.12) 105.27%)",
        textAlign: "center",
        width: "100%!important",
        height: "100%!important",
        margin: "0 auto",
        color: "#000",
        boxShadow: "0px 4px 50px 0px rgba(122, 122, 122, 0.1)",
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          padding: 4,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {price}/
          <Typography component="span" fontSize="1rem">
            month
          </Typography>
        </Typography>
        <Button
          variant="contained"
          onClick={onStartTrial}
          sx={{
            backgroundColor: "#ffffff",
            color: "#000",
            borderRadius: "999px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
            fontWeight: 600,
            mt: 1,
            "&:hover": {
              backgroundColor: "#f4f4f4",
            },
          }}
        >
          Start Free Trial
        </Button>
      </Box>
      <List
        dense
        sx={{
          flexGrow: 1,
          background: "#fff",
          color: "#000",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
        }}
      >
        {features.map((feature, index) => (
          <ListItem key={index} sx={{ justifyContent: "center" }}>
            <ListItemIcon sx={{ color: "#29d291", minWidth: 30 }}>
              <CheckCircleIcon />
            </ListItemIcon>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: 14, color: "#333" }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PricingCard;
