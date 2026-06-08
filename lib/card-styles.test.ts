import { describe, expect, it } from "vitest";
import {
    BANNER_CARD_CLASS,
    CARD_BG_CLASS,
    CARD_SHADOW_CLASS,
    LIST_CARD_CLASS,
    METRIC_CARD_CLASS,
    PANEL_CARD_CLASS,
    PANEL_CARD_SHELL_CLASS,
    SECTION_CARD_CLASS,
    STAT_CARD_CLASS,
} from "./card-styles";

describe("card styles", () => {
    it("uses white backgrounds and the global card shadow without borders", () => {
        const borderedCardClasses = [
            STAT_CARD_CLASS,
            METRIC_CARD_CLASS,
            BANNER_CARD_CLASS,
            LIST_CARD_CLASS,
            SECTION_CARD_CLASS,
        ];

        expect(CARD_BG_CLASS).toBe("bg-[#FFFFFF]");
        expect(CARD_SHADOW_CLASS).toBe("shadow-card");
        expect(PANEL_CARD_SHELL_CLASS).toContain("shadow-card");
        borderedCardClasses.forEach((cardClass) => {
            expect(cardClass).toContain("shadow-card");
            expect(cardClass).toContain("border-0");
            expect(cardClass).not.toContain("border-[#0B0E0514]");
        });
        expect(PANEL_CARD_CLASS).toContain("bg-[#FFFFFF]");
        expect(PANEL_CARD_CLASS).toContain("overflow-hidden");
        expect(PANEL_CARD_CLASS).not.toContain("shadow-card");
    });
});
