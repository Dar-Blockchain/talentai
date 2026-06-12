import React from "react";
import SigninContainer from "../layout/SigninContainer";
import SignInHeader from "../ui/SignInHeader";
import SigninForm from "../form/SigninForm";
import BackToLandingButton from "../ui/BackToLandingButton";

const SigninPage: React.FC = () => (
  <SigninContainer>
    <SignInHeader />
    <SigninForm />
    <hr className="my-4 border-[#F7F8FA]" />
    <BackToLandingButton />
  </SigninContainer>
);

export default SigninPage;
