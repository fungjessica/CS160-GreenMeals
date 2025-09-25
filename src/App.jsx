import "./styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);

    // Call backend when query changes
  const searchRestaurants = async () => {
    console.log(`🔍 Searching Yelp for: ${query}`);
    const response = await fetch(
      `/restaurants?q=${query}&lat=37.3382&lon=-121.8863`
    );
    const data = await response.json();
    setRestaurants(data.businesses || []);
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
              searchRestaurants();
            }
          }}
        />
        </div>
      </header>

      <MapContainer center={[37.3382, -121.8863]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            position={[r.coordinates.latitude, r.coordinates.longitude]}
          >
            <Popup>
              <strong>{r.name}</strong>
              <br />
              {r.location.address1}
              <br />⭐ {r.rating}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
