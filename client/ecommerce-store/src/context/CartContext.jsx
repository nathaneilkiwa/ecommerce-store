// frontend/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const CartContext = createContext();

// Constants
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;

// Error messages
const ERROR_MESSAGES = {
  USE_CART: "useCart must be used within a CartProvider",
  FETCH_CART: "Failed to load cart from server",
  SYNC_CART: "Failed to sync cart with server",
  CHECKOUT: "Checkout failed. Please try again.",
  LOGIN_REQUIRED: "Please login to checkout",
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.USE_CART);
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // State
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  
  // Refs
  const isMounted = useRef(true);
  const syncInProgress = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper: Calculate shipping cost
  const calculateShippingCost = useCallback((total) => {
    return total > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  }, []);

  // Calculate totals from cart items
  const calculateTotals = useCallback((items) => {
    const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const total = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    
    setCartCount(count);
    setSubtotal(total);
    setShipping(calculateShippingCost(total));
    
    return { count, total };
  }, [calculateShippingCost]);

  // Helper: Get current user
  const getCurrentUser = useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }, []);

  // Load cart from localStorage or backend
  const loadCart = useCallback(async () => {
    const user = getCurrentUser();
    
    if (user) {
      // Logged in: fetch from backend
      if (!isMounted.current) return;
      
      setLoading(true);
      try {
        const response = await API.get("/cart");
        const cartData = response.data?.items || [];
        
        if (isMounted.current) {
          setCartItems(cartData);
          calculateTotals(cartData);
          
          // Sync to localStorage as backup
          localStorage.setItem("cart", JSON.stringify(cartData));
        }
      } catch (error) {
        console.error(ERROR_MESSAGES.FETCH_CART, error);
        
        // Fallback to localStorage
        if (isMounted.current) {
          const localCart = loadCartFromLocalStorage();
          setCartItems(localCart);
          calculateTotals(localCart);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    } else {
      // Guest: load from localStorage
      const localCart = loadCartFromLocalStorage();
      if (isMounted.current) {
        setCartItems(localCart);
        calculateTotals(localCart);
      }
    }
    
    if (isMounted.current) {
      setIsInitialized(true);
    }
  }, [calculateTotals, getCurrentUser]);

  // Helper: Load cart from localStorage
  const loadCartFromLocalStorage = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  }, []);

  // Sync cart to localStorage and backend
  const syncCart = useCallback(async (items) => {
    // Prevent concurrent sync operations
    if (syncInProgress.current) return;
    
    syncInProgress.current = true;
    
    try {
      // Always save to localStorage
      localStorage.setItem("cart", JSON.stringify(items));
      
      // If logged in, sync to backend
      const user = getCurrentUser();
      if (user && items.length > 0) {
        await API.post("/cart/sync", { items }).catch(error => {
          console.error(ERROR_MESSAGES.SYNC_CART, error);
        });
      }
    } finally {
      syncInProgress.current = false;
    }
  }, [getCurrentUser]);

  // Add item to cart
  const addToCart = useCallback(async (product, quantity = 1) => {
    const user = getCurrentUser();
    
    // Validate stock
    if (!product?.stock || product.stock < quantity) {
      const availableStock = product?.stock || 0;
      toast.error(`Only ${availableStock} items available!`);
      return false;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      let newItems;
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.stock) {
          toast.error(`Cannot add more than ${product.stock} items!`);
          return prevItems;
        }
        
        newItems = prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity }];
      }
      
      // Calculate totals
      calculateTotals(newItems);
      
      // Sync to backend for logged-in users (async, don't block UI)
      if (user) {
        API.post("/cart", {
          productId: product._id,
          quantity: quantity
        }).catch(err => console.error("Backend sync failed:", err));
      }
      
      // Sync to localStorage
      syncCart(newItems);
      
      toast.success(`${product.name} added to cart!`, {
        icon: "🛒",
        duration: 2000
      });
      
      return newItems;
    });
    
    return true;
  }, [calculateTotals, syncCart, getCurrentUser]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    const user = getCurrentUser();
    
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item._id !== productId);
      calculateTotals(newItems);
      syncCart(newItems);
      
      if (user) {
        API.delete(`/cart/${productId}`).catch(err => 
          console.error("Backend sync failed:", err)
        );
      }
      
      toast.success("Item removed from cart");
      return newItems;
    });
  }, [calculateTotals, syncCart, getCurrentUser]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const user = getCurrentUser();
    const product = cartItems.find(item => item._id === productId);
    
    if (product && newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available!`);
      return;
    }
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      
      calculateTotals(newItems);
      syncCart(newItems);
      
      if (user) {
        API.put("/cart", {
          productId: productId,
          quantity: newQuantity
        }).catch(err => console.error("Backend sync failed:", err));
      }
      
      return newItems;
    });
  }, [cartItems, calculateTotals, syncCart, removeFromCart, getCurrentUser]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const user = getCurrentUser();
    
    setCartItems([]);
    calculateTotals([]);
    localStorage.removeItem("cart");
    
    if (user) {
      try {
        await API.delete("/cart/clear");
      } catch (error) {
        console.error("Failed to clear cart on backend:", error);
      }
    }
    
    toast.success("Cart cleared");
  }, [calculateTotals, getCurrentUser]);

  // Apply coupon
  const applyCoupon = useCallback(async (couponCode) => {
    try {
      const response = await API.post("/coupons/validate", { code: couponCode });
      const { discount: discountAmount, type } = response.data || {};
      
      let discountValue = 0;
      if (type === "percentage") {
        discountValue = (subtotal * discountAmount) / 100;
      } else {
        discountValue = discountAmount || 0;
      }
      
      setCoupon({ code: couponCode, discount: discountAmount, type });
      setDiscount(Math.min(discountValue, subtotal)); // Don't discount below zero
      
      toast.success(`Coupon applied! Saved $${discountValue.toFixed(2)}`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
      return false;
    }
  }, [subtotal]);

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setDiscount(0);
    toast.success("Coupon removed");
  }, []);

  // Calculate final total (memoized)
  const getTotal = useCallback(() => {
    const total = subtotal - discount + shipping;
    return Math.max(0, total);
  }, [subtotal, discount, shipping]);

  // Get cart summary (memoized)
  const getCartSummary = useCallback(() => ({
    items: cartItems,
    count: cartCount,
    subtotal,
    discount,
    shipping,
    total: getTotal(),
    coupon
  }), [cartItems, cartCount, subtotal, discount, shipping, getTotal, coupon]);

  // Checkout
  const checkout = useCallback(async (orderData) => {
    const user = getCurrentUser();
    
    if (!user) {
      toast.error(ERROR_MESSAGES.LOGIN_REQUIRED);
      return false;
    }
    
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }
    
    setLoading(true);
    
    try {
      const response = await API.post("/orders", {
        ...orderData,
        items: cartItems,
        subtotal,
        discount,
        shipping,
        total: getTotal(),
        coupon
      });
      
      // Clear cart after successful order
      await clearCart();
      
      toast.success("Order placed successfully!");
      return response.data;
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(error.response?.data?.message || ERROR_MESSAGES.CHECKOUT);
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [cartItems, subtotal, discount, shipping, getTotal, coupon, clearCart, getCurrentUser]);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      loadCart();
    };
    
    const handleUserLoggedOut = () => {
      setCartItems([]);
      calculateTotals([]);
      setCoupon(null);
      setDiscount(0);
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleStorageChange);
    window.addEventListener("userLoggedOut", handleUserLoggedOut);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleStorageChange);
      window.removeEventListener("userLoggedOut", handleUserLoggedOut);
    };
  }, [loadCart, calculateTotals]);

  // Memoized context value
  const value = useMemo(() => ({
    // State
    cartItems,
    cartCount,
    subtotal,
    discount,
    shipping,
    loading,
    isInitialized,
    coupon,
    
    // Computed
    total: getTotal(),
    summary: getCartSummary(),
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    checkout,
    loadCart,
  }), [
    cartItems,
    cartCount,
    subtotal,
    discount,
    shipping,
    loading,
    isInitialized,
    coupon,
    getTotal,
    getCartSummary,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    checkout,
    loadCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};