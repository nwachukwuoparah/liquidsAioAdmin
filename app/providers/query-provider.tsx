// components/providers/QueryProvider.tsx
"use client";

import { ModalProvider } from "@/context/ModalProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,        // 1 minute
                gcTime: 5 * 60 * 1000,       // 5 minutes (was cacheTime)
                retry: 2,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 1,
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