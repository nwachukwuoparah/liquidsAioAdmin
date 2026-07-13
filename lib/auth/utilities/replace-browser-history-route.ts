/**
 * Replaces the current browser history entry so the back button cannot return
 * to the previous auth screen.
 * @param routeUrl - Absolute or relative in-app route to navigate to.
 */
export function replaceBrowserHistoryRoute(routeUrl: string): void {
    if (typeof window === "undefined") {
        return;
    }

    window.location.replace(routeUrl);
}
