import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(".");
  const [exiting, setExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const exitingRef = useRef(false);

  const triggerExit = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(onDone, 600);
  };

  // Dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  // Hard fallback: exit after 12s no matter what
  useEffect(() => {
    const t = setTimeout(triggerExit, 12000);
    return () => clearTimeout(t);
  }, []);

  // Video progress tracking + fallback if video can't play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Track progress via video time
    const onTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    // When video ends, exit
    const onEnded = () => triggerExit();

    // If video fails to load, fall back to a simple timed progress bar
    const onError = () => {
      const duration = 4200;
      const start = Date.now();
      const interval = setInterval(() => {
        const pct = Math.min(((Date.now() - start) / duration) * 100, 100);
        setProgress(pct);
        if (pct >= 100) {
          clearInterval(interval);
          triggerExit();
        }
      }, 16);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-end justify-end overflow-hidden"
          style={{ background: "#000" }}
          dir="rtl"
        >
          {/* ── Video background ── */}
          <video
            ref={videoRef}
            src="/splash.mp4"
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />

          {/* ── Overlay: dark fade only at the bottom where text sits ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 35%, transparent 65%)",
              zIndex: 1,
            }}
          />

          {/* ── Content pinned to bottom ── */}
          <div className="relative w-full flex flex-col items-center gap-5 px-6 pb-10" style={{ zIndex: 3 }}>
            {/* Title */}
            <motion.h1
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
              style={{
                fontFamily: "Lalezar",
                fontSize: "clamp(2rem, 8vw, 4rem)",
                lineHeight: 1.2,
                color: "#fff",
                textShadow: "4px 4px 0 rgba(0,0,0,0.5)",
                textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              مش مرتاحلك المضروبه
            </motion.h1>

            {/* Funny subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{
                fontFamily: "Cairo",
                fontWeight: 700,
                fontSize: "clamp(0.85rem, 3vw, 1.05rem)",
                color: "#fff",
                textAlign: "center",
                maxWidth: 300,
                textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
              }}
            >
              النسخة المضروبة من مش مرتاحلك ©
            </motion.p>

            {/* Loading + progress */}
            <div className="w-full max-w-xs flex flex-col items-center gap-3 mt-2">
              <p
                style={{
                  fontFamily: "Cairo",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#fff",
                  opacity: 0.85,
                  textAlign: "center",
                  textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                بنسرق بقيت الفكرة وبنحمل{dots}
              </p>

              <div
                className="w-full h-6 rounded-full overflow-hidden relative"
                style={{
                  border: "4px solid #000",
                  boxShadow: "4px 4px 0 #000",
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <div
                  className="absolute inset-y-0 right-0 rounded-full transition-none"
                  style={{
                    background: "hsl(330,100%,50%)",
                    width: `${progress}%`,
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 12px)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
