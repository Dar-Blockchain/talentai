import { useRef, useState, useCallback } from "react";
import { OTP_CODE_LENGTH } from "../types";

export function useOtpInput() {
  const [otpCode, setOtpCode] = useState<string[]>(Array(OTP_CODE_LENGTH).fill(""));
  const inputsRef  = useRef<Array<HTMLInputElement | null>>([]);

  // Mirror the latest otpCode into a ref so the callbacks below can read the
  // current value without closing over stale state. Updating a ref is
  // synchronous and does not trigger a re-render, so this is safe.
  const otpCodeRef = useRef(otpCode);
  otpCodeRef.current = otpCode;

  // Empty dep arrays: all three handlers are stable for the component lifetime.
  // This prevents AppOtpVerifyStep from re-rendering all 6 inputs on each keystroke.

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "")[0] ?? "";
    const next  = [...otpCodeRef.current];
    next[index] = digit;
    setOtpCode(next);
    if (digit && index < OTP_CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCodeRef.current[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    const next = Array(OTP_CODE_LENGTH).fill("");
    for (let i = 0; i < OTP_CODE_LENGTH; i++) next[i] = paste[i] ?? "";
    setOtpCode(next);
    inputsRef.current[Math.min(paste.length, OTP_CODE_LENGTH - 1)]?.focus();
  }, []);

  const reset = useCallback(() => setOtpCode(Array(OTP_CODE_LENGTH).fill("")), []);

  return { otpCode, inputsRef, handleChange, handleKeyDown, handlePaste, reset };
}
