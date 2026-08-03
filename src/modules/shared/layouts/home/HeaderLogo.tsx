"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/router";

const HeaderLogo = () => {
  const router = useRouter();

  const goHome = useCallback(() => {
    if (router.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [router]);

  return (
    <div
      onClick={goHome}
      className="inline-flex cursor-pointer items-center justify-center transition-opacity duration-200 hover:opacity-[0.82]"
    >
      <img src="/logo.svg" alt="TalentAI" className="block h-9 select-none" />
    </div>
  );
};

export default HeaderLogo;
