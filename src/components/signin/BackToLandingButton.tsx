import React from "react";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type Props = {
  themeColors: any;
};

const BackToLandingButton: React.FC<Props> = ({ themeColors }) => {
  const router = useRouter();
  const userType = useSelector((state: RootState) => state.user.userType);

  const onBackHandle = () =>
    router.push(userType === "company" ? "/home/company" : "/home/candidate");
  
  return (
    <Box sx={{ textAlign: "center" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBackHandle}
        sx={{
          color: themeColors.primary,
          textTransform: "none",
          "&:hover": {
            background: "transparent",
            color: themeColors.primaryHover,
          },
        }}
      >
        Back To Landing
      </Button>
    </Box>
  );
};

export default BackToLandingButton;
