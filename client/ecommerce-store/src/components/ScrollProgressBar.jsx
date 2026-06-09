// frontend/src/components/ScrollProgressBar.jsx
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Version 1: Simple and reliable
export const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = (scrollTop / maxScroll) * 100;
      setScrollProgress(progress);
    };

    // Update on scroll
    window.addEventListener("scroll", updateScrollProgress);
    // Update on resize (in case content height changes)
    window.addEventListener("resize", updateScrollProgress);
    // Initial calculation
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

// Version 2: Animated with Framer Motion (smoother)
export const AnimatedScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};