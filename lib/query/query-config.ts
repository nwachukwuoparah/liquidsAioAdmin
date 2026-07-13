/** Always fresh data - refetches aggressively */
const QUERY_CONFIG_REALTIME = {
    staleTime: 0,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    enabled: true,
} as const;

/** Balanced - Good for most dashboards */
const QUERY_CONFIG_LIVE = {
    staleTime: 30 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    enabled: true,
} as const;

/** Standard - Refreshes when user comes back */
const QUERY_CONFIG_DEFAULT = {
    staleTime: 5 * 60 * 1000,
    refetchInterval: false as const,
    refetchOnWindowFocus: true,
    enabled: true,
} as const;

/** Background updates only (less aggressive) */
const QUERY_CONFIG_BACKGROUND = {
    staleTime: 2 * 60 * 1000,
    refetchInterval: 120000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    enabled: true,
} as const;

/** Rarely changes - Cache heavy */
const QUERY_CONFIG_STATIC = {
    staleTime: 30 * 60 * 1000,
    refetchInterval: false as const,
    refetchOnWindowFocus: false,
    enabled: true,
} as const;

/** One-time fetch (no auto refresh) */
const QUERY_CONFIG_ONCE = {
    staleTime: Infinity,
    refetchInterval: false as const,
    refetchOnWindowFocus: false,
    enabled: true,
} as const;

export const QueryConfig = {
    REALTIME: QUERY_CONFIG_REALTIME,
    LIVE: QUERY_CONFIG_LIVE,
    DEFAULT: QUERY_CONFIG_DEFAULT,
    BACKGROUND: QUERY_CONFIG_BACKGROUND,
    STATIC: QUERY_CONFIG_STATIC,
    ONCE: QUERY_CONFIG_ONCE,
} as const;
