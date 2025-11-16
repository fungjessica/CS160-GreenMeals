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
      let filteredResults = taggedResults;
      
      if (filterByRestrictions && userRestrictions.length > 0) {
        console.log('Filtering by restrictions:', userRestrictions.map(r => r.restriction_name));
        
        // Fetch menu items for each restaurant and check compatibility
        const restaurantChecks = await Promise.all(
          taggedResults.map(async (restaurant) => {
            try {
              // Fetch menu items with dietary info for this restaurant
              const menuRes = await fetch(
                `${API_BASE_URL}/customer/restaurant/${restaurant.id}/menu`,
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );
              
              if (!menuRes.ok) {
                console.warn(`Failed to fetch menu for ${restaurant.name}`);
                return { restaurant, hasCompatibleItems: false };
              }
              
              const menuData = await menuRes.json();
              const menuItems = Array.isArray(menuData) ? menuData : menuData.items || [];

              // ADD THIS:
              console.log('Menu items for', restaurant.name, ':', menuItems);
              console.log('First item structure:', menuItems[0]);
              // Check if ANY menu item is compatible with ALL user restrictions
              // Check if ANY menu item is compatible with ALL user restrictions
              const hasCompatibleItems = menuItems.some(item => {
                // Handle dietaryCompliance array format
                let itemRestrictions = [];
                
                if (item.dietaryCompliance && Array.isArray(item.dietaryCompliance)) {
                  itemRestrictions = item.dietaryCompliance.map(dc => dc.restriction_name);
                } else if (item.dietary_tags) {
                  // Fallback for dietary_tags string format
                  itemRestrictions = item.dietary_tags.split(',').map(tag => tag.trim());
                }
                
                console.log(`Checking ${item.name}:`, itemRestrictions);
                
                // Check if this item satisfies ALL user restrictions
                // Check if this item satisfies ALL user restrictions
                const userRestrictionNames = userRestrictions.map(r => r.restriction_name);
                const isCompatible = userRestrictionNames.every(restrictionName => 
                  itemRestrictions.includes(restrictionName)
                );
                
                if (isCompatible) {
                  console.log(`✓ ${restaurant.name} - ${item.name} matches all restrictions`);
                }
                
                return isCompatible;
              });
              
              return { restaurant, hasCompatibleItems };
              
            } catch (error) {
              console.error(`Error checking ${restaurant.name}:`, error);
              return { restaurant, hasCompatibleItems: false };
            }
          })
        );
        
        // Filter to only restaurants with compatible items
        filteredResults = restaurantChecks
          .filter(check => check.hasCompatibleItems)
          .map(check => check.restaurant);
        
        console.log(`Found ${filteredResults.length}/${taggedResults.length} restaurants with compatible items`);
      }
      
      setResults(filteredResults);
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
        {/* Checkbox */}
        <div
            className="header-right"
            style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginRight: '20px',
            marginTop: '5px',
            marginBottom: '10px',
            }}
        >
            {userRestrictions.length > 0 && (
            <label
                style={{
                color: 'black',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                }}
            >
                <input
                type="checkbox"
                checked={filterByRestrictions}
                onChange={(e) => setFilterByRestrictions(e.target.checked)}
                style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                }}
                />
                <span>
                Filter by my dietary restrictions ({userRestrictions.length})
                </span>
            </label>
            )}
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
