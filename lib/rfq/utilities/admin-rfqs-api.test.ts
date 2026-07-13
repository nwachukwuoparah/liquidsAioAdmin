import { describe, expect, it } from "vitest";
import {
    formatAdminRfqBudget,
    formatAdminRfqDate,
    mapAdminRfqApiRecord,
} from "@/lib/rfq/utilities/map-admin-rfq-api-record";
import { parseAdminRfqsAdminApiResponse } from "@/lib/rfq/utilities/parse-admin-rfqs-admin-api-response";

describe("parseAdminRfqsAdminApiResponse", () => {
    it("parses wrapped success payloads", () => {
        const page = parseAdminRfqsAdminApiResponse({
            status: "success",
            data: {
                totalCount: 12,
                results: [{ id: "rfq-1" }],
                hasNext: true,
                nextCursor: { cursor_id: "cursor-1", cursor_sort_at: "2026-07-01T12:34:56.000Z" },
            },
        });

        expect(page.totalCount).toBe(12);
        expect(page.results).toHaveLength(1);
        expect(page.hasNext).toBe(true);
        expect(page.nextCursor?.cursor_id).toBe("cursor-1");
    });
});

describe("formatAdminRfqBudget", () => {
    it("formats a min and max price range", () => {
        expect(formatAdminRfqBudget(300, 400)).toBe("$300 - $400");
    });

    it("formats min-only and max-only budgets", () => {
        expect(formatAdminRfqBudget(5000, null)).toBe("$5,000+");
        expect(formatAdminRfqBudget(null, 7000)).toBe("Up to $7,000");
    });

    it("returns an em dash when both prices are missing", () => {
        expect(formatAdminRfqBudget(null, null)).toBe("—");
        expect(formatAdminRfqBudget(undefined, undefined)).toBe("—");
    });
});

describe("formatAdminRfqDate", () => {
    it("formats older ISO dates as a short month day year string", () => {
        expect(formatAdminRfqDate("2026-07-01T12:34:56.000Z")).toBe("Jul 1, 2026");
    });

    it("returns Today for dates that fall on the current local day", () => {
        const todayIso = new Date().toISOString();
        expect(formatAdminRfqDate(todayIso)).toBe("Today");
    });

    it("returns an em dash when the date is missing", () => {
        expect(formatAdminRfqDate(null)).toBe("—");
        expect(formatAdminRfqDate("")).toBe("—");
    });
});

describe("mapAdminRfqApiRecord", () => {
    it("maps backend RFQ records into admin table rows", () => {
        const row = mapAdminRfqApiRecord(
            {
                id: "019d97d2-21d8-7336-95ea-88bee39b084d",
                status: "pending",
                createdAt: "2026-07-01T12:34:56.000Z",
                resolvedAt: "",
                category: "Electronics",
                description: "Need mixed electronics pallets.",
                minPrice: 5000,
                maxPrice: 7000,
                user: {
                    firstName: "John",
                    lastName: "Peters",
                    profilePicture: "https://example.com/john.jpg",
                },
            },
            0,
        );

        expect(row.id).toBe("019d97d2-21d8-7336-95ea-88bee39b084d");
        expect(row.sn).toBe("1.");
        expect(row.name).toBe("John");
        expect(row.avatarUrl).toBe("https://example.com/john.jpg");
        expect(row.avatarText).toBe("JO");
        expect(row.budget).toBe("$5,000 - $7,000");
        expect(row.category).toBe("Electronics");
        expect(row.date).toBe("Jul 1, 2026");
        expect(row.description).toBe("Need mixed electronics pallets.");
        expect(row.status).toBe("pending");
    });
});
