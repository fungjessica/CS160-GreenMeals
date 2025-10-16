// 🧭 MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

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

export default function MapView({ center, restaurants, redIcon }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: "90vh" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User marker */}
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
  );
}
