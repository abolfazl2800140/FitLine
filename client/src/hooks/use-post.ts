import { useQuery } from "@tanstack/react-query";
import type { Post, Comment } from "@/types";

export function usePost(postId: string | undefined) {
    return useQuery<Post>({
        queryKey: [`/api/posts/${postId}`],
        enabled: !!postId,
    });
}

export function usePosts() {
    return useQuery<Post[]>({
        queryKey: ["/api/posts"],
    });
}

export function useComments(postId: string | undefined) {
    return useQuery<Comment[]>({
        queryKey: [`/api/posts/${postId}/comments`],
        enabled: !!postId,
    });
}

export function useReplies(commentId: string | undefined, enabled: boolean = false) {
    return useQuery<Comment[]>({
        queryKey: [`/api/comments/${commentId}/replies`],
        enabled: enabled && !!commentId,
    });
}
