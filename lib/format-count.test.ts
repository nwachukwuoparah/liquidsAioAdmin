import { describe, expect, it } from "vitest";
import { formatCount } from "./format-count";

describe("formatCount", () => {
    it("returns the count as a string when it is 99 or less", () => {
        expect(formatCount(0)).toBe("0");
        expect(formatCount(4)).toBe("4");
        expect(formatCount(99)).toBe("99");
    });

    it("returns 99+ when the count is greater than 99", () => {
        expect(formatCount(100)).toBe("99+");
        expect(formatCount(109)).toBe("99+");
    });
});
