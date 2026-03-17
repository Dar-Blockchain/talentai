import BackToLandingButton from "@/components/features/signin/BackToLandingButton";
import SigninForm from "@/components/features/signin/SigninForm";
import SignInHeader from "@/components/features/signin/SignInHeader";
import SigninContainer from "@/components/features/signin/SinginContainer";
import { RootState } from "@/store/store";
import { Divider } from "@mui/material";
import { useSelector } from "react-redux";

const Signin = () => {
  const userType = useSelector((state: RootState) => state.user.userType);

  const themeColors = {
    primary:
      userType === "company"
        ? "rgba(41, 210, 145, 0.83)"
        : userType === "employee"
        ? "rgba(33, 150, 243, 0.83)"
        : "rgba(131, 16, 255, 0.83)",
    primaryHover:
      userType === "company"
        ? "rgba(41, 210, 145, 0.73)"
        : userType === "employee"
        ? "rgba(33, 150, 243, 0.73)"
        : "rgba(131, 16, 255, 0.73)",
    primaryLight:
      userType === "company"
        ? "rgba(41, 210, 145, 0.93)"
        : userType === "employee"
        ? "rgba(33, 150, 243, 0.93)"
        : "rgba(131, 16, 255, 0.93)",
    gradient:
      userType === "company"
        ? "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)"
        : userType === "employee"
        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.33), #2196F3)"
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
