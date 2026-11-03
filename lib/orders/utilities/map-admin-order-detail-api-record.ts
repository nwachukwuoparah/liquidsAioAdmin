import type {
    AdminOrderDetailApiRecord,
    AdminOrderDetailApiResponse,
    AdminOrderDetailMapped,
    AdminOrderDetailTimelineStep,
    AdminOrderDetailUserApi,
} from "@/lib/orders/types/admin-orders-detail-api.types";

export function formatDetailCurrency(val: number | string | undefined | null): string {
    if (val === undefined || val === null || val === "" || val === "—" || val === "--") return "—";
    if (typeof val === "string" && val.startsWith("$")) return val;
    const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(num) || num <= 0) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(num);
}

export function formatNegativeFee(val: number | string | undefined | null): string {
    if (val === undefined || val === null || val === "" || val === "—" || val === "--") return "—";
    if (typeof val === "string" && val.startsWith("-$")) return val;
    const num = typeof val === "number" ? Math.abs(val) : Math.abs(parseFloat(String(val).replace(/[^0-9.-]+/g, "")));
    if (Number.isNaN(num) || num === 0) return "—";
    return `-$${num.toLocaleString("en-US")}`;
}

import { parseDateSafe } from "@/lib/orders/utilities/map-admin-order-api-record";

export function formatFullDateTime(isoString?: string | null): string {
    if (!isoString || isoString === "—" || isoString === "--") return "—";
    const date = parseDateSafe(isoString);
    if (!date) return isoString;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const hoursFormatted = String(hours).padStart(2, "0");

    const hasTimeComponent = String(isoString).includes("T") || String(isoString).includes(":");
    if (!hasTimeComponent && date.getHours() === 0 && date.getMinutes() === 0) {
        return `${day}-${String(date.getMonth() + 1).padStart(2, "0")}-${year}`;
    }

    return `${month} ${day}, ${year} | ${hoursFormatted}:${minutes}${ampm}`;
}

export function formatShortDateTime(isoString?: string | null): string {
    if (!isoString || isoString === "—" || isoString === "--") return "—";
    const date = parseDateSafe(isoString);
    if (!date) return isoString;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const hoursFormatted = String(hours).padStart(2, "0");

    return `${month} ${day}, ${year} | ${hoursFormatted}:${minutes}${ampm}`;
}

