import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/lib/socket-context";
import SplashScreen from "@/components/splash-screen";

const SPLASH_SEEN_KEY = "rtc:splash-seen";

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
  const wakeLockRef = useRef<any>(null);
  const hiddenAtRef = useRef<number | null>(null);
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(SPLASH_SEEN_KEY) === "true";
  });

  const handleSplashDone = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
    }
    setSplashDone(true);
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const requestWakeLock = async () => {
      if (!("wakeLock" in navigator) || wakeLockRef.current) return;

      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        wakeLockRef.current?.addEventListener?.("release", () => {
          wakeLockRef.current = null;
        });
      } catch {
        // Ignore if browser blocks wake lock or does not support it.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        void wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const MIN_HIDDEN_MS_BEFORE_RELOAD = 2000;

    const handleVisibilityRefresh = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (document.visibilityState === "visible" && hiddenAtRef.current) {
        const hiddenFor = Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;

        if (hiddenFor >= MIN_HIDDEN_MS_BEFORE_RELOAD) {
          window.location.reload();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityRefresh);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SocketProvider>
          {!splashDone && <SplashScreen onDone={handleSplashDone} />}
          <Suspense fallback={null}>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}> 
              <Router />
            </WouterRouter>
          </Suspense>
        </SocketProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
