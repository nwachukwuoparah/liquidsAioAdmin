"use client";

import { CustomDropdown, type CustomDropdownOption } from "@/components/custom-dropdown";
import { FormFieldLabel } from "@/components/form/form-field-label";

interface FormFilterDropdownFieldProps {
    label: string;
    hint?: string;
    value: string;
    options: readonly CustomDropdownOption[];
    onChange: (value: string) => void;
    errorMessage?: string;
    isRequired?: boolean;
    showRequiredIndicator?: boolean;
    disabled?: boolean;
    id?: string;
    testId?: string;
    menuTestId?: string;
    optionTestIdPrefix?: string;
}

/** Labelled form field that uses the shared custom dropdown menu. */
export function FormFilterDropdownField({
    label,
    hint,
    value,
    options,
    onChange,
    errorMessage,
    isRequired = false,
    showRequiredIndicator = true,
    disabled = false,
    id,
    testId,
    menuTestId,
    optionTestIdPrefix,
}: FormFilterDropdownFieldProps) {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(errorMessage);

    return (
        <div className="space-y-2">
            <FormFieldLabel
                label={label}
                htmlFor={fieldId}
                hint={hint}
                isRequired={isRequired}
                showRequiredIndicator={showRequiredIndicator}
            />
            <CustomDropdown
                id={fieldId}
                value={value}
                options={options}
                onChange={onChange}
                disabled={disabled}
                variant="form-field"
                hasError={hasError}
                ariaLabel={label}
                testId={testId}
                menuTestId={menuTestId}
                optionTestIdPrefix={optionTestIdPrefix}
            />
            {errorMessage ? (
                <p id={`${fieldId}-error`} className="text-sm text-[#CC2929]">
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
}
