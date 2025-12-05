import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Layout } from "@/components/layout/Layout";
import { PageTransition } from "@/components/layout/PageTransition";
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
import QuestionDetailPage from "@/pages/question-detail";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import AuthPage from "@/pages/auth";
import DesignSystemPage from "@/pages/design-system";
import ProgramBuilderPage from "@/pages/coach/program-builder";
import CoachHomePage from "@/pages/coach/home";
import CoachStudentsPage from "@/pages/coach/students";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/coaches" component={CoachesPage} />
      <Route path="/coaches/:id" component={CoachDetailPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/programs/:id" component={ProgramsPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/store/:id" component={StorePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/leagues" component={LeaguesPage} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/education" component={EducationPage} />
      <Route path="/education/:id" component={QuestionDetailPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/design-system" component={DesignSystemPage} />
      <Route path="/coach/program-builder" component={ProgramBuilderPage} />
      <Route path="/coach/home" component={CoachHomePage} />
      <Route path="/coach/students" component={CoachStudentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Layout>
            <PageTransition>
              <Router />
            </PageTransition>
          </Layout>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
