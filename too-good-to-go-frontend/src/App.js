import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Filter, Clock, ShoppingBag, User, CheckCircle, XCircle, Plus, Edit, Trash2, LogOut, Map as MapIcon } from 'lucide-react';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import './App.css';
import AuthScreen from './components/Auth/AuthScreen';
import RestaurantDashboard from './components/Restaurant/RestaurantDashboard';

import CustomerDashboard from './components/Customer/CustomerDashboard';
// Component to dynamically update map view
function ChangeView({ center }) {
  const map = useMap();
  const prevCenterRef = useRef(center);

  useEffect(() => {
    if (
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1]
    ) {
      map.setView(center);
      prevCenterRef.current = center;
    }
  }, [center, map]);

  return null;
}


const API_BASE_URL = 'http://localhost:3001/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const API_BASE_URL = "http://localhost:3001/api";

  const redIcon = new L.Icon({
    iconUrl:"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);


  const loadUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <AuthScreen setToken={setToken} />;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return user.user.role === 'restaurant' ? (
    <RestaurantDashboard user={user} token={token} handleLogout={handleLogout} />
  ) : (
    <CustomerDashboard user={user} token={token} handleLogout={handleLogout} />
  );
};

export default App;