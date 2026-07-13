import { describe, expect, it } from "vitest";
import { mapAdminComplianceApiRecord } from "./map-admin-compliance-api-record";
import { parseAdminComplianceApiResponse } from "./parse-admin-compliance-api-response";

describe("parseAdminComplianceApiResponse", () => {
    it("normalizes wrapped paginated compliance payloads", () => {
        const page = parseAdminComplianceApiResponse({
            status: "success",
            data: {
                results: [{ id: "user-1", email: "user@example.com" }],
                hasNext: true,
                nextCursor: {
                    cursor_id: "user-1",
                    cursor_sort_at: "2026-07-01T12:00:00.000Z",
                },
            },
        });

        expect(page.results).toHaveLength(1);
        expect(page.hasNext).toBe(true);
        expect(page.nextCursor?.cursor_id).toBe("user-1");
    });

    it("throws when the API reports a failed status", () => {
        expect(() =>
            parseAdminComplianceApiResponse({
                status: "failed",
                message: "Unable to load compliance reviews.",
            }),
        ).toThrow("Unable to load compliance reviews.");
    });
});

describe("mapAdminComplianceApiRecord", () => {
    it("maps API fields into the admin table row shape", () => {
        const row = mapAdminComplianceApiRecord(
            {
                id: "user-1",
                email: "buyer@example.com",
                firstName: "Jane",
                lastName: "Doe",
                account_type: "buyer",
                compliance_review_status: "in_review",
                compliance_updated_at: "2026-07-01T12:00:00.000Z",
                assignedTo: "Jenny Wilson",
            },
            0,
        );

        expect(row).toMatchObject({
            id: "user-1",
            sn: "1.",
            name: "Jane Doe",
            email: "buyer@example.com",
            accountType: "Buyer",
            assignedTo: "Jenny Wilson",
            reviewStatus: "In Review",
        });
    });

    it("falls back to email for display name and avatar initials when no name exists", () => {
        const row = mapAdminComplianceApiRecord(
            {
                id: "user-2",
                email: "marvin@example.com",
                accountType: "seller",
                complianceReviewStatus: "pending",
            },
            1,
        );

        expect(row.name).toBe("marvin@example.com");
        expect(row.firstName).toBeUndefined();
        expect(row.lastName).toBeUndefined();
    });
});
