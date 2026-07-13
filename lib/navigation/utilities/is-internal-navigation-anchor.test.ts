import { describe, expect, it } from "vitest";
import {
    isDifferentAppRoute,
    isInternalNavigationAnchor,
} from "@/lib/navigation/utilities/is-internal-navigation-anchor";

function createAnchor(attributes: Record<string, string>): HTMLAnchorElement {
    const anchor = document.createElement("a");

    Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
        anchor.setAttribute(attributeName, attributeValue);
    });

    return anchor;
}

describe("isInternalNavigationAnchor", () => {
    it("returns true for same-origin relative links", () => {
        const anchor = createAnchor({ href: "/overview" });

        expect(isInternalNavigationAnchor(anchor, "http://localhost:3001")).toBe(true);
    });

    it("returns false for external links", () => {
        const anchor = createAnchor({ href: "https://example.com/overview" });

        expect(isInternalNavigationAnchor(anchor, "http://localhost:3001")).toBe(false);
    });

    it("returns false for hash, mailto, and tel links", () => {
        expect(isInternalNavigationAnchor(createAnchor({ href: "#section" }), "http://localhost:3001")).toBe(
            false,
        );
        expect(
            isInternalNavigationAnchor(createAnchor({ href: "mailto:admin@liquidsaio.com" }), "http://localhost:3001"),
        ).toBe(false);
        expect(isInternalNavigationAnchor(createAnchor({ href: "tel:+1234567890" }), "http://localhost:3001")).toBe(
            false,
        );
    });

    it("returns false for links that open in a new tab or download files", () => {
        expect(
            isInternalNavigationAnchor(
                createAnchor({ href: "/overview", target: "_blank" }),
                "http://localhost:3001",
            ),
        ).toBe(false);
        expect(
            isInternalNavigationAnchor(
                createAnchor({ href: "/report.csv", download: "" }),
                "http://localhost:3001",
            ),
        ).toBe(false);
    });
});

describe("isDifferentAppRoute", () => {
    it("returns false when pathname and search are unchanged", () => {
        const currentUrl = new URL("http://localhost:3001/overview?tab=orders");

        expect(isDifferentAppRoute("/overview?tab=orders", currentUrl)).toBe(false);
    });

    it("returns true when pathname or search changes", () => {
        const currentUrl = new URL("http://localhost:3001/overview");

        expect(isDifferentAppRoute("/settings/general", currentUrl)).toBe(true);
        expect(isDifferentAppRoute("/overview?tab=orders", currentUrl)).toBe(true);
    });
});
