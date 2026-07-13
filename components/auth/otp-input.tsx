"use client";

import Typography from "@/components/typography";
import { AUTH_OTP_LENGTH } from "@/lib/auth/constants/two-factor.constant";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useRef } from "react";

interface OtpInputProps {
    value: string;
    onChange: (nextValue: string) => void;
    disabled?: boolean;
}

/** Single-digit OTP input boxes for two-factor verification. */
export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const digits = value.padEnd(AUTH_OTP_LENGTH, " ").slice(0, AUTH_OTP_LENGTH).split("");

    const updateDigit = (index: number, nextDigit: string) => {
        const sanitizedDigit = nextDigit.replace(/\D/g, "").slice(-1);
        const nextDigits = [...digits.map((digit) => (digit === " " ? "" : digit))];
        nextDigits[index] = sanitizedDigit;
        onChange(nextDigits.join("").slice(0, AUTH_OTP_LENGTH));

        if (sanitizedDigit && index < AUTH_OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Backspace") {
            return;
        }

        const currentDigit = digits[index]?.trim();
        if (currentDigit) {
            updateDigit(index, "");
            return;
        }

        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
            updateDigit(index - 1, "");
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, AUTH_OTP_LENGTH);
        onChange(pastedDigits);

        const focusIndex = Math.min(pastedDigits.length, AUTH_OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex justify-between gap-2 sm:gap-3">
            {digits.map((digit, index) => (
                <input
                    key={`otp-${index}`}
                    ref={(element) => {
                        inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`Digit ${index + 1} of ${AUTH_OTP_LENGTH}`}
                    maxLength={1}
                    value={digit.trim()}
                    disabled={disabled}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className="h-14 w-full max-w-[56px] rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] text-center text-xl font-semibold text-[#0B0E05] outline-none transition-colors focus:border-[#518300] disabled:cursor-not-allowed disabled:bg-[#0B0E050A]"
                />
            ))}
        </div>
    );
}

/** Helper text shown below OTP inputs. */
export function OtpHint() {
    return (
        <Typography type="text14" fontWeight={400} className="!text-[#0B0E05A3]">
            Enter the {AUTH_OTP_LENGTH}-digit code from your authenticator app.
        </Typography>
    );
}
