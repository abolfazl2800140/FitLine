import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChallengeCard, ChallengeCardSkeleton } from "@/components/ui/challenge-card";
import { translations, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Target, Clock, Users, Trophy, TrendingUp } from "lucide-react";

export default function ChallengesPage() {
  const [tab, setTab] = useState("active");
  const { toast } = useToast();

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: challenges, isLoading } = useQuery<any[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: myChallenges } = useQuery<any[]>({
    queryKey: ["/api/user/challenges"],
    enabled: !!currentUser,
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return apiRequest("POST", `/api/challenges/${challengeId}/join`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      toast({
        title: "عضو شدید",
        description: "شما با موفقیت در چالش ثبت‌نام کردید",
      });
    },
  });

  const now = new Date();
  
  const activeChallenges = challenges?.filter((c: any) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= now && end >= now;
  }) || [];

  const upcomingChallenges = challenges?.filter((c: any) => {
    const start = new Date(c.startDate);
    return start > now;
  }) || [];

  const completedChallenges = challenges?.filter((c: any) => {
    const end = new Date(c.endDate);
    return end < now;
  }) || [];

  const myParticipations = myChallenges || [];

  const isJoined = (challengeId: string) => {
    return myParticipations.some((p: any) => p.challengeId === challengeId);
  };

  const getProgress = (challengeId: string) => {
    const participation = myParticipations.find((p: any) => p.challengeId === challengeId);
    return participation?.progress || 0;
  };

  return (
    <div className="container px-4 md:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{translations.challenges.title}</h1>
        <p className="text-muted-foreground">
          در چالش‌های ورزشی شرکت کنید و با دیگران رقابت کنید
        </p>
      </div>

      {currentUser && myParticipations.length > 0 && (
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              چالش‌های شما
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myParticipations.slice(0, 3).map((participation: any) => {
                const challenge = participation.challenge || {};
                return (
                  <Card key={participation.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{challenge.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.type === "weekly" ? "هفتگی" : "ماهانه"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">پیشرفت</span>
                          <span className="font-medium">{toPersianNumber(participation.progress || 0)}%</span>
                        </div>
                        <Progress value={participation.progress || 0} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{toPersianNumber(activeChallenges.length)}</p>
            <p className="text-sm text-muted-foreground">چالش فعال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{toPersianNumber(myParticipations.length)}</p>
            <p className="text-sm text-muted-foreground">شرکت‌ها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{toPersianNumber(0)}</p>
            <p className="text-sm text-muted-foreground">تکمیل شده</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{toPersianNumber(upcomingChallenges.length)}</p>
            <p className="text-sm text-muted-foreground">در راه</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="active" data-testid="tab-active-challenges">
            {translations.challenges.active}
            {activeChallenges.length > 0 && (
              <Badge variant="secondary" className="mr-1">
                {toPersianNumber(activeChallenges.length)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming-challenges">
            {translations.challenges.upcoming}
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-challenges">
            {translations.challenges.completed}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ChallengeCardSkeleton key={i} />
              ))
            ) : activeChallenges.length > 0 ? (
              activeChallenges.map((challenge: any) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  type={challenge.type || "weekly"}
                  goal={challenge.goal}
                  targetValue={challenge.targetValue}
                  participantCount={challenge.participantCount || 0}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  coverImage={challenge.coverImage}
                  isJoined={isJoined(challenge.id)}
                  progress={getProgress(challenge.id)}
                  onJoin={() => joinChallengeMutation.mutate(challenge.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">چالش فعالی وجود ندارد</h3>
                <p className="text-muted-foreground">
                  به زودی چالش‌های جدید اضافه می‌شوند
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingChallenges.length > 0 ? (
              upcomingChallenges.map((challenge: any) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  type={challenge.type || "weekly"}
                  goal={challenge.goal}
                  targetValue={challenge.targetValue}
                  participantCount={challenge.participantCount || 0}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  coverImage={challenge.coverImage}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">چالش آینده‌ای نیست</h3>
                <p className="text-muted-foreground">
                  چالش‌های جدید به زودی اعلام می‌شوند
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedChallenges.length > 0 ? (
              completedChallenges.map((challenge: any) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  type={challenge.type || "weekly"}
                  goal={challenge.goal}
                  targetValue={challenge.targetValue}
                  participantCount={challenge.participantCount || 0}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  coverImage={challenge.coverImage}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">چالش تکمیل شده‌ای نیست</h3>
                <p className="text-muted-foreground">
                  در چالش‌های فعال شرکت کنید
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
