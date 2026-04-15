import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/lib/socket-context";
import {
  IconDiamond,
  IconGavel,
  IconController,
  IconQuestion,
  IconEye,
  IconDevil,
  IconMic,
  IconTarget,
  IconLaugh,
  IconThinking,
  IconLock,
  IconCheck,
  IconHome,
  IconRepeat,
  IconVote,
  IconScale,
} from "@/components/game-icons";

/* ─── Design Tokens ───────────────────────────────────────────── */
const PINK   = "hsl(330,100%,50%)";
const BLUE   = "hsl(218,100%,55%)";
const GREEN  = "hsl(152,100%,40%)";
const ORANGE = "hsl(22,100%,55%)";
const YELLOW = "hsl(47,100%,52%)";
const RED    = "hsl(0,100%,50%)";
const WHITE  = "#ffffff";
const BLACK  = "#000000";

/* ─── Brutal Button ───────────────────────────────────────────── */
function BrutalBtn({
  children,
  onClick,
  disabled,
  bg = PINK,
  color = WHITE,
  size = "lg",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  bg?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: "py-2 px-4 text-base",
    md: "py-3 px-5 text-lg",
    lg: "py-4 px-6 text-xl",
    xl: "py-5 px-7 text-2xl",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-brutal w-full ${sizeMap[size]}`}
      style={{ background: bg, color }}
    >
      {children}
    </button>
  );
}

/* ─── Scoreboard ──────────────────────────────────────────────── */
function Scoreboard({ players }: { players: { id: string; name: string; score: number }[] }) {
  const [open, setOpen] = useState(false);
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed top-3 left-3 z-50" dir="rtl">
      <motion.button
        whileTap={{ scale: 0.88, x: 3, y: 3 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm"
        style={{
          fontFamily: "Cairo",
          background: YELLOW,
          color: BLACK,
          border: "4px solid #000",
          boxShadow: "4px 4px 0 #000",
        }}
      >
        <IconDiamond size={22} />
        <span>النقاط</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="card-brutal absolute top-14 left-0 p-4 min-w-[210px]"
          >
            <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "3px solid #000" }}>
              <IconDiamond size={24} />
              <h3 className="text-xl" style={{ fontFamily: "Lalezar" }}>لوحة الشرف</h3>
            </div>
            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex justify-between items-center py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: [YELLOW, "#C0C0C0", "#CD7F32", BLUE, GREEN][i] ?? BLUE, border: "2px solid #000", fontFamily: "Lalezar" }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold text-sm truncate max-w-[100px]" style={{ fontFamily: "Cairo" }}>
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold" style={{ fontFamily: "Lalezar", fontSize: "1.1rem" }}>{p.score}</span>
                  <IconDiamond size={18} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Round Badge ─────────────────────────────────────────────── */
function RoundBadge({ round }: { round: number }) {
  return (
    <div
      className="fixed top-20 right-3 z-50 px-3 py-1.5 rounded-xl font-bold text-sm"
      style={{
        fontFamily: "Cairo",
        background: BLUE,
        color: WHITE,
        border: "4px solid #000",
        boxShadow: "3px 3px 0 #000",
      }}
    >
      الجولة {round}
    </div>
  );
}

/* ─── Share Button (Fixed Version) ────────────────────────────── */
function ShareRoomButton({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false);
  
  // اللينك بدون اسم عشان الناس الجديدة تكتب اسمها
  const roomUrl = `${window.location.origin}/room/${roomCode}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "انضم إلى غرفة Date Judge",
          text: `ادخل الروم ده: ${roomCode}`,
          url: roomUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(roomUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        window.prompt("انسخ لينك الروم ده", roomUrl);
      }
    }
  };

  return (
    <BrutalBtn onClick={handleShare} bg={ORANGE} color={BLACK} size="lg">
      <span className="inline-flex items-center gap-2">
        {copied ? <IconCheck size={18} /> : <IconRepeat size={18} />}
        {copied ? "تم نسخ لينك الروم" : "ابعت لينك الروم"}
      </span>
    </BrutalBtn>
  );
}

