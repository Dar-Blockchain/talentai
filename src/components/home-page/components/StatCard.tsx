import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";

interface StatCardProps {
  value: string;
  label: string;
  description: string;
  type?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, description, type, color }) => {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: "6px",
              height: { xs: "40px", sm: "40px", md: "50px" },
              backgroundColor: type === "company" ? "#00F09E" : color,
            }}
          />
          <Stack direction="row" alignItems="center" sx={{ pl: 1 }}>
            <Typography
              fontWeight="bold"
              sx={{
                fontSize: {
                  xs: "1.5rem",
                  sm: "1.5rem", 
                  md: "1.75rem",
                },
              }}
            >
              {value}
            </Typography>

            <ExpandCircleDownOutlinedIcon
              fontSize="small"
              sx={{ color: type === "company" ? "#00F09E" : color, alignSelf: "self-start" }}
            />
          </Stack>

          <Typography
            fontWeight={400}
            sx={{
              fontSize: {
                xs: "1.2rem",
                sm: "1.2rem",
                md: "1.25rem",
              },
            }}
          >
            {label}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="#000000"
          sx={{
            pl: 2,
            fontSize: {
              xs: "0.875rem",
              sm: "0.875rem",
              md: "1rem",
            },
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
  );
};

export default StatCard;
