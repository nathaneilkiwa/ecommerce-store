// backend/server.js (Updated - Remove deprecated options)
// ✅ MUST BE FIRST LINE
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Import error handler
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// ✅ Create HTTP server (required for socket.io)
const server = http.createServer(app);

// ✅ Setup Socket.io with better config
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// ✅ Enhanced Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Request logging middleware (for development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Debug logging to verify env variables are loaded
console.log("\n=== Environment Variables Check ===");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "❌ MISSING");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ MISSING");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ MISSING");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ SET" : "❌ MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ MISSING");
console.log("PORT:", process.env.PORT || "5000");
console.log("===================================\n");

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "E-Commerce API is running", 
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
      auth: "/api/auth",
      users: "/api/users"
    }
  });
});

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ✅ MongoDB connection - FIXED: Remove deprecated options for Mongoose v6+
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    
    // Optional: Log available collections
    if (process.env.NODE_ENV === "development") {
      mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (!err && collections) {
          console.log("📚 Available collections:", collections.map(c => c.name));
        }
      });
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    // Don't exit immediately, let the server try to reconnect
    console.log("⚠️  Will retry connection...");
  });

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// ✅ Socket.io events with rooms support
io.on("connection", (socket) => {
  console.log(`🔥 User connected: ${socket.id}`);
  
  // Join user-specific room for private messages
  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their private room`);
  });
  
  // Join order room for order updates
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Joined order room: ${orderId}`);
  });
  
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ✅ Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🔴 Shutting down gracefully...");
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// ❗ IMPORTANT: use server.listen (NOT app.listen)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📝 API URL: http://localhost:${PORT}`);
});