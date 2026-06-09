// frontend/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Inline icons ─────────────────────────────────────────────────────────────
const CartIcon = ({ count }) => (
  <span className="relative inline-flex items-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 text-[10px] font-['DM_Sans'] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  </span>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Nav link with active underline ──────────────────────────────────────────
function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-['DM_Sans'] tracking-wide transition-colors duration-150 group ${
        active ? "text-stone-950" : "text-stone-500 hover:text-stone-950"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-0.5 left-0 h-px bg-stone-950 transition-all duration-200 ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

// ─── Admin dropdown ───────────────────────────────────────────────────────────
function AdminDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-['DM_Sans'] text-stone-500 hover:text-stone-950 transition-colors"
      >
        Admin
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 mt-3 w-48 bg-white border border-stone-200 shadow-lg z-50"
          >
            {[
              { to: "/admin",             label: "Dashboard" },
              { to: "/admin/add-product", label: "Add Product" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="block px-5 py-3 text-sm font-['DM_Sans'] text-stone-600 hover:bg-stone-50 hover:text-stone-950 transition-colors border-b border-stone-100 last:border-0"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const navigate                    = useNavigate();
  const [user, setUser]             = useState(null);
  const [cartCount, setCartCount]   = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  const { pathname } = useLocation();
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Load user + cart
  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((n, item) => n + (item.quantity || 0), 0));
    };

    loadUser();
    loadCart();

    const onCartUpdate  = loadCart;
    const onLogin       = loadUser;
    const onLogout      = () => { setUser(null); setCartCount(0); };
    const onStorage     = (e) => { if (e.key === "user") loadUser(); };

    window.addEventListener("cartUpdated",   onCartUpdate);
    window.addEventListener("userLoggedIn",  onLogin);
    window.addEventListener("userLoggedOut", onLogout);
    window.addEventListener("storage",       onStorage);

    return () => {
      window.removeEventListener("cartUpdated",   onCartUpdate);
      window.removeEventListener("userLoggedIn",  onLogin);
      window.removeEventListener("userLoggedOut", onLogout);
      window.removeEventListener("storage",       onStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("userLoggedOut"));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/login");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-40 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">

        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="font-['Bebas_Neue'] text-2xl tracking-widest text-stone-950 group-hover:text-amber-500 transition-colors duration-150">
            GEAR UP
          </span>
        </Link>

        {/* ── Desktop nav ────────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/products">Products</NavLink>

          {user && (
            <>
              <Link
                to="/cart"
                className="text-stone-500 hover:text-stone-950 transition-colors"
                aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
              >
                <CartIcon count={cartCount} />
              </Link>
              <NavLink to="/orders">Orders</NavLink>
            </>
          )}

          {user?.role === "admin" && <AdminDropdown />}
        </nav>

        {/* ── Auth / user ────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <span className="text-sm font-['DM_Sans'] text-stone-500">
                {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-['DM_Sans'] text-stone-400 hover:text-stone-950 transition-colors underline underline-offset-4"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-['DM_Sans'] text-stone-500 hover:text-stone-950 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-['DM_Sans'] font-medium bg-stone-950 text-white px-5 py-2 hover:bg-amber-400 hover:text-stone-950 transition-colors duration-150"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile: cart + burger ───────────────────────────────────────── */}
        <div className="flex items-center gap-5 md:hidden">
          {user && (
            <Link to="/cart" aria-label="Cart">
              <CartIcon count={cartCount} />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="text-stone-700 p-1"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <motion.div animate={{ rotate: mobileOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
                </svg>
              )}
            </motion.div>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-stone-200 bg-stone-50"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              <Link to="/products" className="text-sm font-['DM_Sans'] text-stone-700 hover:text-stone-950">
                Products
              </Link>

              {user ? (
                <>
                  <Link to="/orders" className="text-sm font-['DM_Sans'] text-stone-700 hover:text-stone-950">
                    My Orders
                  </Link>

                  {user.role === "admin" && (
                    <>
                      <Link to="/admin" className="text-sm font-['DM_Sans'] text-stone-700 hover:text-stone-950">
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/add-product" className="text-sm font-['DM_Sans'] text-stone-700 hover:text-stone-950">
                        Add Product
                      </Link>
                    </>
                  )}

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-sm font-['DM_Sans'] text-stone-400">{displayName}</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-['DM_Sans'] text-stone-400 hover:text-stone-950 underline underline-offset-4 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2 border-t border-stone-200">
                  <Link
                    to="/login"
                    className="text-sm font-['DM_Sans'] text-stone-700 hover:text-stone-950"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-['DM_Sans'] font-medium bg-stone-950 text-white px-5 py-2.5 text-center hover:bg-amber-400 hover:text-stone-950 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}