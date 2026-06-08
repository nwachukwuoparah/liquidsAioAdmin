import Typography from "@/components/typography";
import { getPaymentStatusStyles } from "@/lib/order-status";

export function PaymentStatusBadge({ status }: { status: string }) {
    const { text, bg, label } = getPaymentStatusStyles(status);

    return (
        <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 py-1 ${bg}`}>
            <Typography type="text12" fontWeight={600} className={`text-[11px] leading-none ${text}`}>
                {label}
            </Typography>
        </span>
    );
}
