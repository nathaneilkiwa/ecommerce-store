// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Set default authorization header
          API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set authorization header
      API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      // Dispatch events
      window.dispatchEvent(new Event("userLoggedIn"));
      window.dispatchEvent(new Event("cartUpdated"));
      
      toast.success(`Welcome back, ${userData.name}!`);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const response = await API.post("/auth/register", userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Set authorization header
      API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(newUser);
      
      toast.success("Account created successfully!");
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, error: error.response?.data?.message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    // Remove from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Remove authorization header
    delete API.defaults.headers.common["Authorization"];
    
    setToken(null);
    setUser(null);
    
    // Dispatch events
    window.dispatchEvent(new Event("userLoggedOut"));
    window.dispatchEvent(new Event("cartUpdated"));
    
    toast.success("Logged out successfully");
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await API.put("/users/profile", updates);
      
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile updated successfully");
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      return { success: false, error: error.response?.data?.message };
    }
  }, [user]);

  // Check if user is admin
  const isAdmin = user?.role === "admin";
  
  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};