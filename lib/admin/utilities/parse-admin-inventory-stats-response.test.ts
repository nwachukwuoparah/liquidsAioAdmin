import { describe, expect, it } from "vitest";
import { parseAdminInventoryStatsResponse } from "./parse-admin-inventory-stats-response";

describe("parseAdminInventoryStatsResponse", () => {
    it("parses camelCase tabCounts from a wrapped payload", () => {
        expect(
            parseAdminInventoryStatsResponse({
                status: "success",
                data: {
                    stats: [],
                    tabCounts: {
                        allLots: 1247,
                        pendingApproval: 154,
                        reported: 32,
                        suspended: 18,
                    },
                },
            }),
        ).toEqual({
            stats: [],
            tabCounts: {
                allLots: 1247,
                pendingApproval: 154,
                reported: 32,
                suspended: 18,
            },
        });
    });

    it("parses snake_case tab_counts when camelCase is missing", () => {
        expect(
            parseAdminInventoryStatsResponse({
                tab_counts: {
                    all_lots: 50,
                    pending_approval: 7,
                    reported: 2,
                    suspended_lots: 3,
                },
            }),
        ).toEqual({
            stats: [],
            tabCounts: {
                allLots: 50,
                pendingApproval: 7,
                reported: 2,
                suspended: 3,
            },
        });
    });

    it("falls back to stats card labels when tab counts are missing", () => {
        expect(
            parseAdminInventoryStatsResponse({
                stats: [
                    { label: "Total active lots", value: "1,247", iconKey: "storefront", iconBg: "", iconColor: "" },
                    { label: "Pending approval", value: "154", iconKey: "hourglass", iconBg: "", iconColor: "" },
                    { label: "Reported lots", value: "32", iconKey: "flag", iconBg: "", iconColor: "" },
                    { label: "Suspended lots", value: "18", iconKey: "xCircle", iconBg: "", iconColor: "" },
                ],
            }),
        ).toEqual({
            stats: expect.any(Array),
            tabCounts: {
                allLots: 1247,
                pendingApproval: 154,
                reported: 32,
                suspended: 18,
            },
        });
    });
});
