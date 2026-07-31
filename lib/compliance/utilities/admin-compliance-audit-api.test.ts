import { describe, expect, it } from "vitest";
import { mapAdminComplianceAuditLogRecord } from "./map-admin-compliance-audit-record";
import { parseAdminComplianceAuditLogsResponse } from "./parse-admin-compliance-audit-response";

describe("parseAdminComplianceAuditLogsResponse", () => {
    it("reads data.auditLogs from the network response shape", () => {
        const page = parseAdminComplianceAuditLogsResponse({
            status: "success",
            data: {
                auditLogs: [
                    {
                        id: "019f644a-8949-71e5-a07b-07b1e2a05456",
                        action: "review:reject",
                        subjectType: "kyc",
                        createdAt: "2026-07-15T05:40:34.219Z",
                    },
                ],
                hasNext: true,
                nextCursor: {
                    cursor_id: "019f644a-8949-71e5-a07b-07b1e2a05456",
                    cursor_sort_at: "2026-07-15T05:40:34.219Z",
                },
            },
        });

        expect(page.auditLogs).toHaveLength(1);
        expect(page.auditLogs[0]?.id).toBe("019f644a-8949-71e5-a07b-07b1e2a05456");
        expect(page.hasNext).toBe(true);
        expect(page.nextCursor?.cursor_id).toBe("019f644a-8949-71e5-a07b-07b1e2a05456");
    });

    it("throws when the API reports a failed status", () => {
        expect(() =>
            parseAdminComplianceAuditLogsResponse({
                status: "failed",
                message: "Unable to load audit logs.",
            }),
        ).toThrow("Unable to load audit logs.");
    });
});

describe("mapAdminComplianceAuditLogRecord", () => {
    it("keeps the full network payload and maps display fields from real keys", () => {
        const row = mapAdminComplianceAuditLogRecord(
            {
                id: "019f644a-8949-71e5-a07b-07b1e2a05456",
                targetUserId: "019e7442-961a-71bf-b77a-d7f766a3aac7",
                actorType: "admin",
                actorAdminId: "019f2487-cede-7510-9f66-145612a9c49b",
                actorUserId: null,
                subjectType: "kyc",
                subjectId: "019e7447-8794-74a6-bdc2-1fa4c46b9b41",
                action: "review:reject",
                createdAt: "2026-07-15T05:40:34.219Z",
                beforeData: {
                    kyc: {
                        id: "019e7447-8794-74a6-bdc2-1fa4c46b9b41",
                        status: "pending",
                        firstName: "Nwachukwu",
                        lastName: "Oparah",
                    },
                },
                afterData: {
                    kyc: {
                        id: "019e7447-8794-74a6-bdc2-1fa4c46b9b41",
                        status: "rejected",
                        rejectionReason: "message.",
                        firstName: "Nwachukwu",
                        lastName: "Oparah",
                    },
                },
                targetUser: {
                    id: "019e7442-961a-71bf-b77a-d7f766a3aac7",
                    firstName: "Nwachukwu",
                    lastName: "Oparah",
                    email: "verify1@dummyinbox.com",
                },
                actorAdmin: {
                    id: "019f2487-cede-7510-9f66-145612a9c49b",
                    firstName: "Nkume",
                    lastName: "Oparah",
                    email: "nwachukwuoparah@gmail.com",
                },
                metadata: {
                    ip: "129.222.206.182",
                    path: "/v1/compliance/review",
                    method: "POST",
                },
            },
            0,
        );

        expect(row.actorAdmin).toEqual({
            id: "019f2487-cede-7510-9f66-145612a9c49b",
            firstName: "Nkume",
            lastName: "Oparah",
            email: "nwachukwuoparah@gmail.com",
        });
        expect(row.beforeData?.kyc?.status).toBe("pending");
        expect(row.afterData?.kyc?.status).toBe("rejected");
        expect(row.metadata?.path).toBe("/v1/compliance/review");
        expect(row).toMatchObject({
            actionLabel: "Rejected",
            subject: "kyc",
            subjectLabel: "KYC",
            actorName: "Nkume Oparah",
            targetUserName: "Nwachukwu Oparah",
            statusBefore: "pending",
            statusAfter: "rejected",
            rejectionReason: "message.",
            eventLabel: "Rejected KYC",
        });
        expect(row.narrative).toContain("Nkume Oparah");
        expect(row.narrative).toContain("rejected");
        expect(row.documentTypeLabel).toBe("");
        expect(row.assignmentBefore).toBe("");
    });
});
