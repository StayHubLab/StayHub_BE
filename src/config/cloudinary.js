/**
 * @fileoverview Cloudinary Configuration
 * @description Configuration for Cloudinary cloud storage service
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
const verifyConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    console.error('❌ Cloudinary configuration missing. Please check your .env file.');
    console.log('Required environment variables:');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
    return false;
  }

  console.log('✅ Cloudinary configured successfully');
  return true;
};

module.exports = {
  cloudinary,
  verifyConfig,
};
