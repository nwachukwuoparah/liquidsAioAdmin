/** Base z-index for the first modal layer. */
export const MODAL_BASE_Z_INDEX = 50;

/** Z-index increment between stacked modal layers. */
export const MODAL_STACK_Z_INDEX_STEP = 10;

/** Default Tailwind classes applied to the modal panel width. */
export const MODAL_DEFAULT_PANEL_CLASS_NAME = "lg:max-w-[40%]";

/** Overlay backdrop color applied to each modal layer. */
export const MODAL_OVERLAY_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.7)";

/**
 * Lighter overlay backdrop used when a modal opts out of full dimming
 * (e.g. when stacked on top of another modal) so it adds only a subtle shade.
 */
export const MODAL_LIGHT_OVERLAY_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.2)";

/** Default modal panel width on small screens as a percentage. */
export const MODAL_PANEL_WIDTH_PERCENT = 90;

/** Maximum modal panel height when not in cover mode, as a viewport percentage. */
export const MODAL_PANEL_MAX_HEIGHT_PERCENT = 90;

/** Portal element id used to mount the modal stack. */
export const MODAL_PORTAL_ELEMENT_ID = "modal-portal-root";

/** Panel classes for stacked compliance review confirmation dialogs. */
export const COMPLIANCE_REVIEW_MODAL_PANEL_CLASS =
    "w-full max-w-[420px] !rounded-[13px] !bg-white shadow-card";
