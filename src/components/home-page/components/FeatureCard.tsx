import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

type FeatureCardProps = {
  icon: React.ReactElement;
  title: any;
  description: string;
  type: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  type,
}) => {
  return (
    <Card
      sx={{
        textAlign: "center",
        padding: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        color: "#000",
        boxShadow: type === "company" ? "0px 4px 50px 0px rgba(20, 189, 124, 0.15)" : "0px 4px 50px 0px rgba(131, 16, 255, 0.15)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
      }}
      elevation={0}
    >
      <Box>{icon}</Box>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1rem",
          }}
          fontWeight="600"
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            pt: 2
          }}
          fontWeight="400"
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
