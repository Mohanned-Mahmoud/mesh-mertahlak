import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel } from "lucide-react";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(".");
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4200;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressInterval);
    }, 16);

    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 450);

    const exitTimer = setTimeout(() => {
      clearInterval(dotsInterval);
      setExiting(true);
      setTimeout(onDone, 600);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
          dir="rtl"
        >
          {/* Decorative blobs */}
          <motion.div
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-40 pointer-events-none"
            style={{ background: "hsl(330,100%,50%)", border: "4px solid #000" }}
            animate={{ scale: [1, 1.15, 1], rotate: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-12 w-60 h-60 rounded-full opacity-35 pointer-events-none"
            style={{ background: "hsl(218,100%,55%)", border: "4px solid #000" }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/3 -left-8 w-28 h-28 rounded-full opacity-30 pointer-events-none"
            style={{ background: "hsl(152,100%,40%)", border: "4px solid #000" }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          <div className="flex flex-col items-center gap-6 px-6">
            {/* Bouncing icon */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [-6, 6, -6] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center w-32 h-32 rounded-full"
              style={{
                background: "#fff",
                border: "4px solid #000",
                boxShadow: "6px 6px 0 #000",
              }}
            >
              <Gavel size={62} strokeWidth={2.5} color="#000" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
              style={{
                fontFamily: "Lalezar",
                fontSize: "clamp(2rem, 8vw, 4rem)",
                lineHeight: 1.2,
                color: "#000",
                textShadow: "4px 4px 0 rgba(0,0,0,0.18)",
                textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              مش مرتاحلك المضروبه
            </motion.h1>

            {/* Funny subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.65, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{
                fontFamily: "Cairo",
                fontWeight: 700,
                fontSize: "clamp(0.85rem, 3vw, 1.05rem)",
                color: "#000",
                textAlign: "center",
                maxWidth: 300,
              }}
            >
              النسخة المضروبة من مش مرتاحلك ©
            </motion.p>

            {/* Loading section */}
            <div className="w-full max-w-xs flex flex-col items-center gap-3 mt-2">
              <p
                style={{
                  fontFamily: "Cairo",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#000",
                  opacity: 0.72,
                  textAlign: "center",
                }}
              >
                بنسرق بقيت الفكرة وبنحمل{dots}
              </p>

              {/* Progress bar */}
              <div
                className="w-full h-6 rounded-full overflow-hidden relative"
                style={{ border: "4px solid #000", boxShadow: "4px 4px 0 #000", background: "#fff" }}
              >
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{
                    background: "hsl(330,100%,50%)",
                    width: `${progress}%`,
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 12px)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
