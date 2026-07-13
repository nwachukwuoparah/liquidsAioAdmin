"use client";

import InventoryApproveListingModal from "@/components/modals/inventory-approve-listing-modal";
import InventoryDeclineListingModal from "@/components/modals/inventory-decline-listing-modal";
import InventorySuspendListingModal from "@/components/modals/inventory-suspend-listing-modal";
import LotImagesModal from "@/components/modals/lot-images-modal";
import { ProfileAvatar } from "@/components/profile-avatar";
import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    ArrowLeftIcon,
    ArrowSquareOutIcon,
    EyeIcon,
    GavelIcon,
    ModalCloseIcon,
    ProhibitIcon,
    RejectXIcon,
    TruckIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { getLotStatusStyles } from "@/lib/inventory-status";
import {
    useAdminInventoryLotDetail,
} from "@/lib/inventory/hooks/use-admin-inventory-review";
import {
    canReviewInventoryLot,
    canSuspendInventoryLot,
    canViewLiveInventoryListing,
} from "@/lib/inventory/utilities/map-admin-inventory-detail-api-record";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import { useCallback, useMemo } from "react";

interface LotDetailsModalProps {
    lotId: string;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatSkuTypeLabel(value: string): string {
    return value
        .split(/[\s_-]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function formatDisplayDate(isoDate?: string): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (parsedDate >= startOfToday) {
        return "Today";
    }

    if (parsedDate >= startOfYesterday) {
        return "Yesterday";
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatRelativeUpdatedAt(isoDate?: string): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    const diffMs = Date.now() - parsedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        return "Less than an hour ago";
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    return formatDisplayDate(isoDate);
}

/** Returns the value when present, otherwise a friendly "No ..." fallback label. */
export function orNone(value: React.ReactNode, missingLabel: string): React.ReactNode {
    if (value == null) {
        return missingLabel;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" || trimmed === "—" ? missingLabel : value;
    }

    return value;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <Typography type="text16" fontWeight={700} className="shrink-0 text-[#0B0E05]">
                {children}
            </Typography>
            <div className="h-px flex-1 bg-[#0B0E0514]" />
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-1">
            <Typography type="text14" fontWeight={500} className="shrink-0 text-[#0B0E05A3]">
                {label}
            </Typography>
            <Typography type="text14" fontWeight={700} className="text-right text-[#0B0E05]">
                {value}
            </Typography>
        </div>
    );
}

function SellerStat({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 py-1">
            <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                {label}:
            </Typography>
            <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                {value}
            </Typography>
        </div>
    );
}

function StatCard({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string | number;
    label: string;
}) {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-[12px] border border-[#0B0E0514] bg-[#FFFFFF] px-4 py-3">
            <div className="flex items-center gap-1.5">
                <span className="flex shrink-0 items-center justify-center text-[#0B0E05A3]">
                    {icon}
                </span>
                <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                    {label}
                </Typography>
            </div>
            <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                {value}
            </Typography>
        </div>
    );
}

function LotImageTile({
    imageUrl,
    className,
    overflowCount,
    onClick,
}: {
    imageUrl: string;
    className?: string;
    overflowCount?: number;
    onClick?: () => void;
}) {
    const showOverflow = overflowCount != null && overflowCount > 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative overflow-hidden rounded-[12px] bg-[#0B0E050A] ${className ?? ""}`}
            data-testid="lot-image-tile"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />

            {showOverflow ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <div
                        className="inline-flex items-center gap-2 rounded-full bg-[#FFFFFF] px-4 py-2.5 shadow-sm sm:gap-2.5 sm:px-5 sm:py-3"
                        data-testid="lot-image-overflow"
                    >
                        <EyeIcon className="h-4 w-4 text-[#0B0E05] sm:h-5 sm:w-5" />
                        <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                            +{overflowCount} images
                        </Typography>
                    </div>
                </div>
            ) : null}
        </button>
    );
}

/**
 * Responsive lot image gallery:
 * - Top row: 3 equal squares
 * - Bottom row: 2 equal-width tiles (second can show overflow count)
 */
function LotImageGallery({ images, title }: { images: { url: string }[]; title?: string }) {
    const { showModal } = useModal();
    const visibleImages = images.slice(0, 5);
    const remainingCount = Math.max(images.length - 4, 0);

    const openImagesViewer = (index: number) => {
        showModal({
            content: <LotImagesModal images={images} title={title} initialIndex={index} />,
            panelClassName: "lg:max-w-[820px]",
            dismissOnOverlayClick: true,
            dimBackground: false,
        });
    };

    if (visibleImages.length === 0) {
        return (
            <div
                className="grid h-36 place-items-center rounded-[12px] border border-[#0B0E0514] bg-[#0B0E050A] sm:h-40"
                data-testid="lot-image-gallery-empty"
            >
                <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                    No images available
                </Typography>
            </div>
        );
    }

    const topRowImages = visibleImages.slice(0, 3);
    const bottomLeftImage = visibleImages[3];
    const bottomRightImage = visibleImages[4];

    return (
        <div className="space-y-2" data-testid="lot-image-gallery">
            <div className="grid grid-cols-3 gap-2">
                {topRowImages.map((image, index) => (
                    <LotImageTile
                        key={`${image.url}-top-${index}`}
                        imageUrl={image.url}
                        className="aspect-square"
                        onClick={() => openImagesViewer(index)}
                    />
                ))}
            </div>

            {bottomLeftImage || bottomRightImage ? (
                <div className="grid grid-cols-2 gap-2">
                    {bottomLeftImage ? (
                        <LotImageTile
                            key={`${bottomLeftImage.url}-bottom-left`}
                            imageUrl={bottomLeftImage.url}
                            className="aspect-[16/10]"
                            onClick={() => openImagesViewer(3)}
                        />
                    ) : null}

                    {bottomRightImage ? (
                        <LotImageTile
                            key={`${bottomRightImage.url}-bottom-right`}
                            imageUrl={bottomRightImage.url}
                            className="aspect-[16/10]"
                            overflowCount={remainingCount > 0 ? remainingCount : undefined}
                            onClick={() => openImagesViewer(4)}
                        />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

/** Responsive lot review modal with listing details and moderation actions. */
export default function LotDetailsModal({ lotId }: LotDetailsModalProps) {
    const { closeModal, showModal } = useModal();
    const detailQuery = useAdminInventoryLotDetail(lotId);
    const detail = detailQuery.data;

    const statusStyles = useMemo(
        () => (detail ? getLotStatusStyles(detail.status) : getLotStatusStyles("pending")),
        [detail],
    );

    const showReviewActions = detail ? canReviewInventoryLot(detail) : false;
    const showSuspendAction = detail ? canSuspendInventoryLot(detail) : false;
    // Design shows View listing in the header whenever a public URL exists.
    const showListingLink = Boolean(detail?.listingUrl) || (detail ? canViewLiveInventoryListing(detail) : false);

    // Action endpoints require the real lot id (not the slug used to open this modal).
    const actionLotId = detail?.id ?? lotId;

    const openApproveModal = useCallback(() => {
        showModal({
            content: <InventoryApproveListingModal lotId={actionLotId} lotTitle={detail?.title} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
            dimBackground: false,
        });
    }, [actionLotId, detail?.title, showModal]);

    const openDeclineModal = useCallback(() => {
        showModal({
            content: <InventoryDeclineListingModal lotId={actionLotId} lotTitle={detail?.title} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
            dimBackground: false,
        });
    }, [actionLotId, detail?.title, showModal]);

    const openSuspendModal = useCallback(() => {
        showModal({
            content: <InventorySuspendListingModal lotId={actionLotId} lotTitle={detail?.title} />,
            panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
            dimBackground: false,
        });
    }, [actionLotId, detail?.title, showModal]);

    const handleViewListing = useCallback(() => {
        if (detail?.listingUrl) {
            window.open(detail.listingUrl, "_blank", "noopener,noreferrer");
        }
    }, [detail?.listingUrl]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            <div className="flex h-full w-full flex-col overflow-hidden bg-[#FFFFFF] md:h-auto md:max-h-[92vh] md:w-[min(720px,92vw)] md:rounded-[16px] md:shadow-card">
                <div className="flex items-center gap-3 border-b border-[#0B0E0514] px-4 py-3.5 md:px-6">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="shrink-0 md:hidden"
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon className="h-6 w-6 text-[#0B0E05]" />
                    </button>

                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Typography type="text20" fontWeight={700} className="shrink-0 text-[#0B0E05]">
                            Lot details
                        </Typography>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {showListingLink ? (
                            <button
                                type="button"
                                onClick={handleViewListing}
                                className="hidden items-center gap-1.5 rounded-[12px] border border-[#0B0E0514] bg-[#FFFFFF] px-3 py-2 transition-colors hover:bg-[#0B0E050A] sm:inline-flex"
                            >
                                <Typography type="text12" fontWeight={600} className="text-[#0B0E05]">
                                    View listing
                                </Typography>
                                <ArrowSquareOutIcon className="h-4 w-4 text-[#0B0E05]" />
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Close dialog"
                            className="hidden p-1 md:block"
                        >
                            <ModalCloseIcon className="h-5 w-5 cursor-pointer text-[#0B0E05]" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
                    {detailQuery.isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-32 rounded-[12px] bg-[#0B0E050A]" />
                            <div className="h-24 rounded-[12px] bg-[#0B0E050A]" />
                            <div className="h-40 rounded-[12px] bg-[#0B0E050A]" />
                        </div>
                    ) : detailQuery.isError || !detail ? (
                        <div className="rounded-[12px] border border-[#0B0E0514] p-6 text-center">
                            <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                                Unable to load lot details.
                            </Typography>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <LotImageGallery images={detail.images} title={detail.title} />

                            <div className="flex w-full flex-col gap-2">
                                <div className="w-full">
                                    <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                                        {detail.title}
                                    </Typography>
                                </div>

                                {detail.description && detail.description !== "—" ? (
                                    <div className="w-full">
                                        <Typography
                                            type="text14"
                                            fontWeight={400}
                                            className="leading-relaxed text-[#0B0E05CC]"
                                        >
                                            {detail.description}
                                        </Typography>
                                    </div>
                                ) : null}

                                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                                    <span className={`inline-flex w-fit rounded-lg px-3 py-1 ${statusStyles.bg}`}>
                                        <Typography type="text12" fontWeight={700} className={statusStyles.text}>
                                            Status: {statusStyles.label}
                                        </Typography>
                                    </span>

                                    {showListingLink ? (
                                        <button
                                            type="button"
                                            onClick={handleViewListing}
                                            className="inline-flex w-fit items-center gap-1.5 rounded-[12px] border border-[#0B0E0514] px-3 py-2 sm:hidden"
                                        >
                                            <Typography type="text12" fontWeight={600} className="text-[#0B0E05]">
                                                View listing
                                            </Typography>
                                            <ArrowSquareOutIcon className="h-4 w-4 text-[#0B0E05]" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div>
                                <SectionHeading>Product details:</SectionHeading>
                                <div className="mt-3">
                                    <DetailRow label="Category" value={orNone(detail.category, "No category")} />
                                    <DetailRow label="Conditions" value={orNone(detail.condition, "No condition")} />
                                    <DetailRow
                                        label="SKU type"
                                        value={orNone(formatSkuTypeLabel(detail.skuType), "No SKU type")}
                                    />
                                </div>

                                <div className="mt-3 grid grid-cols-3 divide-x divide-[#0B0E0514] rounded-[12px] border border-[#0B0E0514] bg-[#0B0E050A]">
                                    <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-4">
                                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                            {detail.unitQuantity}
                                        </Typography>
                                        <Typography
                                            type="text12"
                                            fontWeight={600}
                                            className="uppercase tracking-wide text-[#0B0E05A3]"
                                        >
                                            Boxes
                                        </Typography>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-4">
                                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                            {formatCurrency(detail.pricePerUnit)}
                                        </Typography>
                                        <Typography
                                            type="text12"
                                            fontWeight={600}
                                            className="uppercase tracking-wide text-[#0B0E05A3]"
                                        >
                                            For each
                                        </Typography>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-4">
                                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                            {formatCurrency(detail.totalPrice)}
                                        </Typography>
                                        <Typography
                                            type="text12"
                                            fontWeight={600}
                                            className="uppercase tracking-wide text-[#0B0E05A3]"
                                        >
                                            Total
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <SectionHeading>Order details:</SectionHeading>
                                <div className="mt-3">
                                    <DetailRow
                                        label="Minimum order"
                                        value={
                                            detail.minimumOrderQuantity > 0
                                                ? `${detail.minimumOrderQuantity} boxes`
                                                : "No minimum order"
                                        }
                                    />
                                    <DetailRow
                                        label="Shipping from"
                                        value={orNone(detail.shippingFrom, "No shipping address")}
                                    />
                                    <DetailRow
                                        label="Shipping terms"
                                        value={orNone(detail.shippingTerms, "No shipping terms")}
                                    />
                                    <DetailRow
                                        label="Shipping fee estimate"
                                        value={orNone(detail.shippingFeeEstimate, "No shipping fee estimate")}
                                    />
                                </div>
                            </div>

                            <div>
                                <SectionHeading>Other details:</SectionHeading>
                                <div className="mt-3">
                                    <DetailRow
                                        label="Date posted"
                                        value={orNone(formatDisplayDate(detail.createdAt), "No date posted")}
                                    />
                                    <DetailRow
                                        label="Last updated"
                                        value={orNone(formatRelativeUpdatedAt(detail.updatedAt), "No update yet")}
                                    />
                                </div>
                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <StatCard
                                        icon={<EyeIcon className="h-4 w-4 text-[#0B0E05A3]" />}
                                        value={detail.views}
                                        label="Views"
                                    />
                                    <StatCard
                                        icon={<GavelIcon className="h-4 w-4 text-[#0B0E05A3]" />}
                                        value={detail.offers}
                                        label="Offers"
                                    />
                                    <StatCard
                                        icon={<TruckIcon className="h-4 w-4 text-[#0B0E05A3]" />}
                                        value={`${detail.totalOrders} orders`}
                                        label="Total orders"
                                    />
                                </div>
                            </div>

                            <div>
                                <SectionHeading>Seller details:</SectionHeading>

                                <div className="mt-3 flex flex-col gap-4 border-y border-[#0B0E0514] py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <ProfileAvatar
                                            size="lg"
                                            name={detail.seller.name}
                                            email={detail.seller.email}
                                            imageUrl={detail.seller.profileImageUrl}
                                        />
                                        <div className="flex min-w-0 flex-col">
                                            <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                                {orNone(detail.seller.name, "No seller name")}
                                            </Typography>
                                            <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                                                {orNone(detail.seller.phone, "No phone number")}
                                            </Typography>
                                            <Typography type="text12" fontWeight={700} className="text-[#518300]">
                                                SELLER ACCOUNT
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="hidden h-14 w-px shrink-0 bg-[#0B0E0514] sm:block" />

                                    <div className="flex min-w-0 flex-col sm:flex-1">
                                        <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                                            Email:
                                        </Typography>
                                        <Typography type="text14" fontWeight={700} className="break-all text-[#0B0E05]">
                                            {orNone(detail.seller.email, "No email address")}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-[12px] border border-[#0B0E0514] bg-[#0B0E050A] px-5 py-3">
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-0.5 sm:grid-cols-2">
                                        <SellerStat
                                            label="Seller rating"
                                            value={
                                                detail.seller.rating != null
                                                    ? `${detail.seller.rating} out of 5.0`
                                                    : "No rating"
                                            }
                                        />
                                        <SellerStat
                                            label="Account health"
                                            value={
                                                detail.seller.accountHealth != null
                                                    ? `${detail.seller.accountHealth}%`
                                                    : "No health score"
                                            }
                                        />
                                        <SellerStat
                                            label="Response time"
                                            value={orNone(detail.seller.responseTime, "No response time")}
                                        />
                                        <SellerStat
                                            label="Active listings"
                                            value={
                                                detail.seller.activeListings != null
                                                    ? `${detail.seller.activeListings} items`
                                                    : "No active listings"
                                            }
                                        />
                                        <SellerStat
                                            label="Joined"
                                            value={
                                                detail.seller.joinedAt
                                                    ? `Since ${formatDisplayDate(detail.seller.joinedAt)}`
                                                    : "No join date"
                                            }
                                        />
                                        <SellerStat
                                            label="Location"
                                            value={orNone(detail.seller.location, "No location")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {detail && (showReviewActions || showSuspendAction) ? (
                    <div className="border-t border-[#0B0E0514] bg-[#FFFFFF] px-4 py-4 md:px-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            {showSuspendAction ? (
                                <button
                                    type="button"
                                    onClick={openSuspendModal}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#CC2929] bg-[#FFFFFF] px-4 py-3 transition-colors hover:bg-[#CC292914] md:w-auto"
                                >
                                    <ProhibitIcon className="h-5 w-5 text-[#CC2929]" />
                                    <Typography type="text14" fontWeight={600} className="text-[#CC2929]">
                                        Suspend listing
                                    </Typography>
                                </button>
                            ) : (
                                <span className="hidden md:block" />
                            )}

                            {showReviewActions ? (
                                <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:justify-end">
                                    <button
                                        type="button"
                                        onClick={openDeclineModal}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#CC2929] bg-[#FFFFFF] px-4 py-3 transition-colors hover:bg-[#CC292914] md:w-auto"
                                    >
                                        <RejectXIcon className="h-5 w-5 text-[#CC2929]" />
                                        <Typography type="text14" fontWeight={600} className="text-[#CC2929]">
                                            Decline listing
                                        </Typography>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openApproveModal}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#518300] bg-[#FFFFFF] px-4 py-3 transition-colors hover:bg-[#B1EC521A] md:w-auto"
                                    >
                                        <ApproveCheckIcon className="h-3.5 w-4 text-[#518300]" />
                                        <Typography type="text14" fontWeight={700} className="text-[#518300]">
                                            Approve listing
                                        </Typography>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
