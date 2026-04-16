import { RootState } from "@/store/store";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

type Props = {
  themeColors: any;
};
const SignInHeader: React.FC<Props> = ({themeColors}) => {
  const router = useRouter();
  const userType = useSelector((state: RootState) => state.user.userType);

  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src={userType === "company" ? "/logo.svg" : "/logo-purple.svg"}
          alt="TalentAI Logo"
          sx={{ height: 32, cursor: "pointer" }}
          onClick={() => router.push("/")}
        />
        <Typography
          variant="caption"
          sx={{
            color: "#000",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
            mt: 0.5,
          }}
        >
          Professional Recruitment
        </Typography>
      </Box>

      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          background: themeColors.gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1,
          letterSpacing: "-0.01em",
        }}
      >
        Welcome Back
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#000",
          mb: 4,
          maxWidth: "80%",
          mx: "auto",
          lineHeight: 1.6,
        }}
      >
        Sign in to access your recruitment dashboard
      </Typography>
    </>
  );
};

export default SignInHeader;
