import "./styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, divIcon, point } from "leaflet";

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="header-left">
          <h1>Map Search</h1>
        </div>
        <div className="header-center">
          <input type="text" placeholder="Search restaurants..." />
        </div>
      </header>

      <MapContainer center={[37.3382, -121.8863]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  );
}
