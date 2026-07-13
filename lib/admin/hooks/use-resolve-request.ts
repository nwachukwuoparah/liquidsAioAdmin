// import { apiClient, ApiJsonResult } from "@/lib/api/api-client";
import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiJsonResult } from "@/lib/api/api-client";

interface MutationOptions<TData, TVariables> {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useResolveRequest<TData = any, TVariables = any>(
    url: string,
    options?: MutationOptions<TData, TVariables>
) {
    const {
        mutate,
        mutateAsync,
        data,
        isPending,
        isSuccess,
        isError,
        error
    } = useMutation<ApiJsonResult<TData>, Error, TVariables>({
        mutationFn: async (): Promise<ApiJsonResult<TData>> => {
            const response = await apiClient.post(url);
            return response as ApiJsonResult<TData>;
        },
        onSuccess: (response, variables) => {
            options?.onSuccess?.(response);
        },
        onError: (error) => {
            options?.onError?.(error);
        }
    });

    return {
        markAsResolved: mutate,       // Named mutation trigger
        markAsResolvedAsync: mutateAsync,
        data,
        isPending,
        isSuccess,
        isError,
        error
    };
}