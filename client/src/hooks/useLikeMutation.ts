import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface UseLikeMutationOptions {
  queryKey: string[];
  getItemId?: (item: any) => string;
}

export function useLikeMutation({ queryKey, getItemId = (item) => item.id }: UseLikeMutationOptions) {
  return useMutation({
    mutationFn: async ({ itemId, isLiked }: { itemId: string; isLiked: boolean }) => {
      const method = isLiked ? "DELETE" : "POST";
      return apiRequest(method, `/api/posts/${itemId}/like`);
    },
    onMutate: async ({ itemId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<any[]>(queryKey);

      queryClient.setQueryData<any[]>(queryKey, (old) =>
        old?.map((item) =>
          getItemId(item) === itemId
            ? {
                ...item,
                isLiked: !isLiked,
                likeCount: isLiked ? Math.max(0, item.likeCount - 1) : item.likeCount + 1,
              }
            : item
        )
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
  });
}

export function useBookmarkMutation({ queryKey }: { queryKey: string[] }) {
  return useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest("POST", `/api/posts/${itemId}/bookmark`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<any[]>(queryKey);
      queryClient.setQueryData<any[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === itemId
            ? { ...item, isBookmarked: !item.isBookmarked }
            : item
        )
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });
}
