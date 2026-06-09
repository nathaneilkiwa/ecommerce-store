// frontend/src/components/ScrollAnimations.jsx
import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

// ─── Shared easing ────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1]; // expo out — fast settle, no bounce

// ─── FadeIn ───────────────────────────────────────────────────────────────────
// Fades + slides a single element into view once it enters the viewport.
//
// Props:
//   direction  "up" | "down" | "left" | "right"  (default "up")
//   delay      seconds before animation starts    (default 0)
//   distance   how far the element travels in px  (default 28)
//   amount     how much of element must be visible (default 0.25)
//   as         rendered HTML tag                  (default "div")
//
// Usage:
//   <FadeIn direction="up" delay={0.1}>
//     <p>Appears when scrolled into view</p>
//   </FadeIn>
//
const DIRECTION_MAP = {
  up:    { y: 1 },
  down:  { y: -1 },
  left:  { x: 1 },
  right: { x: -1 },
};

export const FadeIn = ({
  children,
  direction = "up",
  delay = 0,
  distance = 28,
  amount = 0.25,
  as: Tag = "div",
  className = "",
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount });

  const axis   = DIRECTION_MAP[direction] ?? { y: 1 };
  const hidden  = { opacity: 0, ...Object.fromEntries(Object.entries(axis).map(([k, v]) => [k, v * distance])) };
  const visible = { opacity: 1, x: 0, y: 0 };

  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden, visible }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

// ─── FadeInWhenVisible ────────────────────────────────────────────────────────
// Legacy-compatible alias — keeps existing call sites working.
export const FadeInWhenVisible = FadeIn;

// ─── StaggerContainer + StaggerItem ──────────────────────────────────────────
// Parent controls timing; each StaggerItem inherits the stagger.
// Using explicit variants on children is more reliable than
// staggerChildren alone when items are conditionally rendered.
//
// Usage:
//   <StaggerContainer stagger={0.08}>
//     <StaggerItem><Card /></StaggerItem>
//     <StaggerItem><Card /></StaggerItem>
//   </StaggerContainer>
//
const staggerContainer = (stagger) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: 0 } },
});

const staggerItem = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: EASE } },
};

export const StaggerContainer = ({
  children,
  stagger = 0.08,
  // legacy prop name
  delayChildren,
  amount = 0.15,
  className = "",
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount }}
    variants={staggerContainer(delayChildren ?? stagger)}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = "" }) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);

// ─── ScrollProgressBar ────────────────────────────────────────────────────────
// 2px line at the top of the viewport tracking page scroll progress.
// Uses useSpring for a smooth, physical feel rather than a CSS transition.
// Matches the stone/amber design system.
//
// Usage:
//   <ScrollProgressBar />   ← drop anywhere in your layout, renders fixed
//
export const ScrollProgressBar = ({ color = "#FBBF24" }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.5 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left", backgroundColor: color }}
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
    />
  );
};

// ─── CountUp ─────────────────────────────────────────────────────────────────
// Animates a number from 0 to `value` when it enters the viewport.
// Good for stats sections ("10,000+ customers").
//
// Usage:
//   <CountUp value={10000} suffix="+" duration={1.8} />
//
export const CountUp = ({
  value,
  duration = 1.5,
  suffix = "",
  prefix = "",
  className = "",
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const count = useSpring(0, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.5,
  });

  // Kick off the count when in view
  if (inView) count.set(value);

  const display = useTransform(count, (v) =>
    `${prefix}${Math.round(v).toLocaleString()}${suffix}`
  );

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
};

// ─── ScaleIn ─────────────────────────────────────────────────────────────────
// Scales up from a slightly smaller size on enter.
// Good for cards, images, icons.
//
// Usage:
//   <ScaleIn delay={0.2}><img src="..." /></ScaleIn>
//
export const ScaleIn = ({
  children,
  delay = 0,
  from = 0.88,
  amount = 0.2,
  className = "",
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: from }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── scrollToElement ──────────────────────────────────────────────────────────
// Utility: smooth-scroll to any element by id, respecting a sticky
// navbar offset. Works with both modern and older browsers.
//
// Usage:
//   scrollToElement("pricing", 72)
//   <button onClick={() => scrollToElement("contact")}>Contact</button>
//
export const scrollToElement = (elementId, offset = 80) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
};