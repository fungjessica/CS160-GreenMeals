import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import Orders from "./Components/Orders";

// Component to dynamically update map view
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

function MapPage() {
    // Default center = San Jose
    const [center, setCenter] = useState([37.3382, -121.8863]);
    const [query, setQuery] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle search (calls Flask backend at /restaurants)
    const searchRestaurants = async (q) => {
        if (!q) return;

        console.log("Searching for:", q);
        try {
            const response = await fetch(
                `/restaurants?q=${q}&lat=${center[0]}&lon=${center[1]}`
            );
            const data = await response.json();
            setRestaurants(data.businesses || []);
        } catch (err) {
            console.error("Search failed:", err);
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
                <div className="header-right" ref={dropdownRef}>
                    <div className="profile-wrapper">
                        <button
                            className="profile-button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                alt="Profile"
                                width={32}
                                height={32}
                            />
                        </button>
                        {dropdownOpen && (
                            <div className="profile-menu">
                                <button className="menu-item" onClick={() => {}}>
                                    Profile
                                </button>
                                <button className="menu-item" onClick={() => navigate("/orders")}>
                                    Orders
                                </button>
                                <div className="divider" />
                                <button className="menu-item" onClick={() => {}}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
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
                {restaurants.map((r) => (
                    <Marker
                        key={r.id}
                        position={[r.coordinates.latitude, r.coordinates.longitude]}
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

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MapPage />} />
                <Route path="/orders" element={<Orders />} />
            </Routes>
        </Router>
    );
}
