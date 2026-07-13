"use client";

import Typography from "@/components/typography";
import { ArrowLeftIcon, CaretRightIcon, ModalCloseIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useCallback, useEffect, useState } from "react";

interface LotImagesModalProps {
    images: { url: string }[];
    title?: string;
    initialIndex?: number;
}

/** Lightbox-style viewer for browsing every image attached to a lot. */
export default function LotImagesModal({ images, title, initialIndex = 0 }: LotImagesModalProps) {
    const { closeModal } = useModal();
    const total = images.length;

    const [activeIndex, setActiveIndex] = useState(() =>
        Math.min(Math.max(initialIndex, 0), Math.max(total - 1, 0)),
    );

    const goToPrevious = useCallback(() => {
        setActiveIndex((current) => (current - 1 + total) % total);
    }, [total]);

    const goToNext = useCallback(() => {
        setActiveIndex((current) => (current + 1) % total);
    }, [total]);

    useEffect(() => {
        if (total <= 1) {
            return;
        }

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                goToPrevious();
            } else if (event.key === "ArrowRight") {
                goToNext();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [goToNext, goToPrevious, total]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            <div className="flex h-full w-full flex-col overflow-hidden bg-[#FFFFFF] md:h-auto md:max-h-[92vh] md:w-[min(820px,92vw)] md:rounded-[16px] md:shadow-card">
                <div className="flex items-center gap-3 border-b border-[#0B0E0514] px-4 py-3.5 md:px-6">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="shrink-0 md:hidden"
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon className="h-6 w-6 text-[#0B0E05]" />
                    </button>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Typography type="text20" fontWeight={700} className="truncate text-[#0B0E05]">
                            {title ?? "Lot images"}
                        </Typography>
                        {total > 0 ? (
                            <Typography type="text14" fontWeight={500} className="shrink-0 text-[#0B0E05A3]">
                                ({activeIndex + 1}/{total})
                            </Typography>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close dialog"
                        className="hidden shrink-0 p-1 md:block"
                    >
                        <ModalCloseIcon className="h-5 w-5 cursor-pointer text-[#0B0E05]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
                    {total === 0 ? (
                        <div className="grid h-64 place-items-center rounded-[12px] border border-[#0B0E0514] bg-[#0B0E050A]">
                            <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                                No images available
                            </Typography>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-[12px] bg-[#0B0E050A]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    key={images[activeIndex].url}
                                    src={images[activeIndex].url}
                                    alt={`Lot image ${activeIndex + 1}`}
                                    data-testid="lot-images-active"
                                    className="max-h-[60vh] w-full object-contain"
                                />

                                {total > 1 ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={goToPrevious}
                                            aria-label="Previous image"
                                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFFFF] text-[#0B0E05] shadow-card transition-opacity hover:opacity-90"
                                        >
                                            <CaretRightIcon className="h-5 w-5 rotate-180" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goToNext}
                                            aria-label="Next image"
                                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFFFF] text-[#0B0E05] shadow-card transition-opacity hover:opacity-90"
                                        >
                                            <CaretRightIcon className="h-5 w-5" />
                                        </button>
                                    </>
                                ) : null}
                            </div>

                            {total > 1 ? (
                                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image.url}-thumb-${index}`}
                                            type="button"
                                            onClick={() => setActiveIndex(index)}
                                            aria-label={`View image ${index + 1}`}
                                            aria-current={index === activeIndex}
                                            data-testid="lot-images-thumb"
                                            className={`relative aspect-square overflow-hidden rounded-[10px] bg-[#0B0E050A] transition-all ${
                                                index === activeIndex
                                                    ? "ring-2 ring-[#518300] ring-offset-1"
                                                    : "opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={image.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
