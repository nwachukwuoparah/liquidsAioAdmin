import type { NextRequest } from "next/server";
import { handleAppProxy } from "@/lib/proxy/app-proxy";

/** Intercepts requests for U.S. geo restriction and admin auth routing. */
export function proxy(request: NextRequest) {
    return handleAppProxy(request);
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
