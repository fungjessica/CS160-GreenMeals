import "./styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, divIcon, point } from "leaflet";
import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");

  const restaurants = [
    { name: "Pizza Palace", lat: 37.334, lon: -121.884 },
    { name: "Sushi Spot", lat: 37.338, lon: -121.890 },
    { name: "Burger Joint", lat: 37.342, lon: -121.880 },
  ];

  // Filter restaurants by query
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <header className="topbar">
        <div className="header-left">
          <h1>Map Search</h1>
        </div>
        <div className="header-center">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <MapContainer center={[37.3382, -121.8863]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((r, idx) => (
          <Marker key={idx} position={[r.lat, r.lon]}>
            <Popup>{r.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
