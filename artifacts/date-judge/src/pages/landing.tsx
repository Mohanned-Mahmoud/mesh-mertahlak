import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import type { Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 350, damping: 18 } },
};

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      dir="rtl"
      style={{ background: "linear-gradient(160deg, #FFE500 0%, #FF9500 100%)" }}
    >
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-10 overflow-hidden">
        {/* Background blobs */}
        <motion.div
          className="absolute -top-20 -right-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
          style={{ background: "hsl(330,100%,50%)", border: "4px solid #000" }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, 18, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 -left-20 w-80 h-80 rounded-full opacity-30 pointer-events-none"
          style={{ background: "hsl(218,100%,55%)", border: "4px solid #000" }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 -left-8 w-36 h-36 rounded-full opacity-25 pointer-events-none"
          style={{ background: "hsl(152,100%,40%)", border: "4px solid #000" }}
          animate={{ scale: [1, 1.22, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center gap-5 max-w-2xl w-full"
        >
          {/* Stolen badge */}
          <motion.div
            variants={pop}
            className="px-5 py-2 rounded-full text-sm font-bold"
            style={{
              fontFamily: "Cairo",
              background: "#000",
              color: "#FFE500",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 hsl(330,100%,50%)",
            }}
          >
            🥸 مستوحاة بشكل فاحش من مش مرتاحلك
          </motion.div>

          {/* Strikethrough name + real name */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-1">
            <div style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  fontFamily: "Lalezar",
                  fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
                  color: "#000",
                  opacity: 0.72,
                }}
              >
                مش مرتاحلك
              </span>
              {/* Animated SVG pen-stroke — angled, hand-drawn feel */}
              <svg
                viewBox="0 0 320 28"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  top: "38%",
                  left: "-4%",
                  width: "108%",
                  height: "auto",
                  pointerEvents: "none",
                  overflow: "visible",
                }}
              >
                {/* Shadow stroke for depth */}
                <motion.path
                  d="M 312 7 C 270 9, 210 11, 160 13 C 110 15, 60 16, 8 21"
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.55, ease: "easeOut" }}
                  style={{ translateX: 2, translateY: 2 }}
                />
                {/* Main red ink stroke */}
                <motion.path
                  d="M 312 7 C 270 9, 210 11, 160 13 C 110 15, 60 16, 8 21"
                  stroke="hsl(0,100%,50%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.55, duration: 0.55, ease: "easeOut" }}
                />
                {/* Thin highlight to give ink texture */}
                <motion.path
                  d="M 312 6 C 270 8, 210 10, 160 12 C 110 14, 60 15, 8 20"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.85 }}
              style={{
                fontFamily: "Lalezar",
                fontSize: "clamp(2.2rem, 7.5vw, 4.5rem)",
                lineHeight: 1.15,
                color: "#000",
                textShadow: "4px 4px 0 rgba(0,0,0,0.15)",
                textAlign: "center",
              }}
            >
              مش مرتاحلك المضروبه
            </motion.h1>
          </motion.div>

          {/* Funny sub-headline */}
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "Cairo",
              fontWeight: 700,
              fontSize: "clamp(0.9rem, 3vw, 1.15rem)",
              color: "#000",
              opacity: 0.78,
              textAlign: "center",
              maxWidth: 560,
              lineHeight: 1.7,
            }}
          >
            أيوه إحنا سارقين فكرة &quot;مش مرتاحلك&quot; بالمللي،
            بس عملناها أونلاين وببلاش عشان إحنا غلابة.
          </motion.p>

          {/* Character image */}
          <motion.div variants={fadeUp}>
            <img
              src="/hero-character.gif"
              alt="قاضي البلح"
              draggable={false}
              style={{
                maxWidth: "clamp(180px, 45vw, 280px)",
              }}
            />
          </motion.div>

          {/* CTA Button */}
          <motion.button
            variants={pop}
            onClick={() => setLocation("/play")}
            whileHover={{ scale: 1.06, rotate: -1 }}
            whileTap={{ scale: 0.94 }}
            style={{
              fontFamily: "Lalezar",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              color: "#fff",
              background: "hsl(330,100%,50%)",
              border: "4px solid #000",
              boxShadow: "8px 8px 0 #000",
              padding: "0.75rem 2.5rem",
              borderRadius: "1rem",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            العبوا ببلاش دلوقتي! 🎮
          </motion.button>

          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "Cairo",
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "#000",
              opacity: 0.5,
            }}
          >
            تحتاج ٣ غلابة على الأقل للبدء
          </motion.p>
        </motion.div>
      </section>

      {/* ─── HOW TO PLAY ──────────────────────────────────────────── */}
      <section
        className="px-5 py-16"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="max-w-3xl mx-auto flex flex-col items-center gap-10"
        >
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "Lalezar",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              color: "#000",
              textShadow: "3px 3px 0 rgba(0,0,0,0.12)",
              textAlign: "center",
            }}
          >
            إزاي نهبد؟
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
            {/* Card 1 */}
            <motion.div
              variants={pop}
              whileHover={{ y: -6, rotate: -1 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center"
              style={{
                background: "hsl(218,100%,55%)",
                border: "4px solid #000",
                boxShadow: "6px 6px 0 #000",
                color: "#fff",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#fff", border: "3px solid #000" }}
              >
                <span style={{ fontSize: "1.8rem" }}>🏠</span>
              </div>
              <h3 style={{ fontFamily: "Lalezar", fontSize: "1.5rem" }}>لم الشلة</h3>
              <p style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: "0.88rem", opacity: 0.92, lineHeight: 1.6 }}>
                اعملوا روم وابعتوا اللينك لبعض، بدل ما تدفعوا فلوس في اللعبة الأصلية.
              </p>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ fontFamily: "Cairo", background: "#000", color: "hsl(218,100%,80%)" }}
              >
                الخطوة ١
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={pop}
              whileHover={{ y: -6, rotate: 1 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center"
              style={{
                background: "hsl(152,100%,40%)",
                border: "4px solid #000",
                boxShadow: "6px 6px 0 #000",
                color: "#fff",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#fff", border: "3px solid #000" }}
              >
                <span style={{ fontSize: "1.8rem" }}>🎭</span>
              </div>
              <h3 style={{ fontFamily: "Lalezar", fontSize: "1.5rem" }}>اكذب بقلب ميت</h3>
              <p style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: "0.88rem", opacity: 0.92, lineHeight: 1.6 }}>
                واحد بس اللي بيقول الإجابة الصح، والباقي بيهبدوا هبد السنين عشان يغفّلوا القاضي.
              </p>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ fontFamily: "Cairo", background: "#000", color: "hsl(152,100%,70%)" }}
              >
                الخطوة ٢
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={pop}
              whileHover={{ y: -6, rotate: -1 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center"
              style={{
                background: "hsl(0,100%,50%)",
                border: "4px solid #000",
                boxShadow: "6px 6px 0 #000",
                color: "#fff",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#fff", border: "3px solid #000" }}
              >
                <Scale size={28} color="#000" strokeWidth={2.5} />
              </div>
              <h3 style={{ fontFamily: "Lalezar", fontSize: "1.5rem" }}>القاضي يلبس العمة</h3>
              <p style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: "0.88rem", opacity: 0.92, lineHeight: 1.6 }}>
                لو القاضي معرفش يطلع صاحب عين العقل، يبقى قاضي ملهوش فيها و يستاهل يتسف عليه.
              </p>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ fontFamily: "Cairo", background: "#000", color: "hsl(0,100%,80%)" }}
              >
                الخطوة ٣
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── ORIGINAL GAME SHOUTOUT ───────────────────────────────── */}
      <section className="px-5 py-16 relative overflow-hidden">
        {/* Floating decorations */}
        <motion.div
          className="absolute top-6 left-6 opacity-25 pointer-events-none"
          animate={{ y: [0, -12, 0], rotate: [0, 14, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span style={{ fontSize: "2.6rem" }}>🃏</span>
        </motion.div>
        <motion.div
          className="absolute top-8 right-8 opacity-20 pointer-events-none"
          animate={{ y: [0, 10, 0], rotate: [0, -16, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <span style={{ fontSize: "2.4rem" }}>✨</span>
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <span style={{ fontSize: "2.2rem" }}>🎴</span>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto flex flex-col items-center gap-8"
        >
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "Lalezar",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              color: "#000",
              textShadow: "3px 3px 0 rgba(0,0,0,0.12)",
              textAlign: "center",
            }}
          >
            بس خلينا نكون صريحين...
          </motion.h2>

          {/* Main card */}
          <motion.div
            variants={pop}
            className="w-full rounded-2xl p-8 flex flex-col items-center gap-6"
            style={{
              background: "#fff",
              border: "4px solid #000",
              boxShadow: "8px 8px 0 #000",
            }}
          >
            <img
              src="/card-game.gif"
              alt="card game"
              draggable={false}
              style={{
                maxWidth: "clamp(160px, 40vw, 240px)",
                borderRadius: "1rem",
              }}
            />

            <h3
              style={{
                fontFamily: "Lalezar",
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                color: "#000",
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              اللعب بالكروت الحقيقية امتع بكتير
            </h3>

            <p
              style={{
                fontFamily: "Cairo",
                fontWeight: 700,
                fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                color: "#000",
                opacity: 0.75,
                textAlign: "center",
                lineHeight: 1.8,
                maxWidth: 480,
              }}
            >
              الأونلاين تمام للي معهمش فلوس زي حالاتنا، بس لما تكون الشلة موجودة فعلًا
              وعندك الكروت في إيدك، الجو بيبقى غير خالص.
              الضحك أعلى، التلاعب أوضح، والفضيحة أحلى.
            </p>

            {/* Divider */}
            <div style={{ width: "100%", height: 3, background: "#000", borderRadius: 2, opacity: 0.12 }} />

            <p
              style={{
                fontFamily: "Cairo",
                fontWeight: 800,
                fontSize: "1rem",
                color: "#000",
                textAlign: "center",
                opacity: 0.65,
              }}
            >
              لو عايز حابب تجرب الأصلية وتجيب نسخة الكروت 👇
            </p>

            {/* Buy link */}
            <motion.a
              href="https://2oolameme.com/products/mesh-mertahlak"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontFamily: "Lalezar",
                fontSize: "clamp(1.3rem, 4vw, 1.7rem)",
                color: "#fff",
                background: "hsl(218,100%,55%)",
                border: "4px solid #000",
                boxShadow: "6px 6px 0 #000",
                padding: "0.65rem 2rem",
                borderRadius: "0.9rem",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🛒 اشتري مش مرتاحلك الأصلية
            </motion.a>

            <p
              style={{
                fontFamily: "Cairo",
                fontWeight: 700,
                fontSize: "0.78rem",
                color: "#000",
                opacity: 0.4,
                textAlign: "center",
              }}
            >
              (إحنا مش بناخد عمولة، بس ضميرنا بيوجعنا شوية 😅)
            </p>
          </motion.div>

          {/* Final CTA */}
          <motion.button
            variants={pop}
            onClick={() => setLocation("/play")}
            whileHover={{ scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.93 }}
            style={{
              fontFamily: "Lalezar",
              fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
              color: "#fff",
              background: "hsl(330,100%,50%)",
              border: "4px solid #000",
              boxShadow: "8px 8px 0 #000",
              padding: "0.75rem 2.5rem",
              borderRadius: "1rem",
              cursor: "pointer",
            }}
          >
            يلا نهبد ببلاش! 
          </motion.button>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="px-5 py-8 flex flex-col items-center gap-2 text-center"
        style={{ borderTop: "4px solid #000", background: "rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <Scale size={20} strokeWidth={2.5} />
          <span style={{ fontFamily: "Lalezar", fontSize: "1.2rem" }}>مش مرتاحلك المضروبه</span>
        </div>
        <p style={{ fontFamily: "Cairo", fontWeight: 700, fontSize: "0.85rem", opacity: 0.65 }}>
          جميع الحقوق مسروقة من مش مرتاحلك بس متقولوش لحد 🤫
        </p>
      </footer>
    </div>
  );
}
