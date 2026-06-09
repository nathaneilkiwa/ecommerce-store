// frontend/src/pages/Checkout.jsx (Simplified - remove Helmet temporarily)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "South Africa",
    phone: "",
    email: ""
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.street || !formData.city || !formData.phone) {
      toast.error("Please fill in all shipping details");
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: total,
        shippingCost: total > 500 ? 0 : 50,
        total: total > 500 ? total : total + 50,
        shippingAddress: formData
      };
      
      const response = await API.post("/orders", orderData);
      
      toast.success("Order placed successfully!");
      clearCart();
      
      // Redirect to orders page
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = total > 500 ? 0 : 50;
  const finalTotal = total + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    <div className="text-sm font-semibold">R{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `R${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>R{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}