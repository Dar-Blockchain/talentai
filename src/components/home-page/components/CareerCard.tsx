import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

type FeatureCardProps = {
  icon: React.ReactElement;
  title: any;
  description: string;
};

const CareerCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Card
      sx={{
        textAlign: "center",
        padding: 6,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        color: "#000",
        boxShadow: "0px 5.48px 36.99px 0px #7A7A7A21",

        backdropFilter: "blur(20.549848556518555px)",

        WebkitBackdropFilter: "blur(20.549848556518555px)",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
      }}
      elevation={0}
    >
      <Box>{icon}</Box>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '100%',
            letterSpacing: '0%',
            textAlign: 'center',
          }}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            fontSize: '19px',
            lineHeight: '100%',
            letterSpacing: '0%',
            textAlign: 'center',
            pt: 2,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CareerCard;
