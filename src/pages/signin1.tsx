import { SignInHeader } from "@/components/auth";
import BackToLandingButton from "@/components/auth/BackToLandingButton";
import SigninForm from "@/components/auth/SigninForm";
import SigninContainer from "@/components/auth/SinginContainer";
import { RootState } from "@/store/store";
import { Divider } from "@mui/material";
import { useSelector } from "react-redux";

const Signin = () => {
  const userType = useSelector((state: RootState) => state.user.userType);

  const themeColors = {
    primary:
      userType === "company"
        ? "rgba(41, 210, 145, 0.83)"
        : "rgba(131, 16, 255, 0.83)",
    primaryHover:
      userType === "company"
        ? "rgba(41, 210, 145, 0.73)"
        : "rgba(131, 16, 255, 0.73)",
    primaryLight:
      userType === "company"
        ? "rgba(41, 210, 145, 0.93)"
        : "rgba(131, 16, 255, 0.93)",
    gradient:
      userType === "company"
        ? "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)"
        : "linear-gradient(135deg, rgba(131, 16, 255, 0.33), #8310FF)",
  };
  return (
    <SigninContainer>
      <SignInHeader themeColors={themeColors}/>
      <SigninForm themeColors={themeColors}/>
      <Divider sx={{ my: 3 }} />
      <BackToLandingButton
        themeColors={themeColors}
      />
    </SigninContainer>
  );
};

export default Signin;
