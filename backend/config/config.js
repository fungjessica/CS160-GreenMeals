const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  yelpApiKey: process.env.YELP_API_KEY || 'y_p_MrZDectdA0xdUTyg_YXYCV1N6vNeIt_rr4VVAmsVBVBOxIUiq-5-Y3e5uoNVc-VQJ6O6kG5gE_KCLV4sLWKQGSTShNmpkCixDFRErUymBYpp2___9iZ4_SYNaXYx',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyDyQkvnxEaHaWOJp10IuVtM-ilMT_nxoaM"
};

export default config;
