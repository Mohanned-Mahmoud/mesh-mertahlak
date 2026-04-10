import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/lib/socket-context";

/* ─── Shared Design Tokens ────────────────────────────────────── */
const PINK   = "hsl(330,100%,50%)";
const BLUE   = "hsl(218,100%,55%)";
const GREEN  = "hsl(152,100%,40%)";
const ORANGE = "hsl(22,100%,55%)";
const YELLOW = "hsl(47,100%,52%)";
const RED    = "hsl(0,100%,50%)";
const WHITE  = "#ffffff";
const BLACK  = "#000000";

/* ─── Reusable: Brutal Button ─────────────────────────────────── */
function BrutalBtn({
  children,
  onClick,
  disabled,
  bg = PINK,
  color = WHITE,
  size = "lg",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  bg?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeMap = { sm: "py-2 px-4 text-base", md: "py-3 px-5 text-lg", lg: "py-4 px-6 text-xl", xl: "py-5 px-7 text-2xl" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-brutal w-full ${sizeMap[size]} ${className}`}
      style={{ background: bg, color }}
    >
      {children}
    </button>
  );
}

/* ─── Scoreboard Overlay ──────────────────────────────────────── */
function Scoreboard({ players }: { players: { id: string; name: string; score: number }[] }) {
  const [open, setOpen] = useState(false);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const medalColors = [YELLOW, "#C0C0C0", "#CD7F32"];

  return (
    <div className="fixed top-3 left-3 z-50" dir="rtl">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        className="btn-brutal px-3 py-2 text-sm"
        style={{ background: YELLOW, color: BLACK, fontSize: "1rem", borderRadius: 12 }}
      >
        💎 النقاط
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="card-brutal absolute top-14 left-0 p-4 min-w-[200px]"
          >
            <h3
              className="text-xl text-center mb-3 pb-2"
              style={{ fontFamily: "Lalezar", borderBottom: "3px solid #000" }}
            >
              لوحة الشرف
            </h3>
            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex justify-between items-center py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "1.1rem" }}>
                    {i < 3 ? ["🥇","🥈","🥉"][i] : `${i+1}.`}
                  </span>
                  <span className="font-bold text-sm truncate max-w-[110px]" style={{ fontFamily: "Cairo" }}>
                    {p.name}
                  </span>
                </div>
                <span className="font-bold flex items-center gap-1" style={{ fontFamily: "Lalezar", fontSize: "1.1rem" }}>
                  {p.score} 💎
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Round badge ─────────────────────────────────────────────── */
function RoundBadge({ round }: { round: number }) {
  return (
    <div
      className="fixed top-3 right-3 z-50 px-3 py-1.5 rounded-xl font-bold text-sm"
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

function ShareRoomButton({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false);
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
      {copied ? "✅ تم نسخ لينك الروم" : "📤 ابعت لينك الروم"}
    </BrutalBtn>
  );
}

/* ─── Screen: Lobby ───────────────────────────────────────────── */
function LobbyScreen() {
  const { gameState, myPlayerId, startGame } = useSocket();
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
          className="py-5 px-5 text-center"
          style={{ background: BLUE, borderBottom: "4px solid #000" }}
        >
          <h2 className="text-4xl text-white" style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}>
            صالة الانتظار
          </h2>
          <p className="text-white text-sm font-bold mt-1 opacity-90" style={{ fontFamily: "Cairo" }}>
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
            <p
              className="tracking-[0.35em] text-5xl"
              style={{ fontFamily: "Lalezar", color: BLACK }}
            >
              {gameState.roomCode}
            </p>
          </div>
        </div>

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
            <span className="font-bold text-sm" style={{ fontFamily: "Cairo" }}>
              لاعبين في الغرفة
            </span>
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
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: [PINK, BLUE, GREEN, ORANGE, RED][i % 5], border: "3px solid #000", fontFamily: "Lalezar", fontSize: "1.1rem" }}
                >
                  {p.name.charAt(0)}
                </div>
                <span className="font-bold flex-1 truncate" style={{ fontFamily: "Cairo" }}>{p.name}</span>
                {p.id === gameState.hostPlayerId && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: ORANGE, color: WHITE, border: "2px solid #000", fontFamily: "Cairo" }}
                  >
                    هوست
                  </span>
                )}
                {p.id === myPlayerId && p.id !== gameState.hostPlayerId && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: BLUE, color: WHITE, border: "2px solid #000", fontFamily: "Cairo" }}
                  >
                    أنت
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="px-5 py-5">
          {isHost ? (
            <div className="space-y-2">
              {!canStart && (
                <p className="text-center text-xs font-bold opacity-50 mb-2" style={{ fontFamily: "Cairo" }}>
                  محتاج ٣ لاعبين على الأقل عشان تبدأ
                </p>
              )}
              <BrutalBtn onClick={startGame} disabled={!canStart} bg={GREEN} color={BLACK} size="xl">
                🎮 ابدأ اللعبة!
              </BrutalBtn>
            </div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full rounded-2xl py-4 text-center font-bold text-base"
              style={{ background: "#f0f0f0", border: "4px solid #000", fontFamily: "Cairo" }}
            >
              ⏳ بنستنى الهوست يبدأ اللعبة...
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Screen: Judge sees the question card ────────────────────── */
function JudgeCardDisplay() {
  const { gameState, nextPhase } = useSocket();
  const [flipped, setFlipped] = useState(false);
  if (!gameState?.currentQuestion) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-6" dir="rtl">
      {/* Role banner */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="w-full max-w-sm rounded-2xl py-4 px-5 text-center"
        style={{ background: PINK, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
      >
        <p className="text-3xl text-white" style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}>
          ⚖️ أنت القاضي
        </p>
        <p className="text-white text-sm font-bold mt-1 opacity-90" style={{ fontFamily: "Cairo" }}>
          اقلب الكارت وافهم السؤال
        </p>
      </motion.div>

      {/* 3-D Flip Card */}
      <div className="card-scene w-full max-w-sm" style={{ height: 220 }}>
        <motion.button
          type="button"
          className={`card-flipper ${flipped ? "is-flipped" : ""}`}
          onClick={() => !flipped && setFlipped(true)}
          whileTap={!flipped ? { scale: 0.97 } : {}}
          style={{ cursor: flipped ? "default" : "pointer", border: 0, padding: 0, background: "transparent" }}
          aria-label={flipped ? "تم كشف السؤال" : "اضغط لكشف السؤال"}
        >
          {/* BACK — decorative purple */}
          <div
            className="card-face flex flex-col items-center justify-center"
            style={{ background: "hsl(275,100%,50%)" }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-3"
            >
              ❓
            </motion.div>
            <p
              className="text-white text-xl"
              style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}
            >
              اضغط لكشف السؤال
            </p>
          </div>
          {/* FRONT — question */}
          <div
            className="card-face card-face--back flex flex-col items-center justify-center p-6"
            style={{ background: WHITE }}
          >
            <p className="text-xs font-bold mb-3 opacity-50" style={{ fontFamily: "Cairo" }}>السؤال</p>
            <p
              className="text-2xl text-center leading-snug"
              style={{ fontFamily: "Lalezar", color: BLACK }}
            >
              {gameState.currentQuestion.question}
            </p>
          </div>
        </motion.button>
      </div>

      {!flipped && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-bold opacity-60 text-center"
          style={{ fontFamily: "Cairo" }}
        >
          👆 اضغط الكارت عشان تشوف السؤال
        </motion.p>
      )}

      {!flipped && (
        <BrutalBtn
          onClick={() => setFlipped(true)}
          bg={ORANGE}
          size="lg"
          className="max-w-sm"
        >
          🔓 اضغط لكشف السؤال
        </BrutalBtn>
      )}

      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 20 }}
            className="w-full max-w-sm space-y-3"
          >
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: "#f9f9f9", border: "4px solid #000" }}
            >
              <p className="text-sm font-bold opacity-60" style={{ fontFamily: "Cairo" }}>
                🎤 اللاعبين بيشرحوا إجاباتهم... استنّى كل ما يخلصوا
              </p>
            </div>
            <BrutalBtn onClick={nextPhase} bg={ORANGE} size="xl">
              اللاعبين خلصوا 👂
            </BrutalBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Screen: Player sees answer + role ───────────────────────── */
function PlayerCardDisplay() {
  const { gameState } = useSocket();
  const [revealed, setRevealed] = useState(false);
  if (!gameState?.currentQuestion) return null;

  const isTruthTeller = gameState.myRole === "truth-teller";
  const roleBg   = isTruthTeller ? GREEN : RED;
  const roleIcon = isTruthTeller ? "🧠" : "😈";
  const roleAr   = isTruthTeller ? "عين العقل" : "اللي يأكل بعقل الحكم حلاوة";
  const roleTip  = isTruthTeller
    ? "قول الإجابة الصح بس اتصرف إنك مش واثق — خلّي القاضي يشك فيك"
    : "اخترع إجابة منطقية وقولها بثقة — خدّع القاضي!";

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5" dir="rtl">
      {/* Role stamp */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 16 }}
        className="w-full max-w-sm rounded-3xl py-5 px-5 text-center"
        style={{ background: roleBg, border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}
      >
        <motion.div
          className="text-6xl mb-2"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {roleIcon}
        </motion.div>
        <p
          className="text-3xl text-white"
          style={{ fontFamily: "Lalezar", textShadow: "2px 2px 0 #000" }}
        >
          {roleAr}
        </p>
      </motion.div>

      {/* Answer card — tap to reveal */}
      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 18 }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}
        >
          {/* Question strip */}
          <div
            className="py-3 px-5 text-center"
            style={{ background: "#f0f0f0", borderBottom: "4px solid #000" }}
          >
            <p className="text-xs font-bold opacity-50 mb-1" style={{ fontFamily: "Cairo" }}>السؤال</p>
            <p className="text-base font-bold" style={{ fontFamily: "Cairo" }}>
              {gameState.currentQuestion.question}
            </p>
          </div>
          {/* Answer reveal */}
          <div
            className="py-6 px-5 flex flex-col items-center justify-center bg-white cursor-pointer select-none"
            onClick={() => setRevealed(true)}
          >
            {!revealed ? (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-center"
              >
                <p className="text-4xl mb-2">🔒</p>
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
              background: isTruthTeller ? "hsl(152,100%,90%)" : "hsl(0,100%,92%)",
              border: "4px solid #000",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>{roleTip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Screen: Verbal phase ────────────────────────────────────── */
function VerbalPhase() {
  const { gameState, myPlayerId, startVoting } = useSocket();
  if (!gameState) return null;
  const isJudge = myPlayerId === gameState.currentJudgeId;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-6" dir="rtl">
      <motion.div
        animate={{ scale: [1, 1.06, 1], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="text-8xl"
      >
        🎤
      </motion.div>

      <div className="text-center">
        <h2
          className="text-4xl"
          style={{ fontFamily: "Lalezar", color: PINK, textShadow: "3px 3px 0 #000" }}
        >
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
            <BrutalBtn onClick={startVoting} bg={PINK} size="xl">
              🗳️ وقت التصويت!
            </BrutalBtn>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <motion.div
              className="flex gap-1 justify-center mb-3"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ background: BLUE, border: "2px solid #000", animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </motion.div>
            <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>
              القاضي بيستمع... استنّى لحد ما يبدأ التصويت
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Screen: Voting ──────────────────────────────────────────── */
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5" dir="rtl">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-8xl"
        >
          🤔
        </motion.div>
        <h2
          className="text-4xl text-center"
          style={{ fontFamily: "Lalezar", color: BLUE, textShadow: "3px 3px 0 #000" }}
        >
          القاضي بيفكر...
        </h2>
        <div
          className="w-full max-w-sm rounded-2xl py-4 px-5 text-center"
          style={{ background: WHITE, border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
        >
          <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>
            مين هيختار؟ 😬
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
        className="text-center mb-2"
      >
        <h2
          className="text-4xl"
          style={{ fontFamily: "Lalezar", color: PINK, textShadow: "3px 3px 0 #000" }}
        >
          مين صاحب عين العقل؟
        </h2>
        <p className="text-sm font-bold mt-1 opacity-60" style={{ fontFamily: "Cairo" }}>
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
              boxShadow: voted === player.id ? "4px 4px 0 #000" : "6px 6px 0 #000",
              transform: voted === player.id ? "translate(2px, 2px)" : "",
              transition: "all 80ms ease",
              cursor: voted ? "default" : "pointer",
              opacity: voted && voted !== player.id ? 0.5 : 1,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: avatarColors[i % avatarColors.length],
                border: "4px solid #000",
                fontFamily: "Lalezar",
                fontSize: "1.8rem",
              }}
            >
              {player.name.charAt(0)}
            </div>
            <span className="text-2xl flex-1" style={{ fontFamily: "Lalezar" }}>
              {player.name}
            </span>
            {voted === player.id && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-2xl"
              >
                ✅
              </motion.span>
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

  const { judgeGuessedRight, truthTellerName, votedForName, truthTellerId, votedForId } =
    gameState.lastRoundResult;

  const isJudge = myPlayerId === gameState.currentJudgeId;
  const isHost  = myPlayerId === gameState.hostPlayerId;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5" dir="rtl">
      {/* Big result stamp */}
      <motion.div
        className="w-full max-w-sm rounded-3xl py-7 px-5 text-center"
        style={{
          background: judgeGuessedRight ? GREEN : RED,
          border: "4px solid #000",
          boxShadow: "10px 10px 0 #000",
        }}
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 14 }}
      >
        <motion.div
          className="text-7xl mb-3"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {judgeGuessedRight ? "🎯" : "😂"}
        </motion.div>
        <h2
          className="text-4xl text-white"
          style={{ fontFamily: "Lalezar", textShadow: "3px 3px 0 #000" }}
        >
          {judgeGuessedRight ? "القاضي أصابها!" : "القاضي اتخدع!"}
        </h2>
      </motion.div>

      {/* Reveal box */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 18 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ border: "4px solid #000", boxShadow: "8px 8px 0 #000" }}
      >
        <div
          className="py-3 px-5 text-center"
          style={{ background: "#f0f0f0", borderBottom: "4px solid #000" }}
        >
          <p className="text-sm font-bold" style={{ fontFamily: "Cairo" }}>
            صاحب عين العقل الحقيقي كان...
          </p>
        </div>
        <div className="bg-white py-5 px-5 text-center">
          <p
            className="text-4xl"
            style={{ fontFamily: "Lalezar", color: PINK, textShadow: "2px 2px 0 #000" }}
          >
            {truthTellerName}
          </p>
          {!judgeGuessedRight && (
            <p className="text-sm mt-2 font-bold opacity-60" style={{ fontFamily: "Cairo" }}>
              القاضي صوّت على: {votedForName}
            </p>
          )}
        </div>
      </motion.div>

      {/* Diamonds earned */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="w-full max-w-sm space-y-3"
      >
        {judgeGuessedRight ? (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 280 }}
            className="rounded-2xl py-4 px-5 flex items-center gap-3"
            style={{ background: YELLOW, border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}
          >
            <span className="text-3xl">💎</span>
            <span className="font-bold text-base" style={{ fontFamily: "Cairo" }}>
              القاضي كسب الماسة!
            </span>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 280 }}
              className="rounded-2xl py-4 px-5 flex items-center gap-3"
              style={{ background: GREEN, border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}
            >
              <span className="text-3xl">💎</span>
              <span className="font-bold text-sm" style={{ fontFamily: "Cairo" }}>
                عين العقل ({truthTellerName}) كسب ماسة!
              </span>
            </motion.div>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 280 }}
              className="rounded-2xl py-4 px-5 flex items-center gap-3"
              style={{ background: PINK, border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}
            >
              <span className="text-3xl">💎</span>
              <span className="font-bold text-sm text-white" style={{ fontFamily: "Cairo" }}>
                المخادع ({votedForName}) كسب ماسة!
              </span>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Next round */}
      {(isJudge || isHost) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="w-full max-w-sm"
        >
          <BrutalBtn onClick={nextRound} bg={BLUE} size="xl">
            🔄 الجولة الجاية!
          </BrutalBtn>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Root Room component ─────────────────────────────────────── */
export default function Room() {
  const [match, params] = useRoute("/room/:code");
  const [, setLocation] = useLocation();
  const { gameState, myPlayerId, joinRoom, error } = useSocket();
  const joinedRef = useRef(false);
  const [playerName, setPlayerName] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("name") || localStorage.getItem("date-judge-player-name") || "";
  });

  const roomCode = params?.code?.toUpperCase() || "";

  const handleJoinRoom = () => {
    const trimmedName = playerName.trim();
    if (!match || !roomCode || !trimmedName) return;

    localStorage.setItem("date-judge-player-name", trimmedName);
    joinRoom(roomCode, trimmedName);
    joinedRef.current = true;
  };

  useEffect(() => {
    if (!match || joinedRef.current) return;
    if (!roomCode || !playerName.trim()) return;

    const searchParams = new URLSearchParams(window.location.search);
    const nameFromUrl = searchParams.get("name");
    if (nameFromUrl) {
      localStorage.setItem("date-judge-player-name", playerName.trim());
    }

    if (roomCode) {
      joinRoom(roomCode, playerName.trim());
      joinedRef.current = true;
    }
  }, [match, roomCode, playerName, joinRoom]);

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
              كود الغرفة ظاهر، بس لسه محتاج اسمك
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
                  if (e.key === "Enter" && playerName.trim()) handleJoinRoom();
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

            <BrutalBtn onClick={handleJoinRoom} disabled={!playerName.trim()} bg={GREEN} color={BLACK} size="xl">
              🚪 ادخل الروم
            </BrutalBtn>
          </div>
        </motion.div>
      </div>
    );
  }

  /* Loading spinner */
  if (!gameState && !error) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center gap-4"
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

  /* Error state */
  if (error) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center p-5 gap-5"
        style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-7xl"
        >
          😱
        </motion.div>
        <div
          className="card-brutal w-full max-w-sm py-5 px-5 text-center"
          style={{ background: RED, color: WHITE }}
        >
          <p className="text-xl font-bold" style={{ fontFamily: "Lalezar", textShadow: "1px 1px 0 #000" }}>
            {error}
          </p>
        </div>
        <BrutalBtn onClick={() => setLocation("/")} bg={WHITE} color={BLACK} size="lg">
          🏠 الرجوع للبداية
        </BrutalBtn>
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
      {/* Scoreboard + Round badge */}
      {gameState && <Scoreboard players={gameState.players} />}
      {phase !== "lobby" && <RoundBadge round={gameState!.roundNumber} />}

      <AnimatePresence mode="wait">
        {phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <LobbyScreen />
          </motion.div>
        )}
        {phase === "card-display" && isJudge && (
          <motion.div key="judge-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <JudgeCardDisplay />
          </motion.div>
        )}
        {phase === "card-display" && !isJudge && (
          <motion.div key="player-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <PlayerCardDisplay />
          </motion.div>
        )}
        {phase === "verbal" && (
          <motion.div key="verbal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <VerbalPhase />
          </motion.div>
        )}
        {phase === "voting" && (
          <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <VotingScreen />
          </motion.div>
        )}
        {phase === "scoring" && (
          <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <ScoringScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
