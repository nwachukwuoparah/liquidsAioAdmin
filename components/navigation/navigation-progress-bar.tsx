"use client";

import {
    NAVIGATION_PROGRESS_BAR_COLOR,
    NAVIGATION_PROGRESS_BAR_HEIGHT_PX,
    NAVIGATION_PROGRESS_BAR_Z_INDEX,
    NAVIGATION_PROGRESS_COMPLETE_DELAY_MS,
    NAVIGATION_PROGRESS_INITIAL_PERCENT,
    NAVIGATION_PROGRESS_MAX_INCOMPLETE_PERCENT,
    NAVIGATION_PROGRESS_START_EVENT,
    NAVIGATION_PROGRESS_TRICKLE_INTERVAL_MS,
} from "@/lib/navigation/constants/navigation-progress.constant";
import {
    isDifferentAppRoute,
    isInternalNavigationAnchor,
} from "@/lib/navigation/utilities/is-internal-navigation-anchor";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

/** Dispatches a global event to start the navigation progress bar. */
export function startNavigationProgress(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(NAVIGATION_PROGRESS_START_EVENT));
}

function NavigationProgressBarInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progressPercent, setProgressPercent] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const trickleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const routeKeyRef = useRef("");
    const isFirstRouteRenderRef = useRef(true);

    const clearProgressTimers = useCallback(() => {
        if (completeTimerRef.current) {
            clearTimeout(completeTimerRef.current);
            completeTimerRef.current = null;
        }

        if (trickleTimerRef.current) {
            clearInterval(trickleTimerRef.current);
            trickleTimerRef.current = null;
        }
    }, []);

    const startProgress = useCallback(() => {
        clearProgressTimers();
        setIsVisible(true);
        setProgressPercent(NAVIGATION_PROGRESS_INITIAL_PERCENT);

        trickleTimerRef.current = setInterval(() => {
            setProgressPercent((currentProgressPercent) => {
                if (currentProgressPercent >= NAVIGATION_PROGRESS_MAX_INCOMPLETE_PERCENT) {
                    return currentProgressPercent;
                }

                return Math.min(
                    NAVIGATION_PROGRESS_MAX_INCOMPLETE_PERCENT,
                    currentProgressPercent + Math.random() * 10,
                );
            });
        }, NAVIGATION_PROGRESS_TRICKLE_INTERVAL_MS);
    }, [clearProgressTimers]);

    const completeProgress = useCallback(() => {
        clearProgressTimers();
        setProgressPercent(100);

        completeTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            setProgressPercent(0);
        }, NAVIGATION_PROGRESS_COMPLETE_DELAY_MS);
    }, [clearProgressTimers]);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const clickedElement = event.target;

            if (!(clickedElement instanceof Element)) {
                return;
            }

            const anchorElement = clickedElement.closest("a");

            if (!(anchorElement instanceof HTMLAnchorElement)) {
                return;
            }

            if (!isInternalNavigationAnchor(anchorElement, window.location.origin)) {
                return;
            }

            if (!isDifferentAppRoute(anchorElement.href, new URL(window.location.href))) {
                return;
            }

            startProgress();
        };

        const handlePopState = () => {
            startProgress();
        };

        const handleProgrammaticStart = () => {
            startProgress();
        };

        document.addEventListener("click", handleDocumentClick, true);
        window.addEventListener("popstate", handlePopState);
        window.addEventListener(NAVIGATION_PROGRESS_START_EVENT, handleProgrammaticStart);

        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener(NAVIGATION_PROGRESS_START_EVENT, handleProgrammaticStart);
            clearProgressTimers();
        };
    }, [clearProgressTimers, startProgress]);

    useEffect(() => {
        const nextRouteKey = `${pathname}?${searchParams.toString()}`;

        if (isFirstRouteRenderRef.current) {
            isFirstRouteRenderRef.current = false;
            routeKeyRef.current = nextRouteKey;
            return;
        }

        if (nextRouteKey === routeKeyRef.current) {
            return;
        }

        routeKeyRef.current = nextRouteKey;
        completeProgress();
    }, [completeProgress, pathname, searchParams]);

    if (!isVisible && progressPercent === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed inset-x-0 top-0"
            style={{ zIndex: NAVIGATION_PROGRESS_BAR_Z_INDEX }}
            role="progressbar"
            aria-hidden="true"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
        >
            <div
                className="transition-[width,opacity] duration-200 ease-out"
                style={{
                    width: `${progressPercent}%`,
                    height: `${NAVIGATION_PROGRESS_BAR_HEIGHT_PX}px`,
                    backgroundColor: NAVIGATION_PROGRESS_BAR_COLOR,
                    opacity: isVisible ? 1 : 0,
                }}
            />
        </div>
    );
}

/** Top-of-page progress bar shown during client-side route transitions. */
export function NavigationProgressBar() {
    return (
        <Suspense fallback={null}>
            <NavigationProgressBarInner />
        </Suspense>
    );
}
