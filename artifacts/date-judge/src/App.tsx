import { Suspense, lazy, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/lib/socket-context";
import SplashScreen from "@/components/splash-screen";
import PwaInstallButton from "@/components/pwa-install-button";

const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Home = lazy(() => import("@/pages/home"));
const Room = lazy(() => import("@/pages/room"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/play" component={Home} />
      <Route path="/room/:code" component={Room} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SocketProvider>
          {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
          <Suspense fallback={null}>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}> 
              <Router />
            </WouterRouter>
          </Suspense>
          <PwaInstallButton />
        </SocketProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
