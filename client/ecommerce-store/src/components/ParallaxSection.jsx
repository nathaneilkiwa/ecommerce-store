// frontend/src/components/ParallaxSection.jsx
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// ─── Shared spring config ─────────────────────────────────────────────────────
// Tight spring = responsive but never jittery
const SPRING = { stiffness: 80, damping: 20, mass: 0.4 };

// ─── ParallaxSection ──────────────────────────────────────────────────────────
// Translates the entire section's children on scroll.
// speed: 0 = no movement, 1 = moves at scroll speed.
// direction: "up" (content rises as you scroll) or "down" (sinks).
//
// Usage:
//   <ParallaxSection speed={0.15}>
//     <YourContent />
//   </ParallaxSection>
//
export const ParallaxSection = ({
  children,
  speed = 0.15,
  direction = "up",
  className = "",
}) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = 120 * speed;
  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [range, -range] : [-range, range]
  );
  const y = useSpring(raw, SPRING);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

// ─── ParallaxBackground ───────────────────────────────────────────────────────
// Fixed-height container with a parallaxing background image.
// The image is oversized vertically to prevent gaps at extremes.
//
// Usage:
//   <ParallaxBackground
//     imageUrl="https://..."
//     height="600px"
//     speed={0.25}
//   >
//     <div className="h-full flex items-center ...">overlay content</div>
//   </ParallaxBackground>
//
export const ParallaxBackground = ({
  imageUrl,
  children,
  speed = 0.25,
  height = "500px",
  overlay = true,
  overlayOpacity = 0.5,
  className = "",
}) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = 160 * speed;
  const raw = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const y   = useSpring(raw, SPRING);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Parallax image layer — oversized so movement never reveals edges */}
      <motion.div
        aria-hidden
        style={{ y }}
        className="absolute inset-x-0 -top-16 -bottom-16"
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* Optional scrim */}
      {overlay && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      {/* Foreground content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// ─── ParallaxFloat ────────────────────────────────────────────────────────────
// Wraps a single element and gives it a floating parallax offset.
// Use inside a section to make individual elements drift at different rates.
//
// Usage:
//   <section className="relative">
//     <ParallaxFloat speed={0.08}>
//       <img src="..." />
//     </ParallaxFloat>
//     <ParallaxFloat speed={0.2}>
//       <h2>Headline</h2>
//     </ParallaxFloat>
//   </section>
//
export const ParallaxFloat = ({
  children,
  speed = 0.1,
  direction = "up",
  className = "",
}) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = 80 * speed;
  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [range, -range] : [-range, range]
  );
  const y = useSpring(raw, SPRING);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

// ─── ParallaxReveal ───────────────────────────────────────────────────────────
// Combines a parallax entrance with a fade-up reveal as the element
// enters the viewport. Good for text blocks and feature cards.
//
// Usage:
//   <ParallaxReveal>
//     <p>This fades up as you scroll to it</p>
//   </ParallaxReveal>
//
export const ParallaxReveal = ({
  children,
  speed = 0.08,
  className = "",
  delay = 0,
}) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.35"],
  });

  const rawY       = useTransform(scrollYProgress, [0, 1], [40 * speed * 10, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y          = useSpring(rawY, SPRING);
  const opacity    = useSpring(rawOpacity, { stiffness: 60, damping: 18 });

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};