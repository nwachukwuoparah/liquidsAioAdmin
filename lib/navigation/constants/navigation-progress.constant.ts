/** Brand color for the top navigation progress bar. */
export const NAVIGATION_PROGRESS_BAR_COLOR = "#518300";

/** Height of the navigation progress bar in pixels. */
export const NAVIGATION_PROGRESS_BAR_HEIGHT_PX = 3;

/** z-index so the bar renders above app chrome. */
export const NAVIGATION_PROGRESS_BAR_Z_INDEX = 9999;

/** Initial progress percentage when navigation starts. */
export const NAVIGATION_PROGRESS_INITIAL_PERCENT = 20;

/** Maximum progress before the route finishes loading. */
export const NAVIGATION_PROGRESS_MAX_INCOMPLETE_PERCENT = 90;

/** Interval for incrementing progress while navigation is in flight. 400ms */
export const NAVIGATION_PROGRESS_TRICKLE_INTERVAL_MS = 400;

/** Delay before hiding the bar after navigation completes. 200ms */
export const NAVIGATION_PROGRESS_COMPLETE_DELAY_MS = 200;

/** Custom event name for programmatic navigation progress starts. */
export const NAVIGATION_PROGRESS_START_EVENT = "liquids-aio:navigation-progress-start";
