import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

const SearchResTab = ({ token, handleRestaurantClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/restaurant/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Error searching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Search Restaurants</h2>

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

      {/* Results */}
      {loading ? (
        <p>Loading...</p>
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
