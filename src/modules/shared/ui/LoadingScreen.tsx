import React from "react";
import Image from "next/image";

interface LoadingScreenProps {
  title?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ title }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
    <Image
      src="/gif/loading.gif"
      alt="Loading…"
      width={96}
      height={96}
      unoptimized
      className="w-24 h-24 object-contain"
      draggable={false}
    />
    {title && (
      <p className="text-[15px] font-medium text-[#18191C]">{title}</p>
    )}
  </div>
);

export default LoadingScreen;