/* ─── Lobby ───────────────────────────────────────────────────── */
function LobbyScreen() {
  const { gameState, myPlayerId, startGame, transferHost } = useSocket();
  if (!gameState) return null;

  const isHost = myPlayerId === gameState.hostPlayerId;
  const canStart = gameState.players.length >= 3;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5" dir="rtl">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="card-brutal w-full max-w-sm overflow-hidden"
        style={{ padding: 0 }}
      >
        {/* Header */}
        <div
          className="py-5 px-5 text-center flex flex-col items-center gap-2"
          style={{ background: BLUE, borderBottom: "4px solid #000" }}
        >
          <motion.div
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <IconScale size={64} />
          </motion.div>
          <h2 className="text-4xl text-white" style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}>
            صالة الانتظار
          </h2>
          <p className="text-white text-sm font-bold opacity-90" style={{ fontFamily: "Cairo" }}>
            شارك الكود مع أصحابك
          </p>
        </div>

        {/* Room code */}
        <div className="px-5 pt-5">
          <div
            className="w-full rounded-2xl py-4 text-center"
            style={{ background: YELLOW, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
          >
            <p className="text-xs font-bold mb-1 opacity-60" style={{ fontFamily: "Cairo" }}>كود الغرفة</p>
            <p className="tracking-[0.35em] text-5xl" style={{ fontFamily: "Lalezar", color: BLACK }}>
              {gameState.roomCode}
            </p>
          </div>
        </div>

        {/* Share Button Restored */}
        <div className="px-5 pt-4">
          <ShareRoomButton roomCode={gameState.roomCode} />
        </div>

        {/* Players */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: PINK, border: "3px solid #000", fontFamily: "Cairo" }}
            >
              {gameState.players.length}
            </span>
            <span className="font-bold text-sm" style={{ fontFamily: "Cairo" }}>لاعبين في الغرفة</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {gameState.players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: p.id === myPlayerId ? "hsl(330,100%,95%)" : "#f5f5f5", border: "3px solid #000" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    background: [PINK, BLUE, GREEN, ORANGE, RED][i % 5],
                    border: "3px solid #000",
                    fontFamily: "Lalezar",
                    fontSize: "1.2rem",
                  }}
                >
                  {p.name.charAt(0)}
                </div>
                <span className="font-bold flex-1 truncate" style={{ fontFamily: "Cairo" }}>{p.name}</span>
                {p.id === gameState.hostPlayerId && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: ORANGE, color: WHITE, border: "2px solid #000", fontFamily: "Cairo" }}>
                    هوست
                  </span>
                )}
                {p.id === myPlayerId && p.id !== gameState.hostPlayerId && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: BLUE, color: WHITE, border: "2px solid #000", fontFamily: "Cairo" }}>
                    أنت
                  </span>
                )}
                {isHost && p.id !== gameState.hostPlayerId && (
                  <button
                    type="button"
                    onClick={() => transferHost(p.id)}
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: YELLOW, color: BLACK, border: "2px solid #000", fontFamily: "Cairo" }}
                    title="تسليم الهوست"
                  >
                    خلّيه هوست
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="px-5 py-5">
          {isHost ? (
            <div className="space-y-3">
              {!canStart && (
                <p className="text-center text-xs font-bold opacity-50" style={{ fontFamily: "Cairo" }}>
                  محتاج ٣ لاعبين على الأقل عشان تبدأ
                </p>
              )}
              <button
                onClick={startGame}
                disabled={!canStart}
                className="btn-brutal w-full py-4 flex items-center justify-center gap-3"
                style={{ background: GREEN, color: BLACK, fontSize: "1.5rem" }}
              >
                <IconController size={36} />
                ابدأ اللعبة!
              </button>
            </div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full rounded-2xl py-4 text-center font-bold text-base flex items-center justify-center gap-3"
              style={{ background: "#f0f0f0", border: "4px solid #000", fontFamily: "Cairo" }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <IconRepeat size={24} />
              </motion.div>
              بنستنى الهوست يبدأ اللعبة...
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Judge Card Display (Fixed Version) ──────────────────────── */
function JudgeCardDisplay() {
  const { gameState, nextPhase, changeQuestion } = useSocket();
  const [flipped, setFlipped] = useState(false);
  if (!gameState?.currentQuestion) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-6" dir="rtl">
      {/* Role banner */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="w-full max-w-sm rounded-2xl py-4 px-5 flex items-center justify-center gap-4"
        style={{ background: PINK, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
      >
        <motion.div animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2, repeat: Infinity }}>
          <IconGavel size={56} />
        </motion.div>
        <div>
          <p className="text-3xl text-white" style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}>
            أنت القاضي
          </p>
          <p className="text-white text-sm font-bold opacity-90" style={{ fontFamily: "Cairo" }}>
            اقلب الكارت وافهم السؤال
          </p>
        </div>
      </motion.div>

      {/* Answer card — tap to reveal (React State Version - Fixed) */}
      <motion.div
        className="w-full max-w-sm cursor-pointer"
        onClick={() => setFlipped(true)}
      >
        <div
          className="rounded-3xl overflow-hidden bg-white"
          style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000", minHeight: "230px" }}
        >
          {!flipped ? (
            <motion.div 
              className="flex flex-col items-center justify-center p-6 gap-3 h-full min-h-[230px]"
              style={{ background: "hsl(275,100%,50%)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-white"
              >
                <IconQuestion size={90} />
              </motion.div>
              <p
                className="text-white text-xl"
                style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}
              >
                اضغط لكشف السؤال
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-6 flex flex-col items-center justify-center gap-4 h-full min-h-[230px]"
            >
              <IconScale size={52} />
              <p className="text-xs font-bold opacity-50" style={{ fontFamily: "Cairo" }}>السؤال</p>
              <p
                className="text-2xl text-center leading-snug"
                style={{ fontFamily: "Lalezar", color: BLACK }}
              >
                {gameState.currentQuestion.question}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {!flipped && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-bold opacity-60 text-center"
          style={{ fontFamily: "Cairo" }}
        >
          اضغط الكارت عشان تشوف السؤال
        </motion.p>
      )}

      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 20 }}
            className="w-full max-w-sm space-y-3"
          >
            <button
              onClick={changeQuestion}
              className="btn-brutal w-full py-4 flex items-center justify-center gap-3"
              style={{ background: BLUE, color: WHITE, fontSize: "1.2rem" }}
            >
              <IconRepeat size={30} />
              تغيير السؤال
            </button>
            <div
              className="rounded-2xl p-4 text-center flex items-center justify-center gap-3"
              style={{ background: "#f9f9f9", border: "4px solid #000" }}
            >
              <IconMic size={32} />
              <p className="text-sm font-bold opacity-70" style={{ fontFamily: "Cairo" }}>
                اللاعبين بيشرحوا إجاباتهم... استنّى لحد ما يخلصوا
              </p>
            </div>
            <button
              onClick={nextPhase}
              className="btn-brutal w-full py-4 flex items-center justify-center gap-3 text-white"
              style={{ background: ORANGE, fontSize: "1.4rem" }}
            >
              <IconMic size={32} />
              اللاعبين خلصوا
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Player Card Display ─────────────────────────────────────── */
function PlayerCardDisplay() {
  const { gameState } = useSocket();
  const [revealed, setRevealed] = useState(false);
  const [hiddenMode, setHiddenMode] = useState(false);
  if (!gameState?.currentQuestion) return null;

  const isTruthTeller = gameState.myRole === "truth-teller";
  const roleBg  = isTruthTeller ? GREEN  : RED;
  const roleAr  = isTruthTeller ? "عين العقل" : "المخادع";
  const roleTip = isTruthTeller
    ? "قول الإجابة الصح بس اتصرف إنك مش واثق — خلّي القاضي يشك فيك"
    : "اخترع إجابة منطقية وقولها بثقة — خدّع القاضي!";

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5" dir="rtl">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setHiddenMode((prev) => !prev)}
          className="btn-brutal w-full py-3 flex items-center justify-center gap-2"
          style={{ background: hiddenMode ? ORANGE : BLACK, color: WHITE, fontSize: "1rem" }}
        >
          <IconLock size={20} />
          {hiddenMode ? "إظهار التفاصيل" : "إخفاء التفاصيل"}
        </button>
      </div>

      {hiddenMode ? (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000", background: WHITE }}
        >
          <div className="py-3 px-5 text-center" style={{ background: "#f0f0f0", borderBottom: "4px solid #000" }}>
            <p className="text-xs font-bold opacity-50 mb-1" style={{ fontFamily: "Cairo" }}>السؤال</p>
            <p className="text-base font-bold" style={{ fontFamily: "Cairo" }}>
              {gameState.currentQuestion.question}
            </p>
          </div>
          <div className="py-8 px-5 text-center" style={{ background: YELLOW }}>
            <p className="text-lg" style={{ fontFamily: "Lalezar" }}>وضع الخصوصية مفعل</p>
            <p className="text-sm font-bold opacity-80 mt-2" style={{ fontFamily: "Cairo" }}>
              الدور والإجابة مخفيين
            </p>
          </div>
        </motion.div>
      ) : (
        <>
      {/* Role stamp */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 16 }}
        className="w-full max-w-sm rounded-3xl py-5 px-5 text-center flex flex-col items-center gap-3"
        style={{ background: roleBg, border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {isTruthTeller ? <IconEye size={80} /> : <IconDevil size={80} />}
        </motion.div>
        <p className="text-3xl text-white" style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}>
          {roleAr}
        </p>
      </motion.div>

      {/* Answer card */}
      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 18 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl overflow-hidden" style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}>
          {/* Question strip */}
          <div className="py-3 px-5 text-center" style={{ background: "#f0f0f0", borderBottom: "4px solid #000" }}>
            <p className="text-xs font-bold opacity-50 mb-1" style={{ fontFamily: "Cairo" }}>السؤال</p>
            <p className="text-base font-bold" style={{ fontFamily: "Cairo" }}>
              {gameState.currentQuestion.question}
            </p>
          </div>
          {/* Answer reveal */}
          <div
            className="py-8 px-5 flex flex-col items-center justify-center bg-white cursor-pointer select-none"
            onClick={() => setRevealed(true)}
          >
            {!revealed ? (
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-center flex flex-col items-center gap-3"
              >
                <IconLock size={64} />
                <p className="font-bold text-base opacity-60" style={{ fontFamily: "Cairo" }}>
                  اضغط لكشف الإجابة الصح
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="text-center"
              >
                <p className="text-xs font-bold opacity-50 mb-2" style={{ fontFamily: "Cairo" }}>الإجابة الصح</p>
                <p
                  className="text-4xl"
                  style={{ fontFamily: "Lalezar", color: PINK, textShadow: "2px 2px 0 #000" }}
                >
                  {gameState.currentQuestion.answer}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tip */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl py-4 px-5 text-center"
            style={{
              background: isTruthTeller ? "hsl(152,100%,88%)" : "hsl(0,100%,93%)",
              border: "4px solid #000",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>{roleTip}</p>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* ─── Verbal Phase ────────────────────────────────────────────── */
function VerbalPhase() {
  const { gameState, myPlayerId, startVoting } = useSocket();
  if (!gameState) return null;
  const isJudge = myPlayerId === gameState.currentJudgeId;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-6" dir="rtl">
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <IconMic size={110} />
      </motion.div>

      <div className="text-center">
        <h2 className="text-4xl" style={{ fontFamily: "Lalezar", color: PINK, textShadow: "3px 3px 0 #000" }}>
          وقت الكلام!
        </h2>
        <p className="text-base font-bold mt-2 opacity-70" style={{ fontFamily: "Cairo" }}>
          كل اللاعبين بيشرحوا إجاباتهم
        </p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm rounded-2xl py-5 px-5"
        style={{ background: WHITE, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
      >
        {isJudge ? (
          <div className="space-y-4">
            <p className="text-sm font-bold text-center" style={{ fontFamily: "Cairo" }}>
              استنّى ما كل واحد يشرح إجابته، وبعدين ابدأ التصويت
            </p>
            <button
              onClick={startVoting}
              className="btn-brutal w-full py-4 flex items-center justify-center gap-3 text-white"
              style={{ background: PINK, fontSize: "1.4rem" }}
            >
              <IconVote size={36} />
              وقت التصويت!
            </button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="flex gap-2 justify-center items-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                className="w-3 h-3 rounded-full"
                style={{ background: BLUE, border: "2px solid #000" }}
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.18 }}
                className="w-3 h-3 rounded-full"
                style={{ background: PINK, border: "2px solid #000" }}
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.36 }}
                className="w-3 h-3 rounded-full"
                style={{ background: GREEN, border: "2px solid #000" }}
              />
            </div>
            <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>
              القاضي بيستمع... استنّى لحد ما يبدأ التصويت
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Voting Screen ───────────────────────────────────────────── */
function VotingScreen() {
  const { gameState, myPlayerId, submitVote } = useSocket();
  const [voted, setVoted] = useState<string | null>(null);
  if (!gameState) return null;

  const isJudge = myPlayerId === gameState.currentJudgeId;
  const otherPlayers = gameState.players.filter((p) => p.id !== gameState.currentJudgeId);
  const avatarColors = [PINK, BLUE, GREEN, ORANGE, RED, "hsl(275,100%,50%)"];

  const handleVote = (id: string) => {
    if (voted) return;
    setVoted(id);
    submitVote(id);
  };

  if (!isJudge) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-6" dir="rtl">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <IconThinking size={120} />
        </motion.div>
        <h2 className="text-4xl text-center" style={{ fontFamily: "Lalezar", color: BLUE, textShadow: "3px 3px 0 #000" }}>
          القاضي بيفكر...
        </h2>
        <div
          className="w-full max-w-sm rounded-2xl py-4 px-5 text-center"
          style={{ background: WHITE, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
        >
          <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>
            مين هيختار؟
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col p-5 pt-16 gap-4" dir="rtl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-1 flex flex-col items-center gap-2"
      >
        <IconEye size={70} />
        <h2 className="text-4xl" style={{ fontFamily: "Lalezar", color: PINK, textShadow: "3px 3px 0 #000" }}>
          مين صاحب عين العقل؟
        </h2>
        <p className="text-sm font-bold opacity-60" style={{ fontFamily: "Cairo" }}>
          اضغط على اللاعب اللي فاكر إنه قال الإجابة الصح
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {otherPlayers.map((player, i) => (
          <motion.button
            key={player.id}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.09, type: "spring", stiffness: 250, damping: 20 }}
            onClick={() => handleVote(player.id)}
            disabled={!!voted}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-right"
            style={{
              background: voted === player.id ? GREEN : WHITE,
              border: "4px solid #000",
              boxShadow: voted === player.id ? "3px 3px 0 #000" : "6px 6px 0 #000",
              transform: voted === player.id ? "translate(3px, 3px)" : "",
              transition: "all 80ms ease",
              cursor: voted ? "default" : "pointer",
              opacity: voted && voted !== player.id ? 0.45 : 1,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: avatarColors[i % avatarColors.length],
                border: "4px solid #000",
                fontFamily: "Lalezar",
                fontSize: "1.9rem",
              }}
            >
              {player.name.charAt(0)}
            </div>
            <span className="text-2xl flex-1" style={{ fontFamily: "Lalezar" }}>
              {player.name}
            </span>
            {voted === player.id && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <IconCheck size={40} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── Screen: Scoring reveal ──────────────────────────────────── */
function ScoringScreen() {
  const { gameState, myPlayerId, nextRound } = useSocket();
  if (!gameState?.lastRoundResult) return null;

  const { judgeGuessedRight, truthTellerName, votedForName } = gameState.lastRoundResult;
  const isJudge = myPlayerId === gameState.currentJudgeId;
  const isHost  = myPlayerId === gameState.hostPlayerId;

  // فحص هل في فائز؟
  const hasWinner = gameState.players.some(p => p.score >= 6);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5" dir="rtl">
      <motion.div
        className="w-full max-w-sm rounded-3xl py-7 px-5 text-center"
        style={{ background: judgeGuessedRight ? GREEN : RED, border: "4px solid #000", boxShadow: "10px 10px 0 #000" }}
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 14 }}
      >
        <motion.div className="mb-3" animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.7, delay: 0.3 }}>
          {judgeGuessedRight ? <IconTarget size={86} /> : <IconLaugh size={86} />}
        </motion.div>
        <h2 className="text-4xl text-white" style={{ fontFamily: "Lalezar", textShadow: "3px 3px 0 #000" }}>
          {judgeGuessedRight ? "القاضي أصابها!" : "القاضي اتخدع!"}
        </h2>
      </motion.div>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 18 }} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}>
        <div className="py-3 px-5 text-center" style={{ background: "#f0f0f0", borderBottom: "4px solid #000" }}>
          <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>صاحب عين العقل الحقيقي كان...</p>
        </div>
        <div className="bg-white py-5 px-5 text-center">
          <p className="text-4xl" style={{ fontFamily: "Lalezar", color: PINK, textShadow: "2px 2px 0 #000" }}>{truthTellerName}</p>
          {!judgeGuessedRight && <p className="text-sm mt-2 font-bold opacity-60" style={{ fontFamily: "Cairo" }}>القاضي صوّت على: {votedForName}</p>}
        </div>
      </motion.div>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 }} className="w-full max-w-sm space-y-3">
        {judgeGuessedRight ? (
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: "spring", stiffness: 280 }} className="rounded-2xl py-4 px-5 flex items-center gap-3" style={{ background: YELLOW, border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}>
            <IconDiamond size={32} /> <span className="font-bold text-base" style={{ fontFamily: "Cairo" }}>القاضي كسب الماسة!</span>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: "spring", stiffness: 280 }} className="rounded-2xl py-4 px-5 flex items-center gap-3" style={{ background: GREEN, border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}>
              <IconDiamond size={32} /> <span className="font-bold text-sm" style={{ fontFamily: "Cairo" }}>عين العقل ({truthTellerName}) كسب ماسة!</span>
            </motion.div>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0, type: "spring", stiffness: 280 }} className="rounded-2xl py-4 px-5 flex items-center gap-3" style={{ background: PINK, border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}>
              <IconDiamond size={32} /> <span className="font-bold text-sm text-white" style={{ fontFamily: "Cairo" }}>اللي الحكم اختاره ({votedForName}) كسب ماسة!</span>
            </motion.div>
          </>
        )}
      </motion.div>

      {(isJudge || isHost) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="w-full max-w-sm">
          <BrutalBtn onClick={nextRound} bg={hasWinner ? PINK : BLUE} size="xl">
            <span className="inline-flex items-center justify-center gap-2 w-full">
              {hasWinner ? <IconDiamond size={24} /> : <IconRepeat size={24} />}
              {hasWinner ? "تتويج الفائز!" : "الجولة الجاية!"}
            </span>
          </BrutalBtn>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Screen: Game Over ──────────────────────────────────────── */
function GameOverScreen() {
  const { gameState, myPlayerId, socket } = useSocket();
  if (!gameState) return null;

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isHost = myPlayerId === gameState.hostPlayerId;

  const handlePlayAgain = () => {
    socket?.emit("play-again", { roomCode: gameState.roomCode });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-6" dir="rtl">
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-full max-w-sm rounded-3xl py-8 px-5 text-center"
        style={{ background: YELLOW, border: "4px solid #000", boxShadow: "10px 10px 0 #000" }}
      >
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-4 text-black flex justify-center">
          <IconDiamond size={100} />
        </motion.div>
        <p className="text-xl font-bold mb-1 opacity-70" style={{ fontFamily: "Cairo" }}>الفائز باللعبة هو</p>
        <h2 className="text-5xl" style={{ fontFamily: "Lalezar", color: BLACK }}>{winner.name}</h2>
        <div className="mt-4 inline-block bg-white px-4 py-2 rounded-xl" style={{ border: "3px solid #000" }}>
          <span className="font-bold text-2xl flex items-center gap-2" style={{ fontFamily: "Lalezar" }}>
            {winner.score} <IconDiamond size={20} />
          </span>
        </div>
      </motion.div>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="w-full max-w-sm mt-4">
        {isHost ? (
          <BrutalBtn onClick={handlePlayAgain} bg={GREEN} size="xl">
            <span className="inline-flex items-center justify-center gap-2 w-full text-black">
              <IconRepeat size={28} /> العبوا كمان مرة!
            </span>
          </BrutalBtn>
        ) : (
          <div className="text-center p-4 rounded-xl bg-white/50 font-bold" style={{ border: "3px solid #000", fontFamily: "Cairo" }}>
            بنستنى الهوست يقرر هتلعبوا تاني ولا لأ...
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Root Room Component (Fixed Version) ─────────────────────── */
export default function Room() {
  const [match, params] = useRoute("/room/:code");
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const queryName = searchParams.get("name")?.trim() || "";
  
  // 1. ضفنا `socket` هنا عشان نراقب حالته
  const { socket, gameState, myPlayerId, joinRoom, error } = useSocket();
  const joinedRef = useRef(false);
  const autoJoinFromQueryRef = useRef(Boolean(queryName));
  const [playerName, setPlayerName] = useState(() => {
    return searchParams.get("name") || localStorage.getItem("date-judge-player-name") || "";
  });

  const roomCode = params?.code?.toUpperCase() || "";

  const handleJoinRoom = () => {
    const trimmedName = playerName.trim();
    // 2. مش هننفذ الدخول غير لو الـ socket موجود
    if (!match || !roomCode || !trimmedName || !socket) return; 

    localStorage.setItem("date-judge-player-name", trimmedName);
    joinRoom(roomCode, trimmedName);
    joinedRef.current = true;
  };

  useEffect(() => {
    if (!match || joinedRef.current) return;
    if (!roomCode) return; 
    if (!autoJoinFromQueryRef.current || !queryName) return;
    
    // 3. السطر السحري: لو خط الاتصال لسه بيقوم، استنى وماتعملش حاجة
    if (!socket) return; 

    localStorage.setItem("date-judge-player-name", queryName);
    joinRoom(roomCode, queryName);
    joinedRef.current = true;
    autoJoinFromQueryRef.current = false;
  }, [match, roomCode, queryName, joinRoom, socket]); // 4. auto-join من باراميتر الاسم فقط

  // Screen for entering name if coming from a shared link without a name
  if (!joinedRef.current) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center p-5"
        style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="card-brutal w-full max-w-sm overflow-hidden"
          style={{ padding: 0 }}
        >
          <div className="py-5 px-5 text-center" style={{ background: BLUE, borderBottom: "4px solid #000" }}>
            <h2 className="text-4xl text-white" style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}>
              ادخل الغرفة
            </h2>
            <p className="text-white text-sm font-bold mt-1 opacity-90" style={{ fontFamily: "Cairo" }}>
              كود الغرفة جاهز، بس لسه محتاج اسمك
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div
              className="w-full rounded-2xl py-4 text-center"
              style={{ background: YELLOW, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
            >
              <p className="text-xs font-bold mb-1 opacity-60" style={{ fontFamily: "Cairo" }}>كود الغرفة</p>
              <p className="tracking-[0.35em] text-5xl" style={{ fontFamily: "Lalezar", color: BLACK }}>
                {roomCode}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-base font-bold block" style={{ fontFamily: "Cairo" }}>
                اسمك
              </label>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerName.trim() && socket) handleJoinRoom();
                }}
                placeholder="اكتب اسمك هنا..."
                className="w-full h-14 px-4 rounded-2xl text-base font-bold outline-none"
                style={{
                  fontFamily: "Cairo",
                  border: "4px solid #000",
                  boxShadow: "4px 4px 0 #000",
                  background: "white",
                  textAlign: "right",
                }}
                autoFocus
              />
            </div>

            <BrutalBtn 
              onClick={handleJoinRoom} 
              disabled={!playerName.trim() || !socket} // 5. الزرار هيفضل مطفي ثانية لحد ما الاتصال يتم
              bg={GREEN} 
              color={BLACK} 
              size="xl"
            >
              <span className="inline-flex items-center gap-2">
                <IconHome size={22} /> ادخل اللعبة
              </span>
            </BrutalBtn>
          </div>
        </motion.div>
      </div>
    );
  }

  /* Loading */
  if (!gameState && !error) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center gap-5"
        style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full"
          style={{ border: "6px solid #000", borderTopColor: PINK }}
        />
        <p className="font-bold text-lg" style={{ fontFamily: "Cairo" }}>
          بنوصّلك بالغرفة...
        </p>
      </div>
    );
  }

  /* Error */
  if (error) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5"
        style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          <IconDevil size={100} />
        </motion.div>
        <div className="card-brutal w-full max-w-sm py-5 px-5 text-center" style={{ background: RED, color: WHITE }}>
          <p className="text-xl font-bold" style={{ fontFamily: "Lalezar", textShadow: "1px 1px 0 #000" }}>
            {error}
          </p>
        </div>
        <button
          onClick={() => setLocation("/")}
          className="btn-brutal w-full max-w-sm py-4 flex items-center justify-center gap-3"
          style={{ background: WHITE, color: BLACK, fontSize: "1.3rem" }}
        >
          <IconHome size={30} />
          الرجوع للبداية
        </button>
      </div>
    );
  }

  const phase   = gameState!.phase;
  const isJudge = myPlayerId === gameState!.currentJudgeId;

  return (
    <div
      className="relative min-h-[100dvh]"
      style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
    >
      {gameState && <Scoreboard players={gameState.players} />}
      {phase !== "lobby" && <RoundBadge round={gameState!.roundNumber} />}

      <AnimatePresence mode="wait">
        {phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <LobbyScreen />
          </motion.div>
        )}
        {phase === "card-display" && isJudge && (
          <motion.div key="judge-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <JudgeCardDisplay />
          </motion.div>
        )}
        {phase === "card-display" && !isJudge && (
          <motion.div key="player-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <PlayerCardDisplay />
          </motion.div>
        )}
        {phase === "verbal" && (
          <motion.div key="verbal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <VerbalPhase />
          </motion.div>
        )}
        {phase === "voting" && (
          <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <VotingScreen />
          </motion.div>
        )}
        {phase === "scoring" && (
          <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <ScoringScreen />
          </motion.div>
        )}
        {/* ضيف الجزء ده هنا */}
        {phase === "game-over" && (
          <motion.div key="game-over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <GameOverScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}