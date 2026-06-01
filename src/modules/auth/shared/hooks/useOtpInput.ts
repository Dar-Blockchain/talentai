import { useRef, useState } from "react";
import { OTP_CODE_LENGTH } from "../types";

export function useOtpInput() {
  const [otpCode, setOtpCode] = useState<string[]>(Array(OTP_CODE_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "")[0] ?? "";
    const next = [...otpCode];
    next[index] = digit;
    setOtpCode(next);
    if (digit && index < OTP_CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    const next = Array(OTP_CODE_LENGTH).fill("");
    for (let i = 0; i < OTP_CODE_LENGTH; i++) next[i] = paste[i] ?? "";
    setOtpCode(next);
    inputsRef.current[Math.min(paste.length, OTP_CODE_LENGTH - 1)]?.focus();
  };

  const reset = () => setOtpCode(Array(OTP_CODE_LENGTH).fill(""));

  return { otpCode, inputsRef, handleChange, handleKeyDown, handlePaste, reset };
}
