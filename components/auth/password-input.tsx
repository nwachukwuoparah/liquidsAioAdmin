"use client";

import { EyeIcon } from "@/components/vector";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    errorMessage?: string;
}

/** Password field with visibility toggle for auth forms. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    { label = "Password", errorMessage, id, ...inputProps },
    ref,
) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
        <AuthFormField
            id={fieldId}
            ref={ref}
            label={label}
            errorMessage={errorMessage}
            type={isPasswordVisible ? "text" : "password"}
            trailingIcon={
                <button
                    type="button"
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    className="pointer-events-auto text-[#0B0E05A3] transition-colors hover:text-[#0B0E05]"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                >
                    <EyeIcon className="h-5 w-5" />
                </button>
            }
            {...inputProps}
        />
    );
});
