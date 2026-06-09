// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      setUser(userData ? JSON.parse(userData) : null);
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show nothing or a loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}