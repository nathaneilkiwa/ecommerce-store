// frontend/src/components/Products.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Inline SVG icons (no extra dep) ─────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-stone-200 aspect-square w-full mb-3" />
      <div className="bg-stone-200 h-4 w-3/4 mb-2" />
      <div className="bg-stone-200 h-4 w-1/3" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Products() {
  const [products, setProducts]           = useState([]);
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebounced]   = useState("");
  const [category, setCategory]           = useState("All");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const searchRef                         = useRef(null);
  const timerRef                          = useRef(null);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/products");
      setProducts(res.data?.products || res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Couldn't load products right now.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const categories = useMemo(() => [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ], [products]);

  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchCat    = category === "All" || p.category === category;
    return matchSearch && matchCat;
  }), [products, debouncedSearch, category]);

  const countFor = useCallback(
    (cat) => cat === "All" ? products.length : products.filter((p) => p.category === cat).length,
    [products]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebounced("");
    setCategory("All");
    searchRef.current?.focus();
  }, []);

  const hasActiveFilters = search || category !== "All";

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-10 border-b border-stone-200 pb-6">
          <div className="animate-pulse bg-stone-200 h-12 w-64 mb-2" />
          <div className="animate-pulse bg-stone-200 h-4 w-48" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 text-center">
        <p className="font-['Bebas_Neue'] text-6xl text-stone-300 mb-4">Oops</p>
        <p className="text-stone-600 font-['DM_Sans'] mb-8">{error}</p>
        <button
          onClick={fetchProducts}
          className="bg-stone-950 text-white px-7 py-3 text-sm font-['DM_Sans'] font-medium hover:bg-amber-400 hover:text-stone-950 transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Empty catalogue ──────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 text-center">
        <p className="font-['Bebas_Neue'] text-7xl text-stone-200 mb-4">Empty</p>
        <p className="text-stone-500 font-['DM_Sans']">No products yet — check back soon.</p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-stone-400 text-xs tracking-[0.2em] uppercase font-['DM_Sans'] mb-2">
              Gear Up
            </p>
            <h1 className="font-['Bebas_Neue'] text-6xl md:text-7xl text-stone-950 tracking-wide leading-none">
              All Products
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* ── Filters row ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm font-['DM_Sans'] bg-white border border-stone-200 focus:border-stone-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-stone-400 text-stone-900"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs font-['DM_Sans'] font-medium tracking-wide whitespace-nowrap transition-colors duration-150 ${
                  category === cat
                    ? "bg-stone-950 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-950 hover:text-stone-950"
                }`}
              >
                {cat}
                <span className={`ml-1.5 ${category === cat ? "text-stone-400" : "text-stone-400"}`}>
                  {countFor(cat)}
                </span>
              </button>
            ))}
          </div>

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                onClick={clearFilters}
                className="text-sm font-['DM_Sans'] text-stone-400 hover:text-stone-900 transition-colors underline underline-offset-4 whitespace-nowrap self-center"
              >
                Clear all
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results count ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs font-['DM_Sans'] text-stone-400 tracking-wide uppercase">
            {filtered.length === products.length
              ? `${products.length} products`
              : `${filtered.length} of ${products.length} products`}
          </span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          )}
        </div>

        {/* ── No results ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-stone-200 bg-white py-20 text-center"
            >
              <p className="font-['Bebas_Neue'] text-6xl text-stone-200 mb-3">Nothing here</p>
              <p className="text-stone-500 font-['DM_Sans'] text-sm mb-6">
                No products match that filter — try something else.
              </p>
              <button
                onClick={clearFilters}
                className="bg-stone-950 text-white px-6 py-2.5 text-sm font-['DM_Sans'] font-medium hover:bg-amber-400 hover:text-stone-950 transition-colors duration-200"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            // ── Products grid ──────────────────────────────────────────
            <motion.div
              key="grid"
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
            >
              {filtered.map((product) => (
                <motion.div key={product._id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}