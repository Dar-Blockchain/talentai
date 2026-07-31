"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

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
      <Image src="/logo.svg" alt="TalentAI" width={129} height={36} className="block h-9 w-32.25 select-none" priority />
    </div>
  );
};

export default HeaderLogo;
