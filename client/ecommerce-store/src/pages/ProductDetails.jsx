// frontend/src/components/ProductDetails.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch product from API
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      
      const errorMessage = err.response?.data?.message || "Failed to load product";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load product on mount or when ID changes
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Add to cart handler
  const addToCart = useCallback(async () => {
    if (!product) return;
    
    // Validate stock
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    
    setAddingToCart(true);
    
    try {
      await API.post("/cart", {
        productId: product._id,
        quantity: quantity,
      });
      
      toast.success(`${product.name} added to cart!`, {
        icon: "🛒",
        duration: 2000
      });
      
      // Dispatch custom event for cart count update
      window.dispatchEvent(new Event("cartUpdated"));
      
    } catch (err) {
      console.error("Failed to add to cart:", err);
      
      const errorMessage = err.response?.data?.message || "Failed to add item to cart";
      toast.error(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity]);

  // Quantity handlers
  const increaseQuantity = useCallback(() => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (product && quantity >= product.stock) {
      toast.error(`Only ${product.stock} items available`);
    }
  }, [product, quantity]);

  const decreaseQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Product</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchProduct}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Product Not Found</h2>
          <p className="text-yellow-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-purple-600 transition">
          Home
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="sticky top-24">
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-2xl shadow-lg border border-gray-200"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x600?text=No+Image";
                e.target.onerror = null;
              }}
            />
          </div>
        </div>

        {/* Details Section */}
        <div>
          {/* Product Name */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Category (if available) */}
          {product.category && (
            <div className="mb-4">
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-gray-900">
              R{parseFloat(product.price).toFixed(2)}
            </p>
            {product.oldPrice && (
              <p className="text-gray-400 line-through text-sm mt-1">
                R{parseFloat(product.oldPrice).toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-semibold">✓ In Stock</span>
                <span className="text-sm text-gray-500">
                  ({product.stock} units available)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-semibold">✗ Out of Stock</span>
              </div>
            )}
            
            {/* Low stock warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-yellow-600 text-sm mt-1">
                ⚠️ Only {product.stock} left in stock - order soon
              </p>
            )}
          </div>

          {/* Quantity Selector (only show if in stock) */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className={`
                    w-10 h-10 rounded-lg transition-colors
                    ${quantity <= 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }
                  `}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                
                <span className="font-semibold text-lg min-w-[40px] text-center">
                  {quantity}
                </span>
                
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className={`
                    w-10 h-10 rounded-lg transition-colors
                    ${quantity >= product.stock
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
          )}

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={addingToCart || product.stock === 0}
            className={`
              w-full md:w-auto px-8 py-4 rounded-xl font-medium transition-all
              ${addingToCart || product.stock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 text-white hover:shadow-lg transform hover:scale-[1.02]"
              }
            `}
          >
            {addingToCart ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Adding...
              </span>
            ) : product.stock === 0 ? (
              "Out of Stock"
            ) : (
              `Add to Cart - R${(parseFloat(product.price) * quantity).toFixed(2)}`
            )}
          </button>

          {/* Additional Info Section */}
          <div className="mt-8 pt-6 border-t">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">✓ Free shipping</span>
                <span className="text-gray-400">on orders over R500</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">✓ 30-day returns</span>
                <span className="text-gray-400">hassle-free returns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">✓ Secure checkout</span>
                <span className="text-gray-400">payment protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}