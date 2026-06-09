// frontend/src/pages/OrderTracking.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const orderSteps = {
  pending: { label: "Order Placed", icon: "📦", completed: true },
  confirmed: { label: "Order Confirmed", icon: "✅", completed: true },
  processing: { label: "Processing", icon: "⚙️", completed: false },
  shipped: { label: "Shipped", icon: "🚚", completed: false },
  delivered: { label: "Delivered", icon: "🏠", completed: false }
};

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const currentStepIndex = Object.keys(orderSteps).indexOf(order.status);
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (Object.keys(orderSteps).length - 1)) * 100}%` }}
              />
            </div>
            
            {Object.entries(orderSteps).map(([status, step], idx) => (
              <div key={status} className="relative z-10 text-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
                  ${idx <= currentStepIndex ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}
                `}>
                  {step.icon}
                </div>
                <div className="text-sm font-medium">{step.label}</div>
                {idx === currentStepIndex && (
                  <div className="text-xs text-green-600 mt-1">Current</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Tracking Info */}
        {order.trackingInfo?.trackingNumber && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Tracking Information</h3>
            <p>Courier: {order.trackingInfo.courier}</p>
            <p>Tracking Number: {order.trackingInfo.trackingNumber}</p>
            {order.trackingInfo.trackingUrl && (
              <a href={order.trackingInfo.trackingUrl} target="_blank" className="text-blue-600 hover:underline">
                Track on courier website →
              </a>
            )}
          </div>
        )}
        
        {/* Order Items */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>R{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? "Free" : `R${order.shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
            <span>Total</span>
            <span>R{order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <Link to="/orders" className="inline-block mt-6 text-purple-600 hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    </div>
  );
}