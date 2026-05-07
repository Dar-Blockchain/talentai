import BackToLandingButton from "@/components/features/signin/BackToLandingButton";
import SigninForm from "@/components/features/signin/SigninForm";
import SignInHeader from "@/components/features/signin/SignInHeader";
import SigninContainer from "@/components/features/signin/SinginContainer";
import { Divider } from "@mui/material";

const ACCENT = "#0D9488";

const themeColors = {
  primary: ACCENT,
  primaryHover: "#0B8078",
  primaryLight: "#0F9E92",
  gradient: `linear-gradient(135deg, ${ACCENT} 0%, #059669 100%)`,
};

const Signin = () => {
  return (
    <SigninContainer>
      <SignInHeader themeColors={themeColors} />
      <SigninForm themeColors={themeColors} />
      <Divider sx={{ my: { xs: 1.25, sm: 1.5 }, borderColor: "#F7F8FA" }} />
      <BackToLandingButton themeColors={themeColors} />
    </SigninContainer>
  );
};

export default Signin;
