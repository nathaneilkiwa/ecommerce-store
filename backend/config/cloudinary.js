const cloudinary = require("cloudinary").v2;

// Don't put dotenv.config() here - it should already be called in server.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

module.exports = cloudinary;