// frontend/src/pages/AdminAddProduct.jsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const INITIAL_FORM_STATE = {
  name: "",
  price: "",
  description: "",
  category: "",
  stock: "",
};

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
    
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: "" }));
    }
  }, [errors.image]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || form.price <= 0) newErrors.price = "Valid price is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.stock || form.stock < 0) newErrors.stock = "Valid stock quantity is required";
    if (!image && !preview) newErrors.image = "Product image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("price", parseFloat(form.price));
      formData.append("description", form.description.trim());
      formData.append("category", form.category.trim());
      formData.append("stock", parseInt(form.stock, 10));
      if (image) formData.append("image", image);
      
      await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("✨ Product created successfully!");
      
      // Reset form
      setForm(INITIAL_FORM_STATE);
      setImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      setErrors({});
      
      // Optional: navigate back to dashboard after 2 seconds
      setTimeout(() => navigate("/admin"), 2000);
      
    } catch (err) {
      console.error("Failed to create product:", err);
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">Fill in the details to add a new product to your store</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Premium Yoga Mat"
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Price and Stock */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (R) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
              value={form.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              step="1"
              placeholder="0"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.stock ? "border-red-500" : "border-gray-300"
              }`}
              value={form.stock}
              onChange={(e) => handleInputChange("stock", e.target.value)}
            />
            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            placeholder="e.g., Yoga, Weights, Accessories"
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            value={form.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          />
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            rows="5"
            placeholder="Describe your product..."
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            value={form.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          <p className="text-gray-400 text-xs mt-1">
            {form.description.length}/1000 characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition">
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-lg mx-auto" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <span className="text-4xl mb-2">📸</span>
                  <span className="text-gray-600">Click to upload</span>
                  <span className="text-gray-400 text-sm">JPEG, PNG, WebP (max 5MB)</span>
                </label>
              </>
            )}
          </div>
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
          >
            {isSubmitting ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}