🛒 Full Stack MERN E-Commerce Store

A modern, production-style Full Stack E-Commerce Application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js) with authentication, role-based authorization, product management, shopping cart functionality, order processing, Cloudinary image uploads, and an admin dashboard.

This project simulates a real-world online shopping platform where customers can browse products, manage their cart, place orders, and administrators can manage inventory and products.

🚀 Features
👤 User Features
Authentication & Authorization
User Registration
User Login
JWT Authentication
Password Hashing with bcrypt
Protected Routes
Persistent Login Sessions
Shopping Experience
Browse Products
Product Cards
Product Images
Product Categories
Add Products to Cart
Update Cart Quantity
Remove Products from Cart
View Cart Summary
Checkout Process
Orders
Place Orders
View Order History
View Personal Orders
👨‍💼 Admin Features
Product Management
Add New Products
Edit Existing Products
Delete Products
Manage Product Inventory
Upload Product Images to Cloudinary
Dashboard
View All Products
Manage Product Catalog
Inventory Monitoring
🛠 Tech Stack
Frontend
React.js
React Router DOM
Axios
Tailwind CSS
Context API
Custom Hooks
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
bcryptjs
Multer
Cloudinary
Socket.io

📦 Frontend Components
Components
Navbar

Navigation bar with:

Login / Logout
Cart Link
Orders Link
Admin Links
ProductCard

Displays:

Product Image
Product Name
Product Price
Add To Cart Button
CategoryGrid

Displays available shopping categories.

HeroSlider

Landing page image slider.

Newsletter

Email subscription section.

Footer

Website footer.

LoadingSpinner

Loading state component.

ProtectedRoute

Protects authenticated pages.

Scroll Animations
Scroll Progress Bar
Scroll To Top
Page Animations
⚙ Context API
AuthContext

Manages:

Login State
Logout
Current User
Authentication Status
CartContext

Manages:

Cart Items
Add To Cart
Remove From Cart
Quantity Updates
Cart Total
📄 Pages
Home Page

Features:

Hero Banner
Featured Products
Categories
Promotions
Newsletter
Products Page

Features:

Product Listing
Product Grid
Product Cards
Cart Page

Features:

Cart Summary
Quantity Controls
Total Price
Checkout Button
Checkout Page

Features:

Order Placement
Order Confirmation
Login Page

Features:

User Authentication
Register Page

Features:

Account Creation
My Orders Page

Features:

View Previous Orders
Admin Dashboard

Features:

Product Overview
Inventory Management
Add Product Page

Features:

Upload Product Image
Product Information Form
Cloudinary Integration
Edit Product Page

Features:

Update Product Details
Update Inventory
🗄 Database Models
User
{
  name,
  email,
  password,
  role
}
Roles
user
admin
Product
{
  name,
  price,
  description,
  image,
  stock
}
Cart
{
  user,
  items[]
}
Order
{
  user,
  items,
  totalPrice,
  status
}
☁ Cloudinary Integration

Product images are uploaded directly to Cloudinary.

Benefits
Faster image delivery
Secure cloud storage
Automatic optimization
Easy scaling
🔐 Authentication Flow
Register
User → Register → MongoDB
Login
User → Login
      ↓
JWT Generated
      ↓
Stored in Local Storage
      ↓
Protected Routes Accessible
📡 API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
Products
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
Cart
GET    /api/cart
POST   /api/cart
PUT    /api/cart
DELETE /api/cart/:id
Orders
GET    /api/orders
POST   /api/orders
GET    /api/orders/my
🚀 Installation
Clone Repository
git clone https://github.com/nathaneilkiwa/ecommerce-store.git
Backend Setup
cd backend

npm install

Create .env

MONGO_URI=mongodb://localhost:27017/ecommerce

JWT_SECRET=your_secret

PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Start Backend

npm run dev
Frontend Setup
cd client/ecommerce-store

npm install

npm run dev
📈 Future Improvements
Planned Features
Product Search
Product Filtering
Product Sorting
Wishlist
Product Reviews
Ratings System
Payment Gateway Integration (Stripe)
Email Notifications
Admin Analytics Dashboard
Sales Reports
Real-Time Order Tracking
Multi-Image Product Gallery
Dark Mode
Mobile App Version
🎯 Learning Outcomes

This project demonstrates practical experience with:

Full Stack Development
REST API Design
MongoDB Database Design
JWT Authentication
React Context API
State Management
Cloudinary Integration
CRUD Operations
File Upload Handling
Role-Based Access Control
MERN Architecture
Real-World E-Commerce Workflows
👨‍💻 Author

Nhlanhla Kiwa

Mechanical Engineer | Full Stack Developer in Training

Building real-world applications using the MERN Stack while transitioning engineering problem-solving skills into software development.
