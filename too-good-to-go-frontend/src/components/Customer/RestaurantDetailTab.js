import React from "react";
import { useState, useEffect } from "react";

const API_BASE_URL = 'http://localhost:3001/api';

const RestaurantDetailTab = ({ restaurant, token, addToCart, onBack, userRestrictions = [] }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantSpecificPickup, setRestaurantSpecificPickup] = useState(false);
  const [filterByRestrictions, setFilterByRestrictions] = useState(false);

  console.log("Restaurant prop:", restaurant);
  console.log("User restrictions:", userRestrictions);

  useEffect(() => {
    if (restaurant?.id) {
      loadRestaurantDetails(restaurant.id);
    }
  }, [restaurant]);

  const loadRestaurantDetails = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/customer/restaurant/${id}/menu`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Error loading menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (food) => {
    addToCart(food);
  };

  // Filter menu items based on dietary restrictions
  const filteredMenu = filterByRestrictions && userRestrictions.length > 0
    ? menu.filter(item => {
        // Get item's dietary restrictions
        let itemRestrictions = [];
        
        if (item.dietaryCompliance && Array.isArray(item.dietaryCompliance)) {
          itemRestrictions = item.dietaryCompliance.map(dc => dc.restriction_name);
        } else if (item.dietary_tags) {
          itemRestrictions = item.dietary_tags.split(',').map(tag => tag.trim());
        }
        
        // Check if item satisfies ALL user restrictions
        const userRestrictionNames = userRestrictions.map(r => r.restriction_name);
        return userRestrictionNames.every(restrictionName => 
          itemRestrictions.includes(restrictionName)
        );
      })
    : menu;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Back to Map
      </button>

      <h2 className="text-3xl font-bold mb-6">Menu</h2>

      {/* Dietary Restrictions Filter */}
      {userRestrictions.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filterByRestrictions}
            onChange={(e) => setFilterByRestrictions(e.target.checked)}
          />
          <label className="text-sm text-gray-700">
            Show only items matching my dietary restrictions ({userRestrictions.length})
          </label>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={restaurantSpecificPickup}
          onChange={(e) => setRestaurantSpecificPickup(e.target.checked)}
        />
        <label className="text-sm text-gray-700">
          Want to pick up at a specific time?
        </label>
      </div>

      {/* Show count of filtered items */}
      {filterByRestrictions && (
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredMenu.length} of {menu.length} items
        </p>
      )}

      <div className="grid gap-4">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((food) => (
            <div key={food.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{food.name}</h3>
                  <p className="text-gray-600 mb-3">{food.description}</p>

                  {/* Show dietary tags if available */}
                  {(food.dietaryCompliance || food.dietary_tags) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {food.dietaryCompliance?.map((restriction, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {restriction.restriction_name}
                        </span>
                      )) || food.dietary_tags?.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 mb-2">
                    <span className="text-lg font-bold text-green-600">
                      ${(food.price * (1 - food.discount_percent / 100)).toFixed(2)}
                    </span>
                    {food.discount_percent > 0 && (
                      <>
                        <span className="text-gray-400 line-through">
                          ${food.price}
                        </span>
                        <span className="text-red-600 font-semibold">
                          {food.discount_percent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    Available: {food.available_quantity} items
                  </p>
                  <p className="text-sm text-gray-600">
                    Pickup: {food.pickup_start} - {food.pickup_end}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleAddToCart({
                      ...food,
                      specificPickup: restaurantSpecificPickup, 
                    })
                  }
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {filterByRestrictions 
              ? "No menu items match your dietary restrictions" 
              : "No menu items available"}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailTab;