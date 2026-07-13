import { LogoIcon } from "@/components/vector";
import Typography from "@/components/typography";

/** LiquidsAIO logo and wordmark for auth screens. */
export function AuthLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <LogoIcon className="h-9 w-auto shrink-0" aria-hidden />
            <Typography type="text20" fontWeight={700} className="!text-[#0B0E05] tracking-tight">
                LiquidsAIO
            </Typography>
        </div>
    );
}
