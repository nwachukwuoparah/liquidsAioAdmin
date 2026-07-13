import Typography from "@/components/typography";
import type { ButtonHTMLAttributes } from "react";

interface AuthPrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    isLoading?: boolean;
}

/** Full-width lime-green primary action button for auth screens. */
export function AuthPrimaryButton({
    label,
    isLoading = false,
    disabled,
    className = "",
    ...buttonProps
}: AuthPrimaryButtonProps) {
    return (
        <button
            type="submit"
            disabled={disabled || isLoading}
            className={`flex w-full items-center justify-center rounded-xl bg-[#B1EC52] px-4 py-3.5 transition-colors hover:bg-[#a5dc45] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...buttonProps}
        >
            <Typography type="text16" fontWeight={600} className="!text-[#0B0E05]">
                {isLoading ? "Please wait…" : label}
            </Typography>
        </button>
    );
}
