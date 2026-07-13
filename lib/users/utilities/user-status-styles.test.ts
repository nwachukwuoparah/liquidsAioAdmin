import { describe, expect, it } from "vitest";
import {
    getUserAccountStatusStyles,
    getUserVerificationStatusStyles,
} from "@/lib/users/utilities/user-status-styles";

describe("getUserAccountStatusStyles", () => {
    it("styles active accounts in green regardless of casing", () => {
        expect(getUserAccountStatusStyles("Active")).toContain("text-[#00A341]");
        expect(getUserAccountStatusStyles("active")).toContain("text-[#00A341]");
        expect(getUserAccountStatusStyles("ACTIVE")).toContain("text-[#00A341]");
    });

    it("styles suspended accounts in red", () => {
        expect(getUserAccountStatusStyles("Suspended")).toContain("text-[#CC2929]");
        expect(getUserAccountStatusStyles("suspended")).toContain("text-[#CC2929]");
    });

    it("styles pending and reported accounts in amber", () => {
        expect(getUserAccountStatusStyles("Pending")).toContain("text-[#DC6803]");
        expect(getUserAccountStatusStyles("Reported")).toContain("text-[#DC6803]");
    });
});

describe("getUserVerificationStatusStyles", () => {
    it("styles approved and verified in green", () => {
        expect(getUserVerificationStatusStyles("Approved")).toContain("text-[#00A341]");
        expect(getUserVerificationStatusStyles("Verified")).toContain("text-[#00A341]");
    });

    it("styles pending in amber and rejected in red", () => {
        expect(getUserVerificationStatusStyles("Pending")).toContain("text-[#DC6803]");
        expect(getUserVerificationStatusStyles("Rejected")).toContain("text-[#CC2929]");
    });

    it("styles in review and needs info distinctly", () => {
        expect(getUserVerificationStatusStyles("In Review")).toContain("text-[#0B0E05A3]");
        expect(getUserVerificationStatusStyles("Needs info")).toContain("text-[#1A1AFF]");
        expect(getUserVerificationStatusStyles("needs_info")).toContain("text-[#1A1AFF]");
    });
});
