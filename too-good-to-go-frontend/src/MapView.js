import './App.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

const API_BASE_URL = 'http://localhost:3001/api';

// Component to dynamically update map view
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 13);
        }
    }, [center, map]);
    return null;
}

export default function MapView({ token, onRestaurantClick, userRestrictions = [] }) {
    // Default center = San Jose
    const [center, setCenter] = useState([37.3382, -121.8863]);
    const [query, setQuery] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [filterByRestrictions, setFilterByRestrictions] = useState(false);

    const redIcon = new L.Icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const defaultIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    // Ask for user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCenter([pos.coords.latitude, pos.coords.longitude]);
                },
                () => {
                    console.warn("Geolocation denied, staying at San Jose");
                }
            );
        }
    }, []);

    const searchRestaurants = async (searchQuery) => {
        if (!searchQuery) return;
        
        try {
            // Build URL with dietary restrictions if enabled
            let url = `${API_BASE_URL}/yelp/restaurants?q=${searchQuery}&lat=${center[0]}&lon=${center[1]}`;
            
            // Add dietary restriction filtering if enabled and user has restrictions
            if (filterByRestrictions && userRestrictions.length > 0) {
                const restrictionIds = userRestrictions.map(r => r.id).join(',');
                url += `&restrictionIds=${restrictionIds}`;
                console.log('Searching with restrictions:', restrictionIds);
            }
            
            const response = await fetch(url, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const data = await response.json();
            console.log('Search results:', data);
            setRestaurants(data.businesses || []);
        } catch (error) {
            console.error('Error searching restaurants:', error);
        }
    };

    return (
        <>
            <header className="topbar">
                <div className="header-left">
                    <h1 style={{ color: "white" }}>Map Search</h1>
                </div>
                <div className="header-center">
                    <input
                        type="text"
                        placeholder="Search restaurants..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                searchRestaurants(query);
                            }
                        }}
                    />
                </div>
                <div className="header-right" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    marginRight: '20px' 
                }}>
                    {userRestrictions.length > 0 && (
                        <label style={{ 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            <input
                                type="checkbox"
                                checked={filterByRestrictions}
                                onChange={(e) => setFilterByRestrictions(e.target.checked)}
                                style={{ 
                                    width: '18px', 
                                    height: '18px', 
                                    cursor: 'pointer' 
                                }}
                            />
                            <span>
                                Filter by my dietary restrictions ({userRestrictions.length})
                            </span>
                        </label>
                    )}
                </div>
            </header>

            <MapContainer center={center} zoom={13} style={{ height: "90vh" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} />

                {/* User location marker */}
                <Marker position={center} icon={redIcon}>
                    <Popup>
                        {center[0] === 37.3382 && center[1] === -121.8863
                            ? "Default: San Jose"
                            : "You are here"}
                    </Popup>
                </Marker>

                {/* Restaurant markers */}
                {restaurants && restaurants.map((r) => (
                    <Marker
                        key={r.id}
                        position={[r.coordinates.latitude, r.coordinates.longitude]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <strong style={{ fontSize: '16px' }}>{r.name}</strong> <br />
                                {r.source === 'database' && (
                                    <span style={{ color: 'green', fontWeight: 'bold' }}>
                                        📍 Local Restaurant<br />
                                    </span>
                                )}
                                {r.matches_restrictions && (
                                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>
                                        ✓ Matches your dietary needs<br />
                                    </span>
                                )}
                                ⭐ {r.rating} <br />
                                <span style={{ fontSize: '14px', color: '#666' }}>
                                    {r.location?.address1 || r.address || 'Address not available'}
                                </span>
                                <br />
                                
                                {/* Show menu button if restaurant has food */}
                                {r.available_items > 0 && r.db_id && (
                                    <>
                                        <span style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                                            ✓ {r.available_items} items available
                                        </span>
                                        <br />
                                        <button 
                                            onClick={() => {
                                                if (onRestaurantClick) {
                                                    onRestaurantClick(r.db_id);
                                                }
                                            }}
                                            style={{
                                                marginTop: '10px',
                                                padding: '8px 16px',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                width: '100%'
                                            }}
                                        >
                                            View Menu →
                                        </button>
                                    </>
                                )}
                                
                                {/* Show message for restaurants without food or Yelp restaurants */}
                                {(!r.available_items || r.available_items === 0) && r.source === 'database' && (
                                    <span style={{ color: '#999', fontSize: '12px' }}>
                                        <br />No items currently available
                                    </span>
                                )}
                                {r.source === 'yelp' && (
                                    <span style={{ color: '#666', fontSize: '12px' }}>
                                        <br />External restaurant (menu not available)
                                    </span>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </>
    );
}