import { describe, expect, it } from "vitest";
import { getMemberStatusStyles } from "./team-member-status";

describe("getMemberStatusStyles", () => {
    it("returns active styles", () => {
        expect(getMemberStatusStyles("Active")).toBe("bg-[#00A34114] text-[#00A341]");
    });

    it("returns pending styles", () => {
        expect(getMemberStatusStyles("Pending")).toBe("bg-[#DC680314] text-[#DC6803]");
    });
});
