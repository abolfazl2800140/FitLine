import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@/types";

export function useAuth() {
    const { data: user, isLoading, error } = useQuery<User | null>({
        queryKey: ["/api/auth/me"],
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", "/api/auth/logout");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/auth/me"], null);
            queryClient.invalidateQueries();
        },
    });

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        isCoach: user?.role === "coach",
        isAdmin: user?.role === "admin",
        error,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
    };
}

export function useUser(userId: string | undefined) {
    return useQuery<User>({
        queryKey: [`/api/users/${userId}`],
        enabled: !!userId,
    });
}
