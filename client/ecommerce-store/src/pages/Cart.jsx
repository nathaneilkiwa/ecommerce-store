// frontend/src/components/Cart.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await API.get("/cart");
      setCart(response.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err.response?.data?.message || "Failed to load your cart");
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Update quantity handler
  const updateQuantity = useCallback(async (productId, currentQuantity, newQuantity) => {
    // Prevent quantity below 1
    if (newQuantity < 1) return;
    
    // Prevent unnecessary updates
    if (newQuantity === currentQuantity) return;
    
    setUpdatingItemId(productId);
    
    try {
      await API.put("/cart", {
        productId,
        quantity: newQuantity,
      });
      
      // Refresh cart after update
      await fetchCart();
      
      toast.success("Cart updated");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      const errorMessage = err.response?.data?.message || "Failed to update cart";
      toast.error(errorMessage);
    } finally {
      setUpdatingItemId(null);
    }
  }, [fetchCart]);

  // Checkout handler
  const checkout = useCallback(async () => {
    // Validate cart has items
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setCheckingOut(true);
    
    try {
      await API.post("/orders");
      
      toast.success("Order placed successfully!", {
        icon: "🎉",
        duration: 4000
      });
      
      // Refresh cart after successful checkout
      await fetchCart();
      
    } catch (err) {
      console.error("Checkout failed:", err);
      
      const errorMessage = err.response?.data?.message || "Checkout failed. Please try again.";
      toast.error(errorMessage);
      
      // Set error state for display
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setCheckingOut(false);
    }
  }, [cart, fetchCart]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (only if cart is null and error exists)
  if (error && !cart) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Cart</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCart}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure cart exists before rendering
  if (!cart) return null;

  // Calculate total price
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + (item.product.price * item.quantity),
    0
  );

  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Shopping Cart
        </h2>
        {cart.items.length > 0 && (
          <p className="text-gray-500 mt-1">
            {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
          </p>
        )}
      </div>

      {/* Empty Cart State */}
      {cart.items.length === 0 ? (
        <div className="border rounded-xl p-12 text-center bg-gray-50">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any items yet
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdateQuantity={updateQuantity}
                isUpdating={updatingItemId === item.product._id}
              />
            ))}
          </div>

          {/* Order Summary Section */}
          <OrderSummary
            itemCount={itemCount}
            totalPrice={totalPrice}
            onCheckout={checkout}
            isCheckingOut={checkingOut}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

// Subcomponent: Cart Item
function CartItem({ item, onUpdateQuantity, isUpdating }) {
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
      {/* Left section: Image and Info */}
      <div className="flex gap-4 mb-4 sm:mb-0">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/96?text=No+Image";
            e.target.onerror = null;
          }}
        />

        {/* Product Info */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            R{product.price.toFixed(2)}
          </p>
          
          {/* Stock warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-yellow-600 text-xs mt-1">
              Only {product.stock} left in stock
            </p>
          )}
          
          {product.stock === 0 && (
            <p className="text-red-600 text-xs mt-1">
              Out of stock
            </p>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => onUpdateQuantity(product._id, quantity, quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className={`
                w-8 h-8 rounded-lg transition-colors
                ${quantity <= 1 || isUpdating
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }
              `}
              aria-label="Decrease quantity"
            >
              -
            </button>

            <span className="font-medium min-w-[20px] text-center">
              {isUpdating ? "..." : quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(product._id, quantity, quantity + 1)}
              disabled={isUpdating || (product.stock && quantity >= product.stock)}
              className={`
                w-8 h-8 rounded-lg transition-colors
                ${(product.stock && quantity >= product.stock) || isUpdating
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }
              `}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Right section: Item Total */}
      <div className="text-right sm:text-left">
        <p className="font-bold text-xl text-gray-900">
          R{itemTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

// Subcomponent: Order Summary
function OrderSummary({ itemCount, totalPrice, onCheckout, isCheckingOut, error }) {
  const shippingCost = totalPrice > 500 ? 0 : 50;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="border rounded-xl p-6 h-fit bg-white sticky top-24">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">
        Order Summary
      </h3>

      {/* Items Count */}
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Items ({itemCount})</span>
          <span>R{totalPrice.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? "Free" : `R${shippingCost.toFixed(2)}`}
          </span>
        </div>

        {/* Free shipping notice */}
        {shippingCost > 0 && (
          <p className="text-xs text-gray-500">
            Add R{(500 - totalPrice).toFixed(2)} more for free shipping
          </p>
        )}

        {/* Total */}
        <div className="flex justify-between text-xl font-bold border-t pt-4 mt-4">
          <span>Total</span>
          <span>R{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className={`
          w-full mt-6 py-3 rounded-lg font-medium transition-colors
          ${isCheckingOut || itemCount === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
          }
        `}
      >
        {isCheckingOut ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </span>
        ) : (
          "Proceed to Checkout"
        )}
      </button>

      {/* Error Display */}
      {error && (
        <p className="text-red-600 text-sm mt-3 text-center">
          {error}
        </p>
      )}
    </div>
  );
}