import Typography from "@/components/typography";
import { getLotStatusStyles } from "@/lib/inventory-status";

export function LotStatusBadge({ status }: { status: string }) {
    const { text, bg, label } = getLotStatusStyles(status);

    return (
        <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 py-1 ${bg}`}>
            <Typography type="text12" fontWeight={600} className={`text-[11px] leading-none ${text}`}>
                {label}
            </Typography>
        </span>
    );
}
