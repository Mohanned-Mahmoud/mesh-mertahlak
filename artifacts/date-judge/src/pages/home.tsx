import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"main" | "create" | "join">("main");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    const code = generateRoomCode();
    setLocation(`/room/${code}?name=${encodeURIComponent(playerName.trim())}&action=create`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || roomCode.length !== 4) return;
    setLocation(`/room/${roomCode.toUpperCase()}?name=${encodeURIComponent(playerName.trim())}&action=join`);
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-5 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #FFE500 0%, #FF9500 100%)" }}
    >
      {/* Decorative blobs */}
      <motion.div
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-40 pointer-events-none"
        style={{ background: "hsl(330,100%,50%)", border: "4px solid #000" }}
        animate={{ scale: [1, 1.12, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full opacity-35 pointer-events-none"
        style={{ background: "hsl(218,100%,55%)", border: "4px solid #000" }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/4 -left-10 w-32 h-32 rounded-full opacity-30 pointer-events-none"
        style={{ background: "hsl(152,100%,45%)", border: "4px solid #000" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Main card */}
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="card-brutal w-full max-w-sm relative z-10 overflow-hidden"
        style={{ padding: 0 }}
      >
        {/* Header strip */}
        <div
          className="w-full text-center py-6 px-5"
          style={{ background: "hsl(330,100%,50%)", borderBottom: "4px solid #000" }}
        >
          <motion.h1
            className="text-5xl text-white"
            style={{ fontFamily: "Lalezar", textShadow: "3px 3px 0 #000", lineHeight: 1.2 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            قاضي البلح
          </motion.h1>
          <p
            className="text-white text-base mt-1 font-bold"
            style={{ fontFamily: "Cairo", opacity: 0.9, textShadow: "1px 1px 0 #000" }}
          >
            The Date Judge
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {view === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    className="text-base font-bold block"
                    style={{ fontFamily: "Cairo" }}
                  >
                    اسمك
                  </label>
                  <input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && playerName.trim()) setView("create"); }}
                    placeholder="ادخل اسمك هنا..."
                    className="w-full h-14 px-4 rounded-2xl text-base font-bold outline-none"
                    style={{
                      fontFamily: "Cairo",
                      border: "4px solid #000",
                      boxShadow: "4px 4px 0 #000",
                      background: "white",
                      textAlign: "right",
                    }}
                  />
                </div>

                <button
                  onClick={() => playerName.trim() && setView("create")}
                  disabled={!playerName.trim()}
                  className="btn-brutal w-full py-4 text-white"
                  style={{ background: "hsl(330,100%,50%)", fontSize: "1.4rem" }}
                >
                  إنشاء غرفة جديدة
                </button>

                <button
                  onClick={() => playerName.trim() && setView("join")}
                  disabled={!playerName.trim()}
                  className="btn-brutal w-full py-4 text-white"
                  style={{ background: "hsl(218,100%,55%)", fontSize: "1.4rem" }}
                >
                  انضم لغرفة
                </button>

                <p
                  className="text-center text-xs opacity-60 pt-1 font-bold"
                  style={{ fontFamily: "Cairo" }}
                >
                  تحتاج ٣ لاعبين على الأقل للبدء
                </p>
              </motion.div>
            )}

            {view === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "hsl(152,100%,45%)", border: "4px solid #000", boxShadow: "4px 4px 0 #000" }}
                >
                  <p className="text-sm font-bold mb-1" style={{ fontFamily: "Cairo" }}>
                    هتنشئ غرفة جديدة باسم
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: "Lalezar" }}>
                    {playerName}
                  </p>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="btn-brutal w-full py-4 text-white"
                  style={{ background: "hsl(330,100%,50%)", fontSize: "1.4rem" }}
                >
                  ابدأ الغرفة
                </button>

                <button
                  onClick={() => setView("main")}
                  className="btn-brutal w-full py-3 text-black"
                  style={{ background: "white", fontSize: "1.15rem" }}
                >
                  رجوع
                </button>
              </motion.div>
            )}

            {view === "join" && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    className="text-base font-bold block"
                    style={{ fontFamily: "Cairo" }}
                  >
                    كود الغرفة
                  </label>
                  <input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter" && roomCode.length === 4) handleJoinRoom(); }}
                    placeholder="ABCD"
                    maxLength={4}
                    className="w-full h-16 px-4 rounded-2xl text-3xl font-bold outline-none text-center tracking-[0.35em]"
                    style={{
                      fontFamily: "Lalezar",
                      border: "4px solid #000",
                      boxShadow: "4px 4px 0 #000",
                      background: "white",
                    }}
                  />
                  <p className="text-xs font-bold opacity-50 text-center" style={{ fontFamily: "Cairo" }}>
                    {roomCode.length}/4 حروف
                  </p>
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || roomCode.length !== 4}
                  className="btn-brutal w-full py-4 text-white"
                  style={{ background: "hsl(218,100%,55%)", fontSize: "1.4rem" }}
                >
                  انضم للعبة
                </button>

                <button
                  onClick={() => setView("main")}
                  className="btn-brutal w-full py-3 text-black"
                  style={{ background: "white", fontSize: "1.15rem" }}
                >
                  رجوع
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
