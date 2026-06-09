// frontend/src/components/CategoryGrid.jsx
import { Link } from "react-router-dom";

const categories = [
  { name: "Electronics", icon: "📱", color: "bg-blue-100" },
  { name: "Fashion", icon: "👕", color: "bg-pink-100" },
  { name: "Home & Living", icon: "🏠", color: "bg-green-100" },
  { name: "Sports", icon: "⚽", color: "bg-yellow-100" },
  { name: "Books", icon: "📚", color: "bg-purple-100" },
  { name: "Beauty", icon: "💄", color: "bg-red-100" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
        <p className="text-gray-600">Find what you're looking for</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/products?category=${category.name}`}
            className={`${category.color} rounded-xl p-6 text-center hover:scale-105 transition-transform`}
          >
            <div className="text-4xl mb-2">{category.icon}</div>
            <div className="font-medium text-gray-800">{category.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}