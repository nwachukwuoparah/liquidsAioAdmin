"use client";

import Typography from "@/components/typography";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";
import { SUPPORTED_COUNTRY_CODE } from "@/lib/constants/supported-region.constant";
import type { Control, FieldValues, Path } from "react-hook-form";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface AuthPhoneInputProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    label?: string;
    showLabel?: boolean;
    errorMessage?: string;
    defaultCountry?: Country;
    disabled?: boolean;
    inputAriaLabel?: string;
}

/** Phone input with country selector integrated with React Hook Form. */
export function AuthPhoneInput<TFieldValues extends FieldValues>({
    control,
    name,
    label = "Phone number",
    showLabel = true,
    errorMessage,
    defaultCountry = DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE,
    disabled = false,
    inputAriaLabel,
}: AuthPhoneInputProps<TFieldValues>) {
    const supportedCountries = [SUPPORTED_COUNTRY_CODE];
    const fieldId = String(name).toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(errorMessage);

    return (
        <div className="space-y-2">
            {showLabel ? (
                <label htmlFor={fieldId}>
                    <Typography type="text14" fontWeight={600} className="!text-[#0B0E05]">
                        {label}
                    </Typography>
                </label>
            ) : null}
            <PhoneInputWithCountry
                id={fieldId}
                control={control}
                name={name}
                defaultCountry={defaultCountry}
                countries={supportedCountries as any}
                international
                countryCallingCodeEditable={false}
                disabled={disabled}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${fieldId}-error` : undefined}
                className={`auth-phone-input ${hasError ? "auth-phone-input--error" : ""} ${disabled ? "auth-phone-input--disabled" : ""}`}
                numberInputProps={{
                    className: "auth-phone-input__number",
                    placeholder: "Enter phone number",
                    "aria-label": inputAriaLabel,
                }}
            />
            {errorMessage ? (
                <p id={`${fieldId}-error`} className="text-sm text-[#CC2929]">
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
}
