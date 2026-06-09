// frontend/src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Helmet } from "react-helmet-async";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import { ScrollProgressBar } from "../components/ScrollProgressBar";

// ─── Smooth scroll-linked progress bar ───────────────────────────────────────
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-stone-900 z-50"
    />
  );
}

// ─── Stagger container helper ────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Category card ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Yoga & Pilates",       slug: "Yoga & Pilates",       icon: "🧘", desc: "Mats, blocks & more" },
  { label: "Fitness Accessories",  slug: "Fitness Accessories",  icon: "💪", desc: "Bands, ropes & essentials" },
  { label: "Weight Training",      slug: "Weight Training",      icon: "🏋️", desc: "Dumbbells, bars & plates" },
];

// ─── Main component ──────────────────────────────────────────────────────────
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parallax on hero image
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 160]);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/products?limit=8");
        setFeaturedProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gear Up — Premium Fitness Equipment</title>
        <meta name="description" content="Quality fitness equipment for your home gym" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Scroll progress line */}
      <ProgressBar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[640px] overflow-hidden bg-stone-950 flex items-end"
      >
        {/* Parallax background */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 scale-110"
        >
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
        </motion.div>

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              className="text-stone-400 text-sm tracking-[0.2em] uppercase mb-6 font-['DM_Sans']"
            >
              Home Gym Essentials
            </motion.p>

            {/* Headline — editorial serif-meets-display */}
            <motion.h1
              variants={fadeUp}
              className="font-['Bebas_Neue'] text-[clamp(4rem,12vw,9rem)] leading-[0.92] tracking-wide text-white mb-8"
            >
              Every Rep.
              <br />
              <span className="text-amber-400">Every Goal.</span>
              <br />
              Every Day.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-stone-300 text-lg font-['DM_Sans'] font-light max-w-md mb-10 leading-relaxed"
            >
              We stock the gear serious athletes actually use — built to last,
              priced to make sense.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-stone-950 px-7 py-3.5 text-sm font-['DM_Sans'] font-medium tracking-wide hover:bg-amber-400 transition-colors duration-200"
              >
                Shop the range
                <span className="text-base">→</span>
              </Link>
              <Link
                to="/products?category=new"
                className="text-stone-400 text-sm font-['DM_Sans'] underline underline-offset-4 hover:text-white transition-colors"
              >
                What's new
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

    
      {/* ── BEST SELLERS ─────────────────────────────────────────────────────── */}
      <section className="bg-stone-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Section header */}
          <div className="flex items-end justify-between mb-12 border-b border-stone-200 pb-6">
            <div>
              <p className="text-stone-400 text-xs tracking-[0.2em] uppercase font-['DM_Sans'] mb-2">
                Most loved
              </p>
              <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl text-stone-950 tracking-wide">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-1 text-sm font-['DM_Sans'] text-stone-500 hover:text-stone-950 transition-colors group"
            >
              View all
              <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>

          {/* Product grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {featuredProducts.slice(0, 4).map((product) => (
              <motion.div key={product._id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/products"
              className="text-sm font-['DM_Sans'] text-stone-500 underline underline-offset-4"
            >
              View all products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ──────────────────────────────────────────────────────── */}
      <section className="bg-stone-950 py-20 md:py-28 relative overflow-hidden">
        {/* Decorative number watermark */}
        <span
          className="absolute right-8 top-8 font-['Bebas_Neue'] text-[180px] text-white opacity-[0.03] select-none pointer-events-none leading-none"
          aria-hidden
        >
          03
        </span>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="mb-12">
            <p className="text-stone-500 text-xs tracking-[0.2em] uppercase font-['DM_Sans'] mb-2">
              Browse by category
            </p>
            <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl text-white tracking-wide">
              Shop the Collection
            </h2>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 gap-4"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeUp}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group relative flex flex-col justify-between h-56 p-7 border border-stone-800 hover:border-amber-400 transition-colors duration-300 overflow-hidden"
                >
                  {/* Hover fill */}
                  <div className="absolute inset-0 bg-amber-400 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />

                  <span className="relative text-4xl">{cat.icon}</span>

                  <div className="relative">
                    <p className="text-stone-500 text-xs font-['DM_Sans'] group-hover:text-stone-700 transition-colors mb-1">
                      {cat.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <h3 className="font-['Bebas_Neue'] text-2xl text-white group-hover:text-stone-950 tracking-wide transition-colors">
                        {cat.label}
                      </h3>
                      <span className="text-stone-600 group-hover:text-stone-950 group-hover:translate-x-1 transition-all duration-200">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BRAND STATEMENT ──────────────────────────────────────────────────── */}
      <section className="bg-stone-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="border border-stone-200 p-10 md:p-16 flex flex-col md:flex-row md:items-center gap-10 md:gap-20"
          >
            <div className="md:w-1/2">
              <p className="text-stone-400 text-xs tracking-[0.2em] uppercase font-['DM_Sans'] mb-4">
                Why Gear Up
              </p>
              <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl text-stone-950 tracking-wide leading-none">
                Built for the
                <br />
                Long Haul
              </h2>
            </div>
            <div className="md:w-1/2 space-y-6">
              <p className="text-stone-600 font-['DM_Sans'] font-light leading-relaxed text-lg">
                Whether you're setting up your first home gym or upgrading what you
                already have, we carry the equipment that won't quit when things get
                heavy.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-stone-950 text-white px-7 py-3.5 text-sm font-['DM_Sans'] font-medium hover:bg-amber-400 hover:text-stone-950 transition-colors duration-200"
              >
                Shop everything →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}