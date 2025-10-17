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

export default function MapView({ token }) {
    // Default center = San Jose
    const [center, setCenter] = useState([37.3382, -121.8863]);
    const [query, setQuery] = useState("");
    const [restaurants, setRestaurants] = useState([]);

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
            const response = await fetch(
                `${API_BASE_URL}/yelp/restaurants?q=${searchQuery}&lat=${center[0]}&lon=${center[1]}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            setRestaurants((data.businesses || []).slice(0, 10));
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
                        {r.name} <br /> ⭐ {r.rating} <br />
                        {r.location?.address1}
                    </Popup>
                </Marker>
            ))}
            </MapContainer>
        </>
    );
}