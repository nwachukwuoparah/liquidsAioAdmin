/** Label shown in price-range filter menus for picking an explicit interval. */
export const CUSTOM_PRICE_RANGE_OPTION = "Custom range";

const CUSTOM_PRICE_RANGE_PREFIX = "price:";

/** Returns whether a filter value represents an explicit custom price range. */
export function isCustomPriceRangeValue(value: string): boolean {
    return value === CUSTOM_PRICE_RANGE_OPTION || value.startsWith(CUSTOM_PRICE_RANGE_PREFIX);
}

/** Encodes min/max prices into a filter value the API layer can parse. */
export function encodeCustomPriceRange(minPrice: string, maxPrice: string): string {
    return `${CUSTOM_PRICE_RANGE_PREFIX}${minPrice}:${maxPrice}`;
}

/** Parses an encoded custom price-range filter value into min/max amounts. */
export function parseCustomPriceRange(
    value: string,
): { minPrice: string; maxPrice: string } | null {
    if (!value.startsWith(CUSTOM_PRICE_RANGE_PREFIX)) {
        return null;
    }

    const [minPrice, maxPrice] = value.slice(CUSTOM_PRICE_RANGE_PREFIX.length).split(":");

    if (!minPrice || !maxPrice) {
        return null;
    }

    return { minPrice, maxPrice };
}

/** Formats an encoded custom price range for the filter pill trigger. */
export function formatCustomPriceRangeLabel(value: string): string {
    const parsed = parseCustomPriceRange(value);

    if (!parsed) {
        return CUSTOM_PRICE_RANGE_OPTION;
    }

    return `${formatPriceAmount(parsed.minPrice)} – ${formatPriceAmount(parsed.maxPrice)}`;
}

/** Converts an encoded custom price range into API min/max query values. */
export function resolveCustomPriceRangeBounds(
    value: string,
): { min_price: string; max_price: string } | null {
    const parsed = parseCustomPriceRange(value);

    if (!parsed) {
        return null;
    }

    const minPrice = Number(parsed.minPrice);
    const maxPrice = Number(parsed.maxPrice);

    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || minPrice > maxPrice) {
        return null;
    }

    return {
        min_price: String(minPrice),
        max_price: String(maxPrice),
    };
}

function formatPriceAmount(rawAmount: string): string {
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount)) {
        return rawAmount;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}
