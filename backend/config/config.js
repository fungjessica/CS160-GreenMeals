const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  yelpApiKey: process.env.YELP_API_KEY || 'SeMVqOcTs3fB6lvE2mIdSsrn9KApbk7GKM5EAAQQiGpHiR9J2yfLW2J_fx2luw2QC11lDH9XV5EuySo0yimf_NGUOnLz1GyvUTRVWHK_IabIqFtPIgEPGufYkJfUaHYx',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyDyQkvnxEaHaWOJp10IuVtM-ilMT_nxoaM"
};

export default config;