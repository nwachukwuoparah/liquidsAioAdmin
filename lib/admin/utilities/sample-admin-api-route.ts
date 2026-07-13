/** Adds a short delay so loading skeletons are visible in sample routes. */
export async function sampleAdminApiDelay(milliseconds = 500): Promise<void> {
    await new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/** Builds a standard success JSON payload for sample admin routes. */
export function buildSampleAdminApiSuccessResponse<TData>(
    data: TData,
    message?: string,
): Response {
    return Response.json({
        status: "success",
        message,
        data,
    });
}

/** Parses optional query params from a sample admin route request. */
export function getSampleAdminRouteSearchParams(request: Request): URLSearchParams {
    return new URL(request.url).searchParams;
}
