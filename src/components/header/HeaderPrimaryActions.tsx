import React from "react";
import { Button, Stack } from "@mui/material";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const HeaderPrimaryActions = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const userType = user?.role?.toLowerCase()  || localStorage.getItem("userType") || "candidate";

  return (
    <Stack direction="row" spacing={2}>
      <Button
        variant="outlined"
        onClick={() => router.push("/signin")}
        sx={{
          backgroundColor: "#ffffff",
          color: userType === "candidate" ? "#BD85FF" : "#4DD9A3",
          border: "none",
          borderRadius: 999,
          textTransform: "none",
          px: 2,
          py: 0.75,
          fontSize: "14px",
          fontWeight: 600,
          "&:hover": {
            color: "white",
            backgroundColor: userType === "candidate" ? "#BD85FF" : "#4DD9A3",
          },
        }}
      >
        Login
      </Button>
      <Button
        variant="outlined"
        onClick={() =>
          userType === "candidate"
            ? router.push("/signin")
            : window.open(
                "https://www.youtube.com/watch?v=_wGI7HxQQHU",
                "_blank"
              )
        }
        sx={{
          backgroundColor: "#ffffff",
          color: "#383A3D",
          border: "none",
          borderRadius: 999,
          textTransform: "none",
          px: 2,
          py: 0.75,
          fontSize: "14px",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#f9fafb",
          },
        }}
      >
        {userType === "candidate" ? "Sign-up" : "Watch Demo"}
      </Button>
    </Stack>
  );
};

export default HeaderPrimaryActions;
