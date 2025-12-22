import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard, PostCardSkeleton } from "@/components/ui/post-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { PageHeader } from "@/components/layout/PageHeader";
import { translations } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLikeMutation, useBookmarkMutation } from "@/hooks/useLikeMutation";
import { Image, Send, Loader2, Newspaper } from "lucide-react";

export default function FeedPage() {
  const [newPostContent, setNewPostContent] = useState("");
  const { toast } = useToast();

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/posts", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      toast({
        title: "پست ایجاد شد",
        description: "پست شما با موفقیت منتشر شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "مشکلی در ارسال پست پیش آمد",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useLikeMutation({ queryKey: ["/api/posts"] });
  const bookmarkMutation = useBookmarkMutation({ queryKey: ["/api/posts"] });

  const handleSubmitPost = () => {
    if (newPostContent.trim()) {
      createPostMutation.mutate(newPostContent);
    }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
  };

  const handleLike = (postId: string, isCurrentlyLiked: boolean) => {
    likeMutation.mutate({ itemId: postId, isLiked: isCurrentlyLiked });
  };

  return (
    <div>
      <PageHeader />

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container max-w-2xl px-4 md:px-6 py-6">

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser?.fullName?.charAt(0) || "؟"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {currentUser?.fullName || "ورود کنید"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    چه خبر دارید؟
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                placeholder={translations.feed.whatsOnMind}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
                disabled={!currentUser}
                data-testid="textarea-new-post"
              />
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!currentUser}
                    data-testid="button-add-image"
                  >
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitPost}
                  disabled={!newPostContent.trim() || createPostMutation.isPending || !currentUser}
                  className="gap-2"
                  data-testid="button-submit-post"
                >
                  {createPostMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 rtl-flip" />
                  )}
                  {translations.feed.post}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            ) : posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  userId={post.userId}
                  userName={post.user?.fullName || "کاربر"}
                  userAvatar={post.user?.avatar}
                  content={post.content}
                  images={post.images || []}
                  likeCount={post.likeCount || 0}
                  commentCount={post.commentCount || 0}
                  createdAt={post.createdAt}
                  isLiked={post.isLiked || false}
                  isSaved={post.isBookmarked || false}
                  onLike={(isCurrentlyLiked) => handleLike(post.id, isCurrentlyLiked)}
                  onSave={() => bookmarkMutation.mutate(post.id)}
                />
              ))
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">هنوز پستی وجود ندارد</h3>
                  <p className="text-muted-foreground mb-4">
                    اولین نفری باشید که پست می‌گذارد!
                  </p>
                  {currentUser && (
                    <Button className="min-h-[44px]" onClick={() => document.querySelector<HTMLTextAreaElement>('[data-testid="textarea-new-post"]')?.focus()}>
                      ایجاد پست جدید
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
}
