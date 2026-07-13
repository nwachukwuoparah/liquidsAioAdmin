import Link from "next/link";
import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";

/** Global 404 page shown when a route or resource is not found. */
export default function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6">
            <div className="mx-auto w-full max-w-md text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#518300]">404</p>
                <h1 className="mt-3 text-3xl font-semibold text-[#0B0E05]">Page not found</h1>
                <p className="mt-3 text-sm text-[#0B0E05A3]">
                    The page you are looking for does not exist or the invite link is invalid.
                </p>
                <Link
                    href={AUTH_LOGIN_ROUTE}
                    className="mt-8 inline-block text-sm font-semibold text-[#518300] hover:underline"
                >
                    Back to login
                </Link>
            </div>
        </main>
    );
}
