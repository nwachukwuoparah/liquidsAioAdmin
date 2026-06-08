/** Explicit white surface for cards on mobile (white page) and desktop (gray page). */
export const CARD_BG_CLASS = "bg-[#FFFFFF]";

/** Global card shadow from `app/globals.css` (`--shadow-card`). */
export const CARD_SHADOW_CLASS = "shadow-card";

export const STAT_CARD_CLASS = `flex flex-col justify-between rounded-2xl border-0 ${CARD_BG_CLASS} ${CARD_SHADOW_CLASS}`;

export const METRIC_CARD_CLASS = `rounded-2xl border-0 ${CARD_BG_CLASS} ${CARD_SHADOW_CLASS}`;

/** Outer shell — shadow must live here so `overflow-hidden` on the inner surface does not clip it. */
export const PANEL_CARD_SHELL_CLASS = `rounded-2xl ${CARD_SHADOW_CLASS}`;

export const PANEL_CARD_CLASS = `overflow-hidden rounded-2xl ${CARD_BG_CLASS}`;

export const BANNER_CARD_CLASS = `rounded-2xl border-0 ${CARD_BG_CLASS} ${CARD_SHADOW_CLASS}`;

export const LIST_CARD_CLASS = `rounded-2xl border-0 ${CARD_BG_CLASS} ${CARD_SHADOW_CLASS}`;

export const SECTION_CARD_CLASS = `rounded-2xl border-0 ${CARD_BG_CLASS} ${CARD_SHADOW_CLASS}`;
