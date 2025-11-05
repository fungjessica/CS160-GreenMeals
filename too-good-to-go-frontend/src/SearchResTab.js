import React, { useState } from "react";
import MapView from "./MapView";

const API_BASE_URL = "http://localhost:3001/api";

const SearchResTab = ({ token, user, dietaryRestrictions}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false); // Toggle between views

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/customer/restaurant/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    console.log("Restaurant clicked:", restaurant);
    // You could navigate or show details here
  };

  return (
    <div className="p-4">
      {/* Toggle View Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {showMap ? "Map View" : "Search Restaurants"}
        </h2>
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showMap ? "Show Search" : "Show Map"}
        </button>
      </div>

      {/* Conditional Rendering */}
      {showMap ? (
        <MapView 
            token={token} 
            onRestaurantClick={handleRestaurantClick}
            userRestrictions={dietaryRestrictions || []}
        />
      ) : (
        <div>
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or cuisine..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Search
            </button>
          </form>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.length === 0 ? (
                <p className="text-gray-500 italic">No restaurants found.</p>
              ) : (
                results.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => handleRestaurantClick(r)}
                    className="border rounded-lg p-4 hover:shadow-lg cursor-pointer transition"
                  >
                    <h3 className="font-bold text-lg">{r.name}</h3>
                    <p className="text-gray-600">{r.cuisine_type}</p>
                    <p className="text-gray-500 text-sm">{r.address}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResTab;
