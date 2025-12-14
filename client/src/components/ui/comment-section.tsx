import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { useLocation } from "wouter";

interface Comment {
    id: string;
    postId: string;
    userId: string;
    parentId: string | null;
    content: string;
    replyCount: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
}

interface CommentSectionProps {
    postId: string;
    isOpen: boolean;
    onClose?: () => void;
}

export function CommentSection({ postId, isOpen }: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [, setLocation] = useLocation();

    const { data: currentUser } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    const { data: comments, isLoading } = useQuery<Comment[]>({
        queryKey: [`/api/posts/${postId}/comments`],
        enabled: isOpen,
    });

    const createCommentMutation = useMutation({
        mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
            return apiRequest("POST", `/api/posts/${postId}/comments`, { content, parentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
            setNewComment("");
            setReplyingTo(null);
        },
    });

    const handleSubmit = () => {
        if (newComment.trim()) {
            createCommentMutation.mutate({
                content: newComment,
                parentId: replyingTo?.id,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="border-t border-border/30 bg-muted/30">
            {/* Comment Input */}
            <div className="p-4 border-b border-border/30">
                {replyingTo && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground bg-primary/5 p-2 rounded-lg">
                        <Reply className="h-4 w-4" />
                        <span>پاسخ به {replyingTo.user.fullName}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 mr-auto"
                            onClick={() => setReplyingTo(null)}
                        >
                            انصراف
                        </Button>
                    </div>
                )}
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {currentUser?.fullName?.charAt(0) || "؟"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea
                            placeholder={replyingTo ? `پاسخ به ${replyingTo.user.fullName}...` : "نظر خود را بنویسید..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[60px] resize-none text-sm"
                            disabled={!currentUser}
                        />
                        <div className="flex justify-end mt-2">
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || createCommentMutation.isPending || !currentUser}
                                className="gap-2"
                            >
                                {createCommentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 rtl-flip" />
                                )}
                                ارسال
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </div>
                ) : comments && comments.length > 0 ? (
                    <div className="divide-y divide-border/30">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                postId={postId}
                                onReply={() => setReplyingTo(comment)}
                                onUserClick={(userId) => setLocation(`/user/${userId}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">هنوز نظری ثبت نشده</p>
                    </div>
                )}
            </div>
        </div>
    );
}


interface CommentItemProps {
    comment: Comment;
    postId: string;
    onReply: () => void;
    onUserClick: (userId: string) => void;
    isReply?: boolean;
}

function CommentItem({ comment, postId, onReply, onUserClick, isReply = false }: CommentItemProps) {
    const [showReplies, setShowReplies] = useState(false);

    const { data: replies, isLoading: repliesLoading } = useQuery<Comment[]>({
        queryKey: [`/api/comments/${comment.id}/replies`],
        enabled: showReplies && comment.replyCount > 0,
    });

    return (
        <div className={cn("p-4", isReply && "pr-12 bg-muted/20")}>
            <div className="flex gap-3">
                <div
                    className="cursor-pointer"
                    onClick={() => onUserClick(comment.userId)}
                >
                    <Avatar className={cn("ring-1 ring-border/50", isReply ? "h-7 w-7" : "h-8 w-8")}>
                        <AvatarImage src={comment.user.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.user.fullName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="font-medium text-sm cursor-pointer hover:text-primary"
                            onClick={() => onUserClick(comment.userId)}
                        >
                            {comment.user.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.createdAt)}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                    <div className="flex items-center gap-3 mt-2">
                        {!isReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                                onClick={onReply}
                            >
                                <Reply className="h-3.5 w-3.5 ml-1" />
                                پاسخ
                            </Button>
                        )}

                        {comment.replyCount > 0 && !isReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? (
                                    <>
                                        <ChevronUp className="h-3.5 w-3.5 ml-1" />
                                        بستن پاسخ‌ها
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3.5 w-3.5 ml-1" />
                                        {toPersianNumber(comment.replyCount)} پاسخ
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {showReplies && (
                <div className="mt-2 mr-8 border-r-2 border-border/30">
                    {repliesLoading ? (
                        <div className="p-3 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : replies && replies.length > 0 ? (
                        replies.map((reply) => (
                            <CommentItem
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
    );
}
