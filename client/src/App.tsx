import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";

// Lazy load all pages
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home"));
const CoachesPage = lazy(() => import("@/pages/coaches"));
const CoachDetailPage = lazy(() => import("@/pages/coach-detail"));
const FeedPage = lazy(() => import("@/pages/feed"));
const ProgramsPage = lazy(() => import("@/pages/programs"));
const StorePage = lazy(() => import("@/pages/store"));
const MessagesPage = lazy(() => import("@/pages/messages"));
const LeaguesPage = lazy(() => import("@/pages/leagues"));
const ChallengesPage = lazy(() => import("@/pages/challenges"));
const EducationPage = lazy(() => import("@/pages/education"));
const AskQuestionPage = lazy(() => import("@/pages/ask-question"));
const QuestionDetailPage = lazy(() => import("@/pages/question-detail"));
const UserProfilePage = lazy(() => import("@/pages/user-profile"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const AuthPage = lazy(() => import("@/pages/auth"));
const DesignSystemPage = lazy(() => import("@/pages/design-system"));
const ProgramBuilderPage = lazy(() => import("@/pages/coach/program-builder"));
const NutritionBuilderPage = lazy(() => import("@/pages/coach/nutrition-builder"));
const CoachHomePage = lazy(() => import("@/pages/coach/home"));
const CoachStudentsPage = lazy(() => import("@/pages/coach/students"));
const CoachRequestsPage = lazy(() => import("@/pages/coach/requests"));
const CoachDashboardPage = lazy(() => import("@/pages/coach/dashboard"));
const MyRequestsPage = lazy(() => import("@/pages/my-requests"));
const MyProgramsPage = lazy(() => import("@/pages/my-programs"));
const ProgramDetailPage = lazy(() => import("@/pages/program-detail"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard"));
const NutritionPage = lazy(() => import("@/pages/nutrition"));
const PostDetailPage = lazy(() => import("@/pages/post-detail"));
const CoachingRequestPage = lazy(() => import("@/pages/coaching-request"));
const SupplementDetailPage = lazy(() => import("@/pages/supplement-detail"));
const LearnPage = lazy(() => import("@/pages/learn"));
const TutorialDetailPage = lazy(() => import("@/pages/tutorial-detail"));
const ArticleDetailPage = lazy(() => import("@/pages/article-detail"));
const NewArticlePage = lazy(() => import("@/pages/new-article"));
const BookmarksPage = lazy(() => import("@/pages/bookmarks"));

import { PageLoader } from "@/components/ui/loading-spinner";

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/coaches" component={CoachesPage} />
        <Route path="/coaches/:id" component={CoachDetailPage} />
        <Route path="/coaches/:id/request" component={CoachingRequestPage} />
        <Route path="/feed" component={FeedPage} />
        <Route path="/post/:id" component={PostDetailPage} />
        <Route path="/programs" component={ProgramsPage} />
        <Route path="/programs/:id" component={ProgramsPage} />
        <Route path="/store" component={StorePage} />
        <Route path="/supplement/:id" component={SupplementDetailPage} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/leagues" component={LeaguesPage} />
        <Route path="/challenges" component={ChallengesPage} />
        <Route path="/education" component={EducationPage} />
        <Route path="/education/ask" component={AskQuestionPage} />
        <Route path="/education/:id" component={QuestionDetailPage} />
        <Route path="/user/:id" component={UserProfilePage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/register" component={AuthPage} />
        <Route path="/design-system" component={DesignSystemPage} />
        <Route path="/coach/program-builder" component={ProgramBuilderPage} />
        <Route path="/coach/nutrition-builder" component={NutritionBuilderPage} />
        <Route path="/coach/home" component={CoachHomePage} />
        <Route path="/coach/students" component={CoachStudentsPage} />
        <Route path="/coach/requests" component={CoachRequestsPage} />
        <Route path="/coach/dashboard" component={CoachDashboardPage} />
        <Route path="/coach" component={CoachHomePage} />
        <Route path="/nutrition" component={NutritionPage} />
        <Route path="/my-requests" component={MyRequestsPage} />
        <Route path="/my-programs" component={MyProgramsPage} />
        <Route path="/program/:id" component={ProgramDetailPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/learn" component={LearnPage} />
        <Route path="/learn/new-article" component={NewArticlePage} />
        <Route path="/learn/tutorial/:id" component={TutorialDetailPage} />
        <Route path="/learn/article/:id" component={ArticleDetailPage} />
        <Route path="/bookmarks" component={BookmarksPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WebSocketProvider>
            <ScrollToTop />
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </WebSocketProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
