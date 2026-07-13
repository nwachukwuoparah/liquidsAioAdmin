import Typography from "@/components/typography";
import {
    DEFAULT_EMPTY_STATE_DESCRIPTION,
    DEFAULT_EMPTY_STATE_IMAGE_SRC,
} from "@/lib/constants/empty-state.constant";
import Image from "next/image";
import type { ReactNode } from "react";

export interface EmptyStateProps {
    /** Primary empty-state heading. */
    title: string;
    /** Supporting message shown below the title. */
    description?: string;
    /** Illustration source. Defaults to the app favicon placeholder. */
    imageSrc?: string;
    /** Accessible label for the illustration. */
    imageAlt?: string;
    className?: string;
    children?: ReactNode;
    testId?: string;
}

/** Reusable empty state for admin lists and data tables. */
export function EmptyState({
    title,
    description = DEFAULT_EMPTY_STATE_DESCRIPTION,
    imageSrc = DEFAULT_EMPTY_STATE_IMAGE_SRC,
    imageAlt,
    className = "",
    children,
    testId = "empty-state",
}: EmptyStateProps) {
    return (
        <div
            data-testid={testId}
            className={`flex w-full flex-col items-center justify-center px-4 py-12 text-center ${className}`}
        >
            <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-2xl border border-[#0B0E0514] bg-[#0B0E050A] p-4">
                <Image
                    src={imageSrc}
                    alt={imageAlt ?? title}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain opacity-80"
                />
            </div>

            <Typography type="text16" fontWeight={600} className="text-[#0B0E05]">
                {title}
            </Typography>

            {description ? (
                <Typography
                    type="text14"
                    fontWeight={400}
                    className="mt-2 max-w-sm text-[#0B0E05A3]"
                >
                    {description}
                </Typography>
            ) : null}

            {children ? <div className="mt-4">{children}</div> : null}
        </div>
    );
}
