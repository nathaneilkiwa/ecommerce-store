// frontend/src/components/ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function ProductCard({ product, showQuantity = false }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async () => {
    setIsAdding(true);
    try {
      await API.post("/cart", {
        productId: product._id,
        quantity: quantity,
      });
      toast.success(`Added ${product.name} to cart`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const increaseQty = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
    else toast.error(`Only ${product.stock} left in stock`);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="group border rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${product._id}`} className="block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
      </Link>

      <div className="p-5">
        {product.onSale && (
          <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mb-2">
            Sale
          </span>
        )}
        
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-purple-600 transition">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-4">
          <p className="text-2xl font-bold text-gray-900">
            R{product.price.toFixed(2)}
          </p>
          {product.oldPrice && (
            <p className="text-gray-400 line-through text-sm">
              R{product.oldPrice.toFixed(2)}
            </p>
          )}
        </div>

        {showQuantity && (
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={decreaseQty}
              className="w-8 h-8 rounded border hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={increaseQty}
              className="w-8 h-8 rounded border hover:bg-gray-100"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={addToCart}
          disabled={isAdding}
          className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}