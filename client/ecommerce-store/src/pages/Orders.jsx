// frontend/src/components/Orders.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// Status color mapping
const STATUS_CONFIG = {
  pending: { color: "yellow", label: "Pending", bgClass: "bg-yellow-100", textClass: "text-yellow-800" },
  processing: { color: "blue", label: "Processing", bgClass: "bg-blue-100", textClass: "text-blue-800" },
  shipped: { color: "purple", label: "Shipped", bgClass: "bg-purple-100", textClass: "text-purple-800" },
  delivered: { color: "green", label: "Delivered", bgClass: "bg-green-100", textClass: "text-green-800" },
  cancelled: { color: "red", label: "Cancelled", bgClass: "bg-red-100", textClass: "text-red-800" },
  completed: { color: "green", label: "Completed", bgClass: "bg-green-100", textClass: "text-green-800" },
};

// Default status config for unknown statuses
const DEFAULT_STATUS_CONFIG = {
  color: "gray",
  label: "Unknown",
  bgClass: "bg-gray-100",
  textClass: "text-gray-800",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await API.get("/orders/my");

      console.log(response.data); // Keeping your console.log as requested

      // SAFETY CHECK - preserving original logic
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error("Failed to fetch orders:", err);
      
      const errorMessage = err.response?.data?.message || "Failed to load your orders";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Preserving original error handling logic
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return "Invalid date";
    }
  }, []);

  // Get status configuration
  const getStatusConfig = useCallback((status) => {
    const normalizedStatus = status?.toLowerCase() || "";
    return STATUS_CONFIG[normalizedStatus] || DEFAULT_STATUS_CONFIG;
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Orders</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          My Orders
        </h2>
        {orders.length > 0 && (
          <p className="text-gray-500 mt-1">
            View and track your order history ({orders.length} total)
          </p>
        )}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="border rounded-xl p-12 text-center bg-gray-50">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            No orders found
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              formatDate={formatDate}
              getStatusConfig={getStatusConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Subcomponent: Order Card
function OrderCard({ order, formatDate, getStatusConfig }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  
  // Calculate total items in order
  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm text-gray-500">Order ID:</p>
            <p className="font-mono text-sm font-medium text-gray-700">
              {order._id}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500">Placed on:</span>
              <span className="ml-2 text-gray-700">
                {formatDate(order.createdAt)}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500">Items:</span>
              <span className="ml-2 text-gray-700">{totalItems}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span className={`${statusConfig.bgClass} ${statusConfig.textClass} px-3 py-1 rounded-full text-sm font-medium`}>
            {statusConfig.label}
          </span>
          
          {/* Expand/Collapse Button for mobile */}
          {order.items && order.items.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="sm:hidden text-gray-500 hover:text-gray-700 text-sm"
            >
              {expanded ? "▲ View less" : "▼ View more"}
            </button>
          )}
        </div>
      </div>

      {/* Order Items - Desktop always visible, mobile only when expanded */}
      <div className={`space-y-3 ${expanded ? 'block' : 'hidden sm:block'}`}>
        <h4 className="font-semibold text-gray-800 mb-3">Items Ordered</h4>
        
        {order.items?.map((item) => (
          <OrderItem key={item._id} item={item} />
        ))}
      </div>

      {/* Order Footer */}
      <div className="flex justify-end mt-4 pt-4 border-t">
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Order Total</p>
          <div className="text-2xl font-bold text-gray-900">
            R{parseFloat(order.totalPrice).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Order Item
function OrderItem({ item }) {
  const itemTotal = (item.price || 0) * (item.quantity || 0);
  const product = item.product;
  
  // Handle missing product data
  if (!product) {
    return (
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
        <div className="flex-1">
          <p className="text-gray-500">Product information unavailable</p>
        </div>
        <div className="font-semibold text-gray-700">
          R{itemTotal.toFixed(2)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
      <div className="flex items-center gap-4 flex-1">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/64?text=No+Image";
            e.target.onerror = null;
          }}
        />
        
        {/* Product Info */}
        <div className="flex-1">
          <Link 
            to={`/product/${product._id}`}
            className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
          >
            {product.name}
          </Link>
          
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
            <span>Price: R{parseFloat(product.price).toFixed(2)}</span>
            <span>Quantity: {item.quantity}</span>
            {item.size && <span>Size: {item.size}</span>}
            {item.color && <span>Color: {item.color}</span>}
          </div>
        </div>
      </div>
      
      {/* Item Total */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          R{itemTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}