import { useState, useEffect, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import type { Post, Comment, User } from "@/types";
import {
    ArrowRight,
    Heart,
    MessageCircle,
    Share2,
    Send,
    Loader2,
    MoreHorizontal,
    Bookmark,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [saved, setSaved] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const { data: currentUser } = useQuery<User | null>({
        queryKey: ["/api/auth/me"],
    });

    const { data: post, isLoading: postLoading } = useQuery<Post>({
        queryKey: [`/api/posts/${id}`],
        enabled: !!id,
    });

    // Sync like state with post data
    useEffect(() => {
        if (post) {
            setIsLiked(post.isLiked || false);
            setLikeCount(post.likeCount || 0);
        }
    }, [post]);

    const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
        queryKey: [`/api/posts/${id}/comments`],
        enabled: !!id,
    });

    const createCommentMutation = useMutation({
        mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
            return apiRequest("POST", `/api/posts/${id}/comments`, { content, parentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}/comments`] });
            queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
            setNewComment("");
            setReplyingTo(null);
            setIsComposing(false);
        },
    });

    const likeMutation = useMutation({
        mutationFn: async (currentlyLiked: boolean) => {
            const method = currentlyLiked ? "DELETE" : "POST";
            return apiRequest(method, `/api/posts/${id}/like`);
        },
        onMutate: async (currentlyLiked: boolean) => {
            // Optimistic update
            setIsLiked(!currentlyLiked);
            setLikeCount(prev => currentlyLiked ? prev - 1 : prev + 1);
        },
        onError: (_error, currentlyLiked) => {
            // Rollback on error
            setIsLiked(currentlyLiked);
            setLikeCount(prev => currentlyLiked ? prev + 1 : prev - 1);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        },
    });

    const handleLike = () => {
        likeMutation.mutate(isLiked);
    };

    const handleSubmit = () => {
        if (newComment.trim()) {
            createCommentMutation.mutate({
                content: newComment,
                parentId: replyingTo?.id,
            });
        }
    };

    if (postLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
                    <div className="flex items-center h-14 px-4">
                        <Button variant="ghost" size="icon" onClick={() => setLocation("/feed")}>
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        <span className="mr-4 font-semibold">فید</span>
                    </div>
                </div>
                <div className="h-14" />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background">
                <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
                    <div className="flex items-center h-14 px-4">
                        <Button variant="ghost" size="icon" onClick={() => setLocation("/feed")}>
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        <span className="mr-4 font-semibold">فید</span>
                    </div>
                </div>
                <div className="h-14" />
                <div className="text-center py-20 text-muted-foreground">
                    پست یافت نشد
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
                <div className="flex items-center h-14 px-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <span className="mr-4 font-semibold">فید</span>
                </div>
            </div>
            <div className="h-14" />

            {/* Main Post */}
            <div className="border-b">
                <div className="p-4">
                    {/* Post Header */}
                    <div className="flex items-start gap-3">
                        <div
                            className="cursor-pointer"
                            onClick={() => setLocation(`/user/${post.userId}`)}
                        >
                            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                <AvatarImage src={post.user.avatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                                    {post.user.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => setLocation(`/user/${post.userId}`)}
                                >
                                    <h4 className="font-bold hover:underline">{post.user.fullName}</h4>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="text-right">
                                        <DropdownMenuItem className="justify-end">گزارش</DropdownMenuItem>
                                        <DropdownMenuItem className="justify-end">کپی لینک</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="mt-3">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Post Images */}
                    {post.images && post.images.length > 0 && (
                        <div className={cn(
                            "mt-3 rounded-xl overflow-hidden",
                            post.images.length === 1 ? "" : "grid grid-cols-2 gap-1"
                        )}>
                            {post.images.slice(0, 4).map((image, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative bg-muted",
                                        post.images.length === 1 ? "aspect-video" : "aspect-square"
                                    )}
                                >
                                    <img
                                        src={image}
                                        alt={`Post image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Post Time */}
                    <div className="mt-4 text-sm text-muted-foreground">
                        {formatRelativeTime(post.createdAt)}
                    </div>

                    {/* Post Actions with Stats */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-9 w-9 rounded-full", saved && "text-primary")}
                            onClick={() => setSaved(!saved)}
                        >
                            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-full gap-1">
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 h-9 px-3 rounded-full"
                            >
                                <MessageCircle className="h-5 w-5" />
                                {post.commentCount > 0 && <span className="text-sm text-muted-foreground">{toPersianNumber(post.commentCount)}</span>}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-1 h-9 px-3 rounded-full",
                                    isLiked && "text-red-500"
                                )}
                                onClick={handleLike}
                            >
                                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                                {(likeCount > 0 || post.likeCount > 0) && <span className="text-sm">{toPersianNumber(likeCount || post.likeCount)}</span>}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Compose Modal */}
            {isComposing && (
                <div className="fixed inset-0 z-[100] bg-background">
                    {/* Compose Header */}
                    <div className="flex items-center justify-between h-14 px-4 border-b">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsComposing(false);
                                setReplyingTo(null);
                                setNewComment("");
                            }}
                        >
                            انصراف
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || createCommentMutation.isPending}
                            className="rounded-full px-5"
                        >
                            {createCommentMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "ارسال"
                            )}
                        </Button>
                    </div>

                    {/* Compose Content */}
                    <div className="p-4">
                        {/* Replying to indicator */}
                        {replyingTo && (
                            <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border/30">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={replyingTo.user.avatar || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {replyingTo.user.fullName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{replyingTo.user.fullName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatRelativeTime(replyingTo.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{replyingTo.content}</p>
                                </div>
                            </div>
                        )}

                        {/* User input */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={currentUser?.avatar || undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {currentUser?.fullName?.charAt(0) || "؟"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="w-0.5 flex-1 bg-border/30 mt-2" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm mb-2">{currentUser?.fullName || "کاربر"}</p>
                                <Textarea
                                    placeholder={replyingTo ? `پاسخ به ${replyingTo.user.fullName}...` : `پاسخ به ${post?.user.fullName}...`}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[120px] resize-none text-base border-0 p-0 focus-visible:ring-0"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments List - Thread Style */}
            <div className="pb-20">
                {commentsLoading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                ) : comments && comments.length > 0 ? (
                    <div>
                        {comments.map((comment) => (
                            <ThreadComment
                                key={comment.id}
                                comment={comment}
                                postId={id!}
                                onReply={() => {
                                    setReplyingTo(comment);
                                    setIsComposing(true);
                                }}
                                onUserClick={(userId) => setLocation(`/user/${userId}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>هنوز پاسخی ثبت نشده</p>
                        <p className="text-sm mt-1">اولین نفری باشید که پاسخ می‌دهید</p>
                    </div>
                )}
            </div>

            {/* Bottom Comment Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
                <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser?.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {currentUser?.fullName?.charAt(0) || "؟"}
                        </AvatarFallback>
                    </Avatar>
                    <div
                        className="flex-1 bg-muted/50 rounded-full px-4 py-2.5 cursor-pointer"
                        onClick={() => currentUser && setIsComposing(true)}
                    >
                        <span className="text-sm text-muted-foreground">
                            {currentUser ? "پاسخ خود را بنویسید..." : "برای پاسخ وارد شوید"}
                        </span>
                    </div>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        disabled={!currentUser}
                        onClick={() => currentUser && setIsComposing(true)}
                    >
                        <Send className="h-5 w-5 rtl-flip" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface ThreadCommentProps {
    comment: Comment;
    postId: string;
    onReply: () => void;
    onUserClick: (userId: string) => void;
    isReply?: boolean;
}

const ThreadComment = memo(function ThreadComment({ comment, postId, onReply, onUserClick, isReply = false }: ThreadCommentProps) {
    const [showReplies, setShowReplies] = useState(false);

    const { data: replies, isLoading: repliesLoading } = useQuery<Comment[]>({
        queryKey: [`/api/comments/${comment.id}/replies`],
        enabled: showReplies && comment.replyCount > 0,
    });

    return (
        <div className={cn("relative", !isReply && "border-b")}>
            <div className={cn("p-4", isReply && "pr-0")}>
                <div className="flex gap-3">
                    {/* Avatar with thread line */}
                    <div className="relative flex flex-col items-center">
                        <div
                            className="cursor-pointer"
                            onClick={() => onUserClick(comment.userId)}
                        >
                            <Avatar className={cn("ring-1 ring-border/50", isReply ? "h-9 w-9" : "h-10 w-10")}>
                                <AvatarImage src={comment.user.avatar || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {comment.user.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {/* Thread line */}
                        {(comment.replyCount > 0 && showReplies) && (
                            <div className="w-0.5 flex-1 bg-border/50 mt-2 min-h-[20px]" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span
                                className="font-semibold text-sm cursor-pointer hover:underline"
                                onClick={() => onUserClick(comment.userId)}
                            >
                                {comment.user.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(comment.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed mt-1 whitespace-pre-wrap">{comment.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-2">
                            {!isReply && (
                                <button
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    onClick={onReply}
                                >
                                    پاسخ
                                </button>
                            )}
                            {comment.replyCount > 0 && !isReply && (
                                <button
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => setShowReplies(!showReplies)}
                                >
                                    {showReplies ? "بستن پاسخ‌ها" : `${toPersianNumber(comment.replyCount)} پاسخ`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Replies */}
                {showReplies && (
                    <div className="mr-5 mt-2 pr-5 border-r-2 border-border/30">
                        {repliesLoading ? (
                            <div className="py-3 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                            </div>
                        ) : replies && replies.length > 0 ? (
                            replies.map((reply) => (
                                <ThreadComment
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    onReply={onReply}
                                    onUserClick={onUserClick}
                                    isReply
                                />
                            ))
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
});
