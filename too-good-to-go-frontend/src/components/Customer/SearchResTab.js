import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
const API_BASE_URL = 'http://localhost:3001/api';

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

const SearchResTab = ({ token, handleRestaurantClick,userRestrictions = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [center, setCenter] = useState([37.3382, -121.8863]); // Default: San Jose
  const [restaurants, setRestaurants] = useState([]);
  const [filterByRestrictions, setFilterByRestrictions] = useState(false);
    // get user geolocation
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
          () => console.warn("Geolocation denied, using San Jose")
        );
      }
    }, []);
  
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/restaurant/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const restaurantsArray = Array.isArray(data)
        ? data
        : data.restaurants || data.businesses || [];
      
      const taggedResults = restaurantsArray.map(r => ({
        ...r,
        source: 'database'
      }));

      // Filter by dietary restrictions if enabled
      
      setResults(taggedResults);
    } catch (err) {
      console.error('Error searching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Leaflet icons
    const defaultIcon = new L.Icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const userIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const dbIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    return (
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Search Restaurants</h2>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-black-700 font-medium hover:font-bold transition duration-150"
            style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',}}
          >
            {showMap ? 'Show List' : 'Show Map'}
          </button>
        </div>
      
        {/* Search Field */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or cuisine..."
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
  
        {/* Conditional: List or Map */}
        {loading ? (
          <p>Loading...</p>
        ) : showMap ? (
          <div className="h-[75vh] rounded-lg overflow-hidden">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeView center={center} />
  
              {/* User marker */}
              <Marker position={center} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
  
              {/* Restaurant markers */}
              {results.map((r) => (
                r.latitude && r.longitude && (
                  <Marker
                    key={r.id}
                    position={[r.latitude, r.longitude]}
                    icon={r.source === 'database' ? dbIcon : defaultIcon}
                  >
                    <Popup>
                      <strong>{r.name}</strong><br />
                      {r.cuisine_type}<br />
                      {r.address}
                      <br />
                      <button
                        onClick={() => handleRestaurantClick(r)}
                        style={{
                          marginTop: '6px',
                          padding: '4px 8px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        View Details →
                      </button>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => handleRestaurantClick(r)}
                className="p-4 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
              >
                <h3 className="text-lg font-semibold">{r.name}</h3>
                <p className="text-gray-600">{r.cuisine_type}</p>
                <p className="text-sm text-gray-500">{r.address}</p>
              </div>
            ))}
          </div>
        ) : (
          query && <p>No restaurants found.</p>
        )}
      </div>
    );
};

export default SearchResTab;
