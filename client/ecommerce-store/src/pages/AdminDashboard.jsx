// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: []
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/products");
      const productsData = response.data.products || response.data || [];
      setProducts(productsData);
      
      // Calculate stats
      const lowStock = productsData.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = productsData.filter(p => p.stock === 0).length;
      const categories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
      
      setStats({
        total: productsData.length,
        lowStock,
        outOfStock,
        categories
      });
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    
    setDeletingId(id);
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success(`"${name}" deleted`);
      fetchProducts(); // Refresh stats
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your products and stock</p>
        </div>
        
        <Link
          to="/admin/add-product"
          className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-gray-500 text-sm">Total Products</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
          <div className="text-gray-500 text-sm">Low Stock (≤10)</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          <div className="text-gray-500 text-sm">Out of Stock</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.categories.length}</div>
          <div className="text-gray-500 text-sm">Categories</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try a different search term" : "Add your first product to get started"}
            </p>
            {!searchTerm && (
              <Link
                to="/admin/add-product"
                className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Image</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Stock</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48?text=No+Image";
                        }}
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">R{product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0 ? "bg-red-100 text-red-700" :
                        product.stock <= 10 ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/edit/${product._id}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(product._id, product.name)}
                          disabled={deletingId === product._id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition disabled:bg-gray-400"
                        >
                          {deletingId === product._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}