import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { PageTransition } from "@/components/layout/PageTransition";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CoachesPage from "@/pages/coaches";
import FeedPage from "@/pages/feed";
import ProgramsPage from "@/pages/programs";
import StorePage from "@/pages/store";
import MessagesPage from "@/pages/messages";
import LeaguesPage from "@/pages/leagues";
import ChallengesPage from "@/pages/challenges";
import EducationPage from "@/pages/education";
import ProfilePage from "@/pages/profile";
import AuthPage from "@/pages/auth";
import DesignSystemPage from "@/pages/design-system";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/coaches" component={CoachesPage} />
      <Route path="/coaches/:id" component={CoachesPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/programs/:id" component={ProgramsPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/store/:id" component={StorePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/leagues" component={LeaguesPage} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/education" component={EducationPage} />
      <Route path="/education/:id" component={EducationPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/design-system" component={DesignSystemPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <PageTransition>
            <Router />
          </PageTransition>
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
