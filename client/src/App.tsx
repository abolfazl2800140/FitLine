import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CoachesPage from "@/pages/coaches";
import CoachDetailPage from "@/pages/coach-detail";
import FeedPage from "@/pages/feed";
import ProgramsPage from "@/pages/programs";
import StorePage from "@/pages/store";
import MessagesPage from "@/pages/messages";
import LeaguesPage from "@/pages/leagues";
import ChallengesPage from "@/pages/challenges";
import EducationPage from "@/pages/education";
import AskQuestionPage from "@/pages/ask-question";
import QuestionDetailPage from "@/pages/question-detail";
import UserProfilePage from "@/pages/user-profile";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import AuthPage from "@/pages/auth";
import DesignSystemPage from "@/pages/design-system";
import ProgramBuilderPage from "@/pages/coach/program-builder";
import NutritionBuilderPage from "@/pages/coach/nutrition-builder";
import CoachHomePage from "@/pages/coach/home";
import CoachStudentsPage from "@/pages/coach/students";
import CoachRequestsPage from "@/pages/coach/requests";
import MyRequestsPage from "@/pages/my-requests";
import MyProgramsPage from "@/pages/my-programs";
import ProgramDetailPage from "@/pages/program-detail";
import LeaderboardPage from "@/pages/leaderboard";
import NutritionPage from "@/pages/nutrition";
import PostDetailPage from "@/pages/post-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/coaches" component={CoachesPage} />
      <Route path="/coaches/:id" component={CoachDetailPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/post/:id" component={PostDetailPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/programs/:id" component={ProgramsPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/store/:id" component={StorePage} />
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
      <Route path="/coach" component={CoachHomePage} />
      <Route path="/nutrition" component={NutritionPage} />
      <Route path="/my-requests" component={MyRequestsPage} />
      <Route path="/my-programs" component={MyProgramsPage} />
      <Route path="/program/:id" component={ProgramDetailPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route component={NotFound} />
    </Switch>
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