export function formatShortDateOnly(isoString?: string | null): string {
    if (!isoString || isoString === "—" || isoString === "--") return "—";
    const date = parseDateSafe(isoString);
    if (!date) return isoString;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function isInvalidName(val?: string | null): boolean {
    if (!val) return true;
    const trimmed = val.trim();
    return !trimmed || trimmed === "—" || trimmed === "--" || trimmed === "null" || trimmed === "undefined" || trimmed === "[object Object]";
}

function resolveUserDisplay(
    user?: AdminOrderDetailUserApi,
): { id?: string; name: string; phone: string; email: string; avatarUrl?: string } {
    let rawName: string | undefined = undefined;
    const u = (user || {}) as Record<string, any>;

    if (user) {
        if (!isInvalidName(u.name)) {
            rawName = String(u.name).trim();
        } else if (!isInvalidName(u.displayName || u.display_name)) {
            rawName = String(u.displayName || u.display_name).trim();
        } else if (!isInvalidName(u.fullName || u.full_name)) {
            rawName = String(u.fullName || u.full_name).trim();
        } else {
            const joined = [u.firstName || u.first_name, u.lastName || u.last_name].filter(Boolean).join(" ").trim();
            if (!isInvalidName(joined)) {
                rawName = joined;
            } else if (!isInvalidName(u.businessName || u.business_name)) {
                rawName = String(u.businessName || u.business_name).trim();
            } else if (!isInvalidName(u.companyName || u.company_name)) {
                rawName = String(u.companyName || u.company_name).trim();
            } else if (!isInvalidName(u.username || u.user_name)) {
                rawName = String(u.username || u.user_name).trim();
            }
        }
    }

    if (rawName && rawName.toLowerCase() === "buyer account") {
        rawName = "Buyer Account";
    }

    const name = rawName && !isInvalidName(rawName) ? rawName : "—";

    const rawEmail = u.email ? String(u.email).trim() : undefined;
    const isEmailValid = Boolean(
        rawEmail &&
        rawEmail !== "—" &&
        rawEmail !== "--" &&
        !rawEmail.startsWith("—@") &&
        !rawEmail.startsWith("--@") &&
        !rawEmail.startsWith("null@") &&
        rawEmail.includes("@"),
    );
    const email = isEmailValid ? rawEmail! : "—";

    const rawPhone = u.phone || u.phoneNumber || u.phone_number;
    const phone = rawPhone && !isInvalidName(String(rawPhone)) ? String(rawPhone).trim() : "—";

    const avatarUrl =
        u.avatarUrl ||
        u.avatar_url ||
        u.profileImageUrl ||
        u.profile_image_url ||
        u.profilePicture ||
        u.image ||
        undefined;

    return {
        id: user?.id,
        name,
        phone,
        email,
        avatarUrl,
    };
}

function buildTimeline(orderStatus: string): {
    currentStageIndex: number;
    stages: AdminOrderDetailTimelineStep[];
} {
    const normalized = orderStatus.toLowerCase();

    let currentStageIndex = 1; // Default to In-transit active

    if (normalized.includes("delivered")) {
        currentStageIndex = 2;
    } else if (normalized.includes("completed")) {
        currentStageIndex = 3;
    } else if (normalized.includes("preparing") || normalized.includes("awaiting shipment")) {
        currentStageIndex = 1; // Stage 1 completed, Stage 2 in-progress matching UI
    }

    const stages: AdminOrderDetailTimelineStep[] = [
        {
            key: "preparing",
            title: "Preparing to ship",
            description: "Package is being prepared for shipping",
            status: currentStageIndex >= 1 ? "completed" : "current",
        },
        {
            key: "in_transit",
            title: "In transit",
            description: "Your package is now being transported to your location.",
            status:
                currentStageIndex > 1
                    ? "completed"
                    : currentStageIndex === 1
                      ? "current"
                      : "pending",
        },
        {
            key: "delivered",
            title: "Delivered",
            description: "",
            status:
                currentStageIndex > 2
                    ? "completed"
                    : currentStageIndex === 2
                      ? "current"
                      : "pending",
        },
        {
            key: "completed",
            title: "Order completed",
            description: "",
            status: currentStageIndex === 3 ? "completed" : "pending",
        },
    ];

    return {
        currentStageIndex,
        stages,
    };
}

export function mapAdminOrderDetailApiRecord(
    rawResponse: unknown,
    requestedOrderId: string,
): AdminOrderDetailMapped {
    const res = (rawResponse || {}) as AdminOrderDetailApiResponse;
    const record: AdminOrderDetailApiRecord = res.data || (res as AdminOrderDetailApiRecord);

    const summary = record.orderSummary || res.orderSummary || {};
    const payment = record.paymentSummary || res.paymentSummary || {};
    const shipping = record.shippingInformation || res.shippingInformation || {};
    const buyerRaw =
        record.buyer ||
        record.buyerInformation ||
        (record as any).buyer_information ||
        (record as any).buyerProfile ||
        (record as any).customer ||
        (summary as any).buyer ||
        res.buyer;
    const sellerRaw =
        record.seller ||
        record.sellerInformation ||
        (record as any).seller_information ||
        (record as any).sellerProfile ||
        (record as any).vendor ||
        (record as any).creator ||
        (record as any).lot?.creator ||
        (record as any).lot?.seller ||
        (summary as any).seller ||
        res.seller;

    // Order ID
    const rawOrderId =
        summary.orderId ||
        summary.order_id ||
        summary.orderNumber ||
        summary.order_number ||
        record.orderId ||
        record.order_id ||
        record.id ||
        requestedOrderId ||
        "—";

    const formattedOrderId = rawOrderId === "—" ? "—" : (rawOrderId.startsWith("#") ? rawOrderId : `#${rawOrderId}`);

    // Order Status
    const orderStatus =
        summary.orderStatus ||
        summary.order_status ||
        (summary as any).fulfillmentStatus ||
        (summary as any).shippingStatus ||
        summary.status ||
        (record as any).orderStatus ||
        (record as any).order_status ||
        "—";

    // Order quantity
    let orderQuantity = "—";
    if (summary.orderQuantity || summary.order_quantity) {
        const rawQ = String(summary.orderQuantity || summary.order_quantity).trim();
        if (rawQ && rawQ !== "0" && rawQ !== "—" && rawQ !== "--") {
            orderQuantity = rawQ;
        }
    } else if (
        summary.quantity !== undefined &&
        summary.quantity !== null &&
        summary.quantity !== "" &&
        Number(summary.quantity) > 0
    ) {
        const unit = summary.unit || "pallets";
        orderQuantity = `${summary.quantity} ${unit}`;
    }

    // Payment amounts
    const candidateAmounts = [
        payment.amount,
        payment.paymentAmount,
        (payment as any).payment_amount,
        (payment as any).total,
        (record as any).amount,
        (record as any).total,
        (record as any).totalAmount,
        (record as any).price,
        (summary as any).amount,
        (summary as any).total,
        (record as any).lot?.price,
    ];

    let foundAmount: number | undefined = undefined;
    for (const cand of candidateAmounts) {
        if (cand !== undefined && cand !== null && cand !== "") {
            const num = typeof cand === "number" ? cand : parseFloat(String(cand).replace(/[^0-9.-]+/g, ""));
            if (!Number.isNaN(num) && num > 0) {
                foundAmount = num;
                break;
            }
        }
    }

    const rawShippingFee =
        payment.shippingFee !== undefined && payment.shippingFee !== null && payment.shippingFee !== ""
            ? payment.shippingFee
            : payment.shipping_fee !== undefined && payment.shipping_fee !== null && payment.shipping_fee !== ""
              ? payment.shipping_fee
              : undefined;

    const rawPlatformFee =
        payment.platformFee !== undefined && payment.platformFee !== null && payment.platformFee !== ""
            ? payment.platformFee
            : payment.platform_fee !== undefined && payment.platform_fee !== null && payment.platform_fee !== ""
              ? payment.platform_fee
              : undefined;

    const rawSellerNetPayout =
        payment.sellerNetPayout !== undefined && payment.sellerNetPayout !== null && payment.sellerNetPayout !== ""
            ? payment.sellerNetPayout
            : payment.seller_net_payout !== undefined && payment.seller_net_payout !== null && payment.seller_net_payout !== ""
              ? payment.seller_net_payout
              : (foundAmount !== undefined && rawShippingFee !== undefined && rawPlatformFee !== undefined)
                ? Math.max(0, foundAmount - Math.abs(Number(rawShippingFee)) - Math.abs(Number(rawPlatformFee)))
                : undefined;

    // Payout hold
    const isHeld = Boolean(payment.payoutHold || payment.payout_hold);
    const holdObj =
        typeof payment.payoutHold === "object" && payment.payoutHold
            ? payment.payoutHold
            : typeof payment.payout_hold === "object" && payment.payout_hold
              ? payment.payout_hold
              : undefined;

    const holdReason = holdObj?.reason || (isHeld ? "—" : undefined);

    const holdRecord = holdObj as Record<string, string | undefined> | undefined;
    const holdDateStr = holdRecord?.heldAt || holdRecord?.dateWithheld || holdRecord?.date_withheld;
    const holdDate = isHeld ? (holdDateStr ? formatShortDateOnly(holdDateStr) : "—") : undefined;

    const holdByName = holdRecord?.heldBy || holdRecord?.actionBy || holdRecord?.action_by || (isHeld ? "—" : undefined);
    const holdByAvatar = holdRecord?.avatarUrl || undefined;
    const holdBy = isHeld && holdByName && holdByName !== "—" ? { name: holdByName, avatarUrl: holdByAvatar } : undefined;

    // Payout status
    let payoutStatus = payment.payoutStatus || payment.payout_status;
    if (isHeld) {
        payoutStatus = "On hold";
    } else if (payoutStatus) {
        if (payoutStatus.toLowerCase() === "processing") {
            payoutStatus = "In Escrow";
        }
    } else {
        payoutStatus = "—";
    }

    const paymentDateStr = payment.paymentDate || payment.payment_date || payment.paidAt || payment.paid_at || (record as any).createdAt || (record as any).created_at;
    const formattedPaymentDate = paymentDateStr
        ? formatFullDateTime(paymentDateStr)
        : "—";

    const payoutDateStr = payment.payoutDate || payment.payout_date;
    const formattedPayoutDate = payoutDateStr ? formatFullDateTime(payoutDateStr) : "—";

    // Shipping info
    const carrier = (shipping.carrier && shipping.carrier.trim()) || "—";
    const trackingNumber = (shipping.trackingNumber || shipping.tracking_number || "").trim() || "—";
    const rawShippedOn = shipping.shippedOn || shipping.shipped_on || shipping.shippedAt || shipping.shipped_at;
    const shippedOn = rawShippedOn ? formatShortDateTime(rawShippedOn) : "—";
    const rawDeliveredOn = shipping.deliveredOn || shipping.delivered_on || shipping.deliveredAt || shipping.delivered_at;
    const deliveredOn = rawDeliveredOn ? formatShortDateTime(rawDeliveredOn) : "—";

    const timeline = buildTimeline(orderStatus);

    return {
        orderId: formattedOrderId,
        rawId: record.id || requestedOrderId,
        orderStatus,
        orderQuantity,
        lotTitle: summary.title || summary.lotTitle || summary.lot_title,
        seller: resolveUserDisplay(sellerRaw),
        buyer: resolveUserDisplay(buyerRaw),
        payment: {
            date: formattedPaymentDate,
            rawDate: paymentDateStr || undefined,
            amount: formatDetailCurrency(foundAmount),
            rawAmount: foundAmount,
            shippingFee: formatNegativeFee(rawShippingFee),
            platformFee: formatNegativeFee(rawPlatformFee),
            sellerNetPayout: formatDetailCurrency(rawSellerNetPayout),
            payoutStatus,
            payoutDate: formattedPayoutDate,
            isHeld,
            holdReason,
            holdDate,
            holdBy,
        },
        shipping: {
            carrier,
            trackingNumber,
            shippedOn,
            deliveredOn,
        },
        timeline,
    };
}
