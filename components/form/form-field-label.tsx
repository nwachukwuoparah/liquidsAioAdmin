import Typography from "@/components/typography";

/** Tailwind class for the required-field asterisk indicator. */
export const FORM_FIELD_REQUIRED_INDICATOR_CLASS = "text-[#CC2929]";

interface FormFieldLabelProps {
    /** Visible field label text. */
    label: string;
    /** Associated input element id. */
    htmlFor: string;
    /** Optional helper text shown below the label. */
    hint?: string;
    /** Marks the field as required for accessibility. */
    isRequired?: boolean;
    /** When false, hides the red asterisk even if the field is required. Default: true. */
    showRequiredIndicator?: boolean;
}

/**
 * Renders a form field label with optional hint copy and a configurable required asterisk.
 * @param props - Label text, target id, and required-indicator options.
 */
export function FormFieldLabel({
    label,
    htmlFor,
    hint,
    isRequired = false,
    showRequiredIndicator = true,
}: FormFieldLabelProps) {
    const shouldShowRequiredIndicator = isRequired && showRequiredIndicator;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={htmlFor} className="flex items-center gap-0.5">
                <Typography type="text14" fontWeight={600} className="!text-[#0B0E05]">
                    {label}
                </Typography>
                {shouldShowRequiredIndicator ? (
                    <span aria-hidden="true" className={FORM_FIELD_REQUIRED_INDICATOR_CLASS}>
                        *
                    </span>
                ) : null}
                {isRequired ? <span className="sr-only">(required)</span> : null}
            </label>
            {hint ? (
                <p className="text-[12px] font-normal leading-normal text-[#667085]">{hint}</p>
            ) : null}
        </div>
    );
}
