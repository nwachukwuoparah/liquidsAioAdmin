// components/providers/QueryProvider.tsx
"use client";

import { ModalProvider } from "@/context/modal-provider";
import { QueryConfig } from "@/lib/query/query-config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactQueryDevtools = dynamic(
    () =>
        import("@tanstack/react-query-devtools").then(
            (reactQueryDevtoolsModule) => reactQueryDevtoolsModule.ReactQueryDevtools,
        ),
    { ssr: false },
);

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                ...QueryConfig.DEFAULT,
                gcTime: 5 * 60 * 1000,
                retry: 2,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    // Avoid creating multiple QueryClients in development / during hydration
    const [queryClient] = useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ModalProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </ModalProvider>
        </QueryClientProvider>
    );
}