// frontend/src/components/Newsletter.jsx
import { useState } from "react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Subscribed successfully!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
      <div className="max-w-3xl mx-auto px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
        <p className="text-lg mb-6">Get the latest updates on new products and upcoming sales</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}