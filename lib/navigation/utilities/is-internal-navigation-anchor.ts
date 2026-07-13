/**
 * Returns true when an anchor click should trigger client-side app navigation.
 * @param anchor - Anchor element that received the click.
 * @param currentOrigin - Current page origin used to detect same-origin links.
 */
export function isInternalNavigationAnchor(
    anchor: HTMLAnchorElement,
    currentOrigin: string,
): boolean {
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return false;
    }

    const href = anchor.getAttribute("href");

    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return false;
    }

    try {
        const targetUrl = new URL(href, `${currentOrigin}/`);

        return targetUrl.origin === currentOrigin;
    } catch {
        return false;
    }
}

/**
 * Returns true when navigating to the target URL would change the current route.
 * @param targetHref - Absolute or relative href from the anchor.
 * @param currentUrl - Current browser location.
 */
export function isDifferentAppRoute(targetHref: string, currentUrl: URL): boolean {
    const targetUrl = new URL(targetHref, currentUrl.href);

    return (
        targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search
    );
}
