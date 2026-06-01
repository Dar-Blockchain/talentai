import React from "react";
import { Divider } from "@mui/material";
import SigninContainer from "../layout/SigninContainer";
import SignInHeader from "../ui/SignInHeader";
import SigninForm from "../form/SigninForm";
import BackToLandingButton from "../ui/BackToLandingButton";

const SigninPage: React.FC = () => (
  <SigninContainer>
    <SignInHeader />
    <SigninForm />
    <Divider sx={{ my: { xs: 1.25, sm: 1.5 }, borderColor: "#F7F8FA" }} />
    <BackToLandingButton />
  </SigninContainer>
);

export default SigninPage;
