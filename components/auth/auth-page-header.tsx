import Typography from "@/components/typography";

interface AuthPageHeaderProps {
    title: string;
    description: string;
}

/** Stacked title and description for auth screens. */
export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
    return (
        <div className="mt-10 flex flex-col gap-2 [&>div]:block [&>div]:w-full">
            <Typography type="text32" fontWeight={700} usemomo className="!text-[#0B0E05]">
                {title}
            </Typography>
            <Typography type="text16" fontWeight={400} className="!text-[#0B0E05A3]">
                {description}
            </Typography>
        </div>
    );
}
