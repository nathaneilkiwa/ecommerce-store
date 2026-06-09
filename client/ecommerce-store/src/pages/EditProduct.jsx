// frontend/src/components/EditProduct.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// Initial form state
const INITIAL_FORM_STATE = {
  name: "",
  price: "",
  stock: "",
  description: "",
};

// Validation rules
const VALIDATION_RULES = {
  name: { required: true, minLength: 2, maxLength: 100 },
  price: { required: true, min: 0.01, pattern: /^\d+(\.\d{1,2})?$/ },
  stock: { required: true, min: 0, integer: true },
  description: { required: false, maxLength: 1000 },
};

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [originalProduct, setOriginalProduct] = useState(null);

  // Validate a single field
  const validateField = useCallback((fieldName, value) => {
    const rule = VALIDATION_RULES[fieldName];
    if (!rule) return "";
    
    if (rule.required && !value) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (!value && !rule.required) return "";
    
    if (rule.minLength && value.length < rule.minLength) {
      return `${fieldName} must be at least ${rule.minLength} characters`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${fieldName} must not exceed ${rule.maxLength} characters`;
    }
    
    if (rule.min !== undefined && parseFloat(value) < rule.min) {
      return `${fieldName} must be at least ${rule.min}`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      if (fieldName === "price") {
        return "Price must be a valid number with up to 2 decimal places";
      }
      return `Invalid ${fieldName} format`;
    }
    
    if (rule.integer && !Number.isInteger(parseFloat(value))) {
      return `${fieldName} must be a whole number`;
    }
    
    return "";
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      const value = form[fieldName];
      // Skip validation for empty optional fields
      if (!value && !VALIDATION_RULES[fieldName].required) return;
      
      const error = validateField(fieldName, value);
      if (error) newErrors[fieldName] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // Fetch product by ID
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all products and find by ID (preserving original logic)
      const response = await API.get("/products");
      const product = response.data.find((p) => p._id === id);
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      setOriginalProduct(product);
      setForm({
        name: product.name || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        description: product.description || "",
      });
      
    } catch (err) {
      console.error("Failed to fetch product:", err);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to load product";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Redirect after 2 seconds if product not found
      if (err.message === "Product not found" || err.response?.status === 404) {
        setTimeout(() => {
          toast.error("Product not found. Redirecting...");
          navigate("/admin");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Load product on mount
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle input changes
  const handleInputChange = useCallback((fieldName, value) => {
    setForm(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  }, [errors]);

  // Handle field blur (validation on touch)
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, form[fieldName]);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [form, validateField]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!originalProduct) return false;
    
    return (
      form.name !== (originalProduct.name || "") ||
      form.price !== (originalProduct.price?.toString() || "") ||
      form.stock !== (originalProduct.stock?.toString() || "") ||
      form.description !== (originalProduct.description || "")
    );
  }, [form, originalProduct]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const touchedFields = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(touchedFields);
    
    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      toast.error("Please fix the errors before saving");
      return;
    }
    
    // Check if any changes were made
    if (!hasChanges()) {
      toast.error("No changes to save");
      return;
    }
    
    setSaving(true);
    
    try {
      // Prepare data for update
      const updateData = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        description: form.description?.trim() || "",
      };
      
      await API.put(`/products/${id}`, updateData);
      
      toast.success("Product updated successfully!");
      
      // Navigate back to admin dashboard
      navigate("/admin");
      
    } catch (err) {
      console.error("Failed to update product:", err);
      
      // Handle specific error responses
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
        
        // Set field-specific errors from backend if available
        if (err.response.data.errors) {
          setErrors(err.response.data.errors);
        }
      } else if (err.response?.status === 401) {
        toast.error("Unauthorized. Please login as admin.");
      } else if (err.response?.status === 404) {
        toast.error("Product not found");
        navigate("/admin");
      } else {
        toast.error("Failed to update product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Helper to determine if a field has error
  const hasError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-10 px-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-xl mx-auto py-10 px-6">
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
            <button
              onClick={() => navigate("/admin")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Edit Product
        </h2>
        <p className="text-gray-500 mt-1">
          Update product information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            disabled={saving}
            className={`
              w-full border p-3 rounded-lg transition-colors
              ${hasError("name") 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-purple-500"
              }
              focus:outline-none focus:ring-2 disabled:bg-gray-100
            `}
          />
          {hasError("name") && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (R) *
          </label>
          <input
            type="number"
            name="price"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            onBlur={() => handleBlur("price")}
            disabled={saving}
            className={`
              w-full border p-3 rounded-lg transition-colors
              ${hasError("price") 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-purple-500"
              }
              focus:outline-none focus:ring-2 disabled:bg-gray-100
            `}
          />
          {hasError("price") && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            step="1"
            placeholder="0"
            value={form.stock}
            onChange={(e) => handleInputChange("stock", e.target.value)}
            onBlur={() => handleBlur("stock")}
            disabled={saving}
            className={`
              w-full border p-3 rounded-lg transition-colors
              ${hasError("stock") 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-purple-500"
              }
              focus:outline-none focus:ring-2 disabled:bg-gray-100
            `}
          />
          {hasError("stock") && (
            <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
          )}
          {parseInt(form.stock) <= 10 && parseInt(form.stock) > 0 && (
            <p className="text-yellow-600 text-xs mt-1">
              Warning: Low stock level
            </p>
          )}
          {parseInt(form.stock) === 0 && (
            <p className="text-red-600 text-xs mt-1">
              Product will be marked as out of stock
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter product description (optional)"
            value={form.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            rows="4"
            disabled={saving}
            className={`
              w-full border p-3 rounded-lg transition-colors
              ${hasError("description") 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-purple-500"
              }
              focus:outline-none focus:ring-2 disabled:bg-gray-100
            `}
          />
          <div className="flex justify-between mt-1">
            {hasError("description") ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <p className="text-gray-400 text-xs">
                {form.description.length}/1000 characters
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            disabled={saving}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving || !hasChanges()}
            className={`
              flex-1 py-3 rounded-lg font-medium transition-colors
              ${saving || !hasChanges()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 text-white"
              }
            `}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}