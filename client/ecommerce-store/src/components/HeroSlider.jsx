// frontend/src/components/HeroSlider.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Slide data ───────────────────────────────────────────────────────────────
// Replace images with your own Unsplash/CDN URLs
const SLIDES = [
  {
    id: 1,
    eyebrow: "Limited time",
    title: "Summer\nSale.",
    subtitle: "Up to 50% off selected gear — no code needed.",
    cta: "Shop the sale",
    link: "/products?sale=true",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80",
    accent: "text-amber-400",
  },
  {
    id: 2,
    eyebrow: "Just landed",
    title: "New\nArrivals.",
    subtitle: "Fresh equipment added every week — be first.",
    cta: "See what's new",
    link: "/products?sort=newest",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
    accent: "text-white",
  },
  {
    id: 3,
    eyebrow: "Build your setup",
    title: "Home\nGym Kit.",
    subtitle: "Everything you need. Nothing you don't.",
    cta: "Shop the range",
    link: "/products?category=Weight+Training",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80",
    accent: "text-amber-400",
  },
];

const AUTOPLAY_MS = 5500;

// ─── Slide transition variants ────────────────────────────────────────────────
const imageVariants = {
  enter: { opacity: 0, scale: 1.04 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: "easeIn" } },
};

const contentVariants = {
  enter: { opacity: 0, y: 28 },
  center: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.2 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

// ─── Arrow button ─────────────────────────────────────────────────────────────
function Arrow({ direction, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      className="group w-11 h-11 border border-white/20 hover:border-white/60 flex items-center justify-center transition-colors duration-200"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-white/60 group-hover:text-white transition-colors ${direction === "prev" ? "rotate-180" : ""}`}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HeroSlider() {
  const [index, setIndex]       = useState(0);
  const [paused, setPaused]     = useState(false);
  const timerRef                = useRef(null);

  const goTo = useCallback((i) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, next]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const slide = SLIDES[index];

  // Progress (0→1 over AUTOPLAY_MS)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = performance.now();
    let raf;
    const tick = (now) => {
      setProgress(Math.min((now - start) / AUTOPLAY_MS, 1));
      if (now - start < AUTOPLAY_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused]);

  return (
    <div
      className="relative h-[92vh] min-h-[560px] max-h-[820px] overflow-hidden bg-stone-950 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image ──────────────────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${slide.id}`}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Multi-layer scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Slide content ─────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex items-end md:items-center">
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide.id}`}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-xl"
            >
              {/* Eyebrow */}
              <p className="text-xs font-['DM_Sans'] tracking-[0.22em] uppercase text-stone-400 mb-5">
                {slide.eyebrow}
              </p>

              {/* Headline */}
              <h2 className={`font-['Bebas_Neue'] text-[clamp(4rem,10vw,8rem)] leading-[0.9] tracking-wide text-white mb-6 whitespace-pre-line`}>
                {slide.title.split("\n").map((line, i) => (
                  <span key={i} className={i === 1 ? slide.accent : ""}>
                    {line}
                    {i === 0 && "\n"}
                  </span>
                ))}
              </h2>

              {/* Subtitle */}
              <p className="text-stone-300 font-['DM_Sans'] font-light text-lg leading-relaxed mb-10 max-w-sm">
                {slide.subtitle}
              </p>

              {/* CTA */}
              <Link
                to={slide.link}
                className="inline-flex items-center gap-2 bg-white text-stone-950 px-7 py-3.5 text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-amber-400 transition-colors duration-200"
              >
                {slide.cta}
                <span>→</span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 z-10 flex items-center justify-between">

        {/* Slide counter + progress */}
        <div className="flex items-center gap-6">
          <span className="font-['Bebas_Neue'] text-white/40 text-sm tracking-widest tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>

          {/* Progress bar */}
          <div className="w-24 h-px bg-white/20 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-amber-400 transition-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <Arrow direction="prev" onClick={prev} />
          <Arrow direction="next" onClick={next} />
        </div>
      </div>

      {/* ── Dot indicators ────────────────────────────────────────────── */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 hidden md:flex">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`block transition-all duration-300 rounded-full ${
              i === index
                ? "w-1.5 h-6 bg-amber-400"
                : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}