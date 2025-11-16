import React from "react";
import { useState,useEffect } from "react";
const API_BASE_URL = 'http://localhost:3001/api';
const RestaurantDetailTab = ({ restaurant, token, addToCart, onBack }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("Restaurant prop:", restaurant);
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
    addToCart(food); //
  };


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

        <div className="grid gap-4">
          {menu.map(food => (
            <div key={food.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{food.name}</h3>
                  <p className="text-gray-600 mb-3">{food.description}</p>
                  <div className="flex gap-4 mb-2">
                    <span className="text-lg font-bold text-green-600">
                      ${(food.price * (1 - food.discount_percent / 100)).toFixed(2)}
                    </span>
                    {food.discount_percent > 0 && (
                      <>
                        <span className="text-gray-400 line-through">${food.price}</span>
                        <span className="text-red-600 font-semibold">{food.discount_percent}% OFF</span>
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
                  onClick={() => handleAddToCart(food)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default RestaurantDetailTab;