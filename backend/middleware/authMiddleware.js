// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Also check for token in cookies (optional, for better UX)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // Verify JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Check if user is active (if you have an isActive field)
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token signature",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Token not active yet",
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token verification failed.",
    });
  }
};

/**
 * Admin middleware - Checks if user has admin role
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

/**
 * Optional: Generate JWT token helper
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Optional: Verify token without throwing errors (returns decoded or null)
 */
const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Optional: Refresh token middleware
 */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token required",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

module.exports = { 
  protect, 
  admin, 
  generateToken, 
  verifyToken,
  refreshToken 
};