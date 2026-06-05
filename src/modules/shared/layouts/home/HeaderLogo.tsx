"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/router";

const HeaderLogo = () => {
  const router = useRouter();

  const goHome = useCallback(() => {
    if (router.pathname === "/") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    router.push("/");
  }, [router]);

  return (
    <button
      onClick={goHome}
      className="inline-flex items-center justify-center cursor-pointer transition-opacity hover:opacity-[0.82] bg-transparent border-0 p-0"
    >
      <img src="/images/home/logo.svg" alt="TalentAI" style={{ height: 36, display: "block", userSelect: "none" }} />
    </button>
  );
};

export default HeaderLogo;
