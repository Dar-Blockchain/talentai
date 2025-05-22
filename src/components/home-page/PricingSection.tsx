import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import PricingCard from "./components/PricingCard";

export const pricingPlans = [
  {
    title: "STARTER",
    price: "$299",
    frequency: "month",
    features: [
      "Up to 10 job postings",
      "Basic AI matching",
      "Resume screening",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    title: "Professional",
    price: "$800",
    frequency: "month",
    features: [
      "Unlimited job postings",
      "Advanced AI matching",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
      "Custom workflows",
    ],
  },
  {
    title: "ARTVERSE PRO",
    price: "Custom",
    frequency: "month",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom AI models",
      "API access",
      "On-premise deployment",
      "Custom integrations",
    ],
  },
];

const PricingSection = () => {
  return (
    <Box
      sx={{
        px: 3,
        py: { sm: 4, md: 5 },
        backgroundColor: "#ffffff",
        color: "#000000",
        mb: 4,
        position: "relative",
      }}
    >
      <Typography
        variant="h3"
        fontWeight={600}
        gutterBottom
        sx={{
          fontSize: {
            xs: "2rem",
            sm: "2.5rem",
            md: "3rem",
            lg: "3.25rem",
          },
          lineHeight: 1.3,
          mb: 0,
        }}
      >
        Simple
        <Box
          component="span"
          sx={{
            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
              md: "3rem",
              lg: "3.25rem",
            },
            lineHeight: 1.3,
            mb: 0,
            color: "rgba(0, 255, 157, 1)",
          }}
        >
          ,
        </Box>
        Transparent Pricing
      </Typography>
      <Typography
        variant="body1"
        fontWeight="400"
        color="#000000"
        sx={{
          my: { xs: 2, md: 2 },
          fontSize: { xs: "0.95rem", sm: "1rem" },
        }}
      >
        All plans include a 14-day free trial.
      </Typography>

      <Stack
        direction="row"
        spacing={5}
        flexWrap="wrap"
        justifyContent="space-between"
        useFlexGap
        sx={{ pt: 2, zIndex: 2 }}
      >
        {pricingPlans.map((plan, index) => (
          <Stack key={index} sx={{ flex: 1, zIndex: 2 }}>
            <PricingCard
              key={plan.title}
              title={plan.title}
              price={plan.price}
              features={plan.features}
            />
          </Stack>
        ))}
      </Stack>
      <Box
        sx={{
          position: "absolute",
          bottom: 150,
          right: "30%",
          width: "90%",
          height: 180,
          backgroundColor: "rgba(0, 255, 157, 0.2)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default PricingSection;
