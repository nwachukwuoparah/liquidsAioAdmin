"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Typography from "@/components/typography";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import {
    ArrowLeftIcon,
    ArrowUUpLeftIcon,
    ArrowsLeftRightIcon,
    CheckCircleIcon,
    CopyIcon,
    FlagIcon,
    HandPalmIcon,
    ModalCloseIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import type { AdminOrderRecord } from "@/lib/admin/types/admin-api.types";
import HoldPaymentModal from "@/components/modals/hold-payment-modal";
import ReleasePaymentModal from "@/components/modals/release-payment-modal";
import RefundBuyerModal from "@/components/modals/refund-buyer-modal";
import { useAdminOrderDetail } from "@/lib/admin/hooks/use-admin-orders";
import { OrderDetailsSkeleton } from "@/components/skeletons/order-details-skeleton";
import { ProfileAvatar } from "@/components/profile-avatar";
import { mapAdminOrderDetailApiRecord } from "@/lib/orders/utilities/map-admin-order-detail-api-record";

export interface OrderDetailsModalProps {
    orderId?: string;
    order?: AdminOrderRecord;
    onClose: () => void;
}

export default function OrderDetailsModal({
    orderId: propOrderId,
    order,
    onClose,
}: OrderDetailsModalProps) {
    const { showModal } = useModal();
    const primaryOrderId = order?.rawId || propOrderId || order?.orderId || "";
    const fallbackUuid = order?.internalId || order?.uuid || "";
    const displayOrderId = order?.orderId || propOrderId || primaryOrderId || "";

    const detailQuery = useAdminOrderDetail(
        primaryOrderId || fallbackUuid,
        Boolean(primaryOrderId || fallbackUuid),
        fallbackUuid !== primaryOrderId ? fallbackUuid : undefined,
    );

    // Fallback mapped record if query has not completed or in mock context
    const fallbackRecord = order ? mapAdminOrderDetailApiRecord({
        data: {
            orderSummary: {
                orderId: order.orderId,
                orderStatus: order.orderStatus,
                title: order.title,
            },
            paymentSummary: {
                amount: order.amount,
                payoutStatus: order.payStatus,
                paymentDate: order.date,
            },
            buyer: { name: order.buyer },
            seller: { name: order.seller },
        },
    }, displayOrderId) : null;

    const detail = detailQuery.data || fallbackRecord;

    const [isHeldOverride, setIsHeldOverride] = useState<boolean | null>(null);
    const isHeld = isHeldOverride !== null ? isHeldOverride : (detail?.payment.isHeld ?? false);

    React.useEffect(() => {
        if (detailQuery.data?.payment) {
            setIsHeldOverride(null);
        }
    }, [detailQuery.data]);

    const handleCopyTracking = () => {
        if (!detail?.shipping.trackingNumber || detail.shipping.trackingNumber === "—") return;
        if (navigator.clipboard) {
            void navigator.clipboard.writeText(detail.shipping.trackingNumber);
            toast.success("Tracking number copied to clipboard");
        }
    };

    const handleOpenHoldPayment = () => {
        if (!detail) return;
        showModal({
            content: (close) => (
                <HoldPaymentModal
                    orderId={detail.orderId}
                    onClose={close}
                    onSuccess={() => {
                        setIsHeldOverride(true);
                        void detailQuery.refetch();
                    }}
                />
            ),
            panelClassName: "max-w-[460px] w-full p-0 rounded-2xl overflow-hidden",
        });
    };

    const handleOpenReleasePayment = () => {
        if (!detail) return;
        showModal({
            content: (close) => (
                <ReleasePaymentModal
                    orderId={detail.orderId}
                    onClose={close}
                    onSuccess={() => {
                        setIsHeldOverride(false);
                        void detailQuery.refetch();
                    }}
                />
            ),
            panelClassName: "max-w-[460px] w-full p-0 rounded-2xl overflow-hidden",
        });
    };

    const handleRefundBuyer = () => {
        if (!detail) return;
        showModal({
            content: (close) => (
                <RefundBuyerModal
                    orderId={detail.orderId}
                    amount={detail.payment.amount}
                    buyerName={detail.buyer.name}
                    onClose={close}
                    onSuccess={() => {
                        void detailQuery.refetch();
                        onClose();
                    }}
                />
            ),
            panelClassName: "max-w-[460px] w-full p-0 rounded-2xl overflow-hidden",
        });
    };

    return (
        <div className="flex w-full flex-col bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[88vh]">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between border-b border-[#0B0E0514] px-6 py-4 shrink-0">
                <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                    Order details
                </Typography>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="p-1 rounded-lg text-[#0B0E05A3] hover:bg-[#0B0E050A] transition-colors"
                >
                    <ModalCloseIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile Header */}
            <div className="flex md:hidden items-center gap-3 border-b border-[#0B0E0514] px-4 py-3.5 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Go back"
                    className="p-1 -ml-1 text-[#0B0E05]"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                    Order details
                </Typography>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto min-h-0 px-4 py-5 md:px-6 md:py-6 space-y-6 pb-6 md:pb-8">
                {detailQuery.isLoading && !fallbackRecord ? (
                    <OrderDetailsSkeleton />
                ) : detailQuery.isError && !fallbackRecord ? (
                    <div className="rounded-2xl border border-[#CC292929] bg-[#CC292914] p-6 text-center space-y-3">
                        <Typography type="text14" fontWeight={600} className="text-[#CC2929]">
                            Unable to load order details.
                        </Typography>
                        <button
                            type="button"
                            onClick={() => void detailQuery.refetch()}
                            className="px-4 py-2 rounded-xl bg-[#0B0E05] text-white text-xs font-semibold hover:bg-[#0B0E05CC] transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : detail ? (
                    <>
                        {/* 0. Payment on hold banner (shown only when payment is on hold) */}
                        {isHeld && (
                            <div
                                data-testid="payment-on-hold-banner"
                                className="rounded-2xl border border-[#FECDCA] bg-[#FFF5F5] p-4 text-[#0B0E05] space-y-2.5"
                            >
                                <div className="flex items-center gap-2">
                                    <FlagIcon className="h-4 w-4 text-[#CC2929]" />
                                    <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                        Payment on hold:
                                    </Typography>
                                </div>
                                <div className="space-y-1.5 text-xs text-[#0B0E05]">
                                    <div>
                                        <span className="font-bold">Reason: </span>
                                        <span className="text-[#0B0E05CC]">
                                            &ldquo;{detail.payment.holdReason || "—"}&rdquo;
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold">Date withheld: </span>
                                        <span className="text-[#0B0E05CC]">
                                            {detail.payment.holdDate || "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="font-bold">Action by</span>
                                        <ProfileAvatar
                                            imageUrl={detail.payment.holdBy?.avatarUrl || null}
                                            name={detail.payment.holdBy?.name || "—"}
                                            size="sm"
                                        />
                                        <span className="font-semibold text-[#0B0E05]">
                                            {detail.payment.holdBy?.name || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1. Parties involved */}
                        <div>
                            <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                Parties involved:
                            </Typography>
                            <Typography type="text14" fontWeight={400} className="mt-0.5 text-[#0B0E05A3]">
                                This order occurred between the 2 users listed below:
                            </Typography>

                            {/* Parties Container */}
                            <div className="mt-3 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4">
                                {/* Desktop Parties layout */}
                                <div className="hidden md:flex items-center justify-between gap-4">
                                    {/* Seller */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <ProfileAvatar
                                            imageUrl={detail.seller.avatarUrl || null}
                                            name={detail.seller.name}
                                            size="lg"
                                        />
                                        <div className="min-w-0">
                                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05] truncate block">
                                                {detail.seller.name}
                                            </Typography>
                                            <div className="text-xs text-[#0B0E05CC] truncate">{detail.seller.phone}</div>
                                            <div className="text-xs text-[#0B0E05CC] truncate">
                                                {detail.seller.email}
                                            </div>
                                            <div className="text-[10px] font-bold text-[#518300] tracking-wider uppercase mt-0.5">
                                                THE SELLER
                                            </div>
                                        </div>
                                    </div>

                                    {/* Two-way connector */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05A3]">
                                        <ArrowsLeftRightIcon className="h-4 w-4" />
                                    </div>

                                    {/* Buyer */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <ProfileAvatar
                                            imageUrl={detail.buyer.avatarUrl || null}
                                            name={detail.buyer.name}
                                            size="lg"
                                        />
                                        <div className="min-w-0">
                                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05] truncate block">
                                                {detail.buyer.name}
                                            </Typography>
                                            <div className="text-xs text-[#0B0E05CC] truncate">{detail.buyer.phone}</div>
                                            <div className="text-xs text-[#0B0E05CC] truncate">
                                                {detail.buyer.email}
                                            </div>
                                            <div className="text-[10px] font-bold text-[#518300] tracking-wider uppercase mt-0.5">
                                                THE BUYER
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Parties layout */}
                                <div className="flex flex-col md:hidden space-y-3">
                                    <div className="flex items-center gap-3">
                                        <ProfileAvatar
                                            imageUrl={detail.seller.avatarUrl || null}
                                            name={detail.seller.name}
                                            size="lg"
                                        />
                                        <div className="min-w-0">
                                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05] truncate block">
                                                {detail.seller.name}
                                            </Typography>
                                            <div className="text-xs text-[#0B0E05CC] truncate">
                                                {detail.seller.email}
                                            </div>
                                            <div className="text-xs text-[#0B0E05CC] truncate">{detail.seller.phone}</div>
                                            <div className="text-[10px] font-bold text-[#518300] tracking-wider uppercase mt-0.5">
                                                THE SELLER
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative flex items-center justify-center my-1">
                                        <div className="h-px w-full bg-[#0B0E0514]" />
                                        <div className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05A3]">
                                            <ArrowsLeftRightIcon className="h-3.5 w-3.5 rotate-90" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <ProfileAvatar
                                            imageUrl={detail.buyer.avatarUrl || null}
                                            name={detail.buyer.name}
                                            size="lg"
                                        />
                                        <div className="min-w-0">
                                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05] truncate block">
                                                {detail.buyer.name}
                                            </Typography>
                                            <div className="text-xs text-[#0B0E05CC] truncate">
                                                {detail.buyer.email}
                                            </div>
                                            <div className="text-xs text-[#0B0E05CC] truncate">{detail.buyer.phone}</div>
                                            <div className="text-[10px] font-bold text-[#518300] tracking-wider uppercase mt-0.5">
                                                THE BUYER
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Order information */}
                        <div>
                            <Typography type="text16" fontWeight={700} className="text-[#0B0E05] mb-2.5">
                                Order information:
                            </Typography>

                            <div className="rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Order ID:</span>
                                    <span className="font-bold text-[#0B0E05]">{detail.orderId}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Order status:</span>
                                    {detail.orderStatus && detail.orderStatus !== "—" && detail.orderStatus !== "--" ? (
                                        <OrderStatusBadge status={detail.orderStatus} />
                                    ) : (
                                        <span className="font-medium text-[#0B0E05A3]">—</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Order quantity:</span>
                                    <span className="font-semibold text-[#0B0E05]">{detail.orderQuantity}</span>
                                </div>

                                <div className="h-px w-full bg-[#0B0E0514]" />

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Payment date:</span>
                                    <span className="font-medium text-[#0B0E05]">{detail.payment.date}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Payment amount:</span>
                                    <span className="font-bold text-[#0B0E05]">{detail.payment.amount}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Shipping fee:</span>
                                    <span className="font-medium text-[#0B0E05]">{detail.payment.shippingFee}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Platform fee:</span>
                                    <span className="font-medium text-[#0B0E05]">{detail.payment.platformFee}</span>
                                </div>

                                <div className="h-px w-full bg-[#0B0E0514]" />

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Seller&apos;s net payout:</span>
                                    <span className="font-bold text-[#0B0E05]">
                                        {detail.payment.sellerNetPayout}
                                    </span>
                                </div>

                                <div className="h-px w-full bg-[#0B0E0514]" />

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Payout status:</span>
                                    {isHeld ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DC680314] text-[#DC6803]">
                                            On hold
                                        </span>
                                    ) : detail.payment.payoutStatus && detail.payment.payoutStatus !== "—" && detail.payment.payoutStatus !== "--" ? (
                                        <PaymentStatusBadge status={detail.payment.payoutStatus} />
                                    ) : (
                                        <span className="font-medium text-[#0B0E05A3]">—</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#0B0E05A3]">Payout date:</span>
                                    <span className="font-medium text-[#0B0E05A3]">{detail.payment.payoutDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Shipping information */}
                        <div>
                            <Typography type="text16" fontWeight={700} className="text-[#0B0E05] mb-2.5">
                                Shipping information:
                            </Typography>

                            <div className="rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="block text-xs text-[#0B0E05A3]">Carrier:</span>
                                        <span className="text-sm font-bold text-[#0B0E05]">{detail.shipping.carrier}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-[#0B0E05A3]">Tracking number:</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-sm font-bold text-[#0B0E05]">{detail.shipping.trackingNumber}</span>
                                            {detail.shipping.trackingNumber && detail.shipping.trackingNumber !== "—" && detail.shipping.trackingNumber !== "--" ? (
                                                <button
                                                    type="button"
                                                    onClick={handleCopyTracking}
                                                    aria-label="Copy tracking number"
                                                    className="p-1 rounded text-[#0B0E05A3] hover:text-[#0B0E05] hover:bg-[#0B0E050A] transition-colors"
                                                >
                                                    <CopyIcon className="h-4 w-4" />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="block text-xs text-[#0B0E05A3]">Shipped on:</span>
                                        <span className="text-sm font-bold text-[#0B0E05]">{detail.shipping.shippedOn}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-[#0B0E05A3]">Delivered on:</span>
                                        <span className="text-sm font-medium text-[#0B0E05A3]">{detail.shipping.deliveredOn}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Shipment timeline */}
                        <div>
                            <Typography type="text16" fontWeight={700} className="text-[#0B0E05] mb-3">
                                Shipment timeline:
                            </Typography>

                            <div className="space-y-0 pl-1">
                                {detail.timeline.stages.map((stage, idx) => {
                                    const isLast = idx === detail.timeline.stages.length - 1;
                                    const isCompleted = stage.status === "completed";
                                    const isCurrent = stage.status === "current";

                                    return (
                                        <div key={stage.key} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                {isCompleted ? (
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#518300] text-white">
                                                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                                                            <path
                                                                d="M10 3L4.5 8.5L2 6"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </div>
                                                ) : isCurrent ? (
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#518300] bg-white">
                                                        <div className="h-2 w-2 rounded-full bg-[#518300]" />
                                                    </div>
                                                ) : (
                                                    <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#0B0E0529] my-0.5" />
                                                )}
                                                {!isLast ? (
                                                    <div
                                                        className={`w-0.5 ${stage.description ? "h-7" : "h-6"} ${
                                                            isCompleted ? "bg-[#518300]" : "bg-[#0B0E0514]"
                                                        }`}
                                                    />
                                                ) : null}
                                            </div>
                                            <div className={`-mt-0.5 ${!isLast ? "pb-2" : ""} ${!isCompleted && !isCurrent ? "pl-0.5" : ""}`}>
                                                <Typography
                                                    type="text14"
                                                    fontWeight={isCompleted || isCurrent ? 700 : 500}
                                                    className="block text-[#0B0E05]"
                                                >
                                                    {stage.title}
                                                </Typography>
                                                {stage.description ? (
                                                    <Typography type="text12" fontWeight={400} className="block text-[#0B0E05A3] mt-0.5">
                                                        {stage.description}
                                                    </Typography>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons (Excluded "Mark as delivered" as instructed) */}
                        <div className="pt-2 flex items-center gap-3">
                            {isHeld ? (
                                <button
                                    type="button"
                                    onClick={handleOpenReleasePayment}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-[#0B0E0514] bg-white text-sm font-semibold text-[#0B0E05] hover:bg-[#0B0E050A] transition-colors"
                                >
                                    <HandPalmIcon className="h-4 w-4 text-[#0B0E05]" />
                                    Release funds
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenHoldPayment}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-[#DC6803] bg-white text-sm font-bold text-[#DC6803] hover:bg-[#DC68030A] transition-colors"
                                >
                                    <HandPalmIcon className="h-4 w-4 text-[#DC6803]" />
                                    Hold payment
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleRefundBuyer}
                                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-[#CC2929] bg-white text-sm font-bold text-[#CC2929] hover:bg-[#CC29290A] transition-colors"
                            >
                                <ArrowUUpLeftIcon className="h-4 w-4 text-[#CC2929]" />
                                Refund buyer
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
