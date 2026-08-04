import React from "react";

interface ChatUnreadBadgeProps {
  count: number;
  size?: "sm" | "md";
}

const ChatUnreadBadge: React.FC<ChatUnreadBadgeProps> = ({ count, size = "sm" }) => {
  if (count <= 0) return null;

  const label = count > 9 ? "9+" : count;
  const dimensionsClass = size === "md"
    ? "min-w-[20px] h-5 text-[10px] px-1.5"
    : "min-w-[18px] h-[18px] text-[9px] px-1";

  return (
    <span
      className={`${dimensionsClass} rounded-full bg-[#EF4444] text-white inline-flex items-center justify-center font-bold leading-none shrink-0`}
    >
      {label}
    </span>
  );
};

export default ChatUnreadBadge;
