import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Filter, Clock, ShoppingBag, User, CheckCircle, XCircle, Plus, Edit, Trash2, LogOut, Map as MapIcon } from 'lucide-react';
import ProfileTab from './ProfileTab';
import SearchResTab from './SearchResTab';
import OrdersTab from './OrdersTab';
import MapView from './MapView';
import RestaurantDetailTab from './RestaurantDetailTab';
const API_BASE_URL = 'http://localhost:3001/api';

const CustomerDashboard = ({ user, token, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [allRestrictions, setAllRestrictions] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [yelpRestaurants, setYelpRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [pickupSlots, setPickupSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [userLocation, setUserLocation] = useState({ lat: 37.3382, lng: -121.8863 });
    const [showMap, setShowMap] = useState(false);
    const [query, setQuery] = useState("");
    const [center, setCenter] = useState([37.3382, -121.8863]);
    const [markers, setMarkers] = useState([]);


      const handleRestaurantClick = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setActiveTab('restaurant-detail');
    };
    useEffect(() => {
      loadAllRestrictions();
      loadOrders();
    }, []);
    // const redIcon = new L.Icon({
    //     iconUrl:
    //         "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    //     shadowUrl:
    //         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowSize: [41, 41],
    // });
    
    useEffect(() => {
        loadAllRestrictions();
        loadOrders();
    }, []);

    useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        (pos) => {
            const newLat = pos.coords.latitude;
            const newLng = pos.coords.longitude;
            if (newLat !== center[0] || newLng !== center[1]) {
            setCenter([newLat, newLng]);
            }
        }
        );
    }
    }, []);

      const loadAllRestrictions = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/dietary-restrictions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setAllRestrictions(data);
        } catch (error) {
          console.error('Error loading restrictions:', error);
        }
      };
    
      const updateRestrictions = async (restrictionIds) => {
        try {
          await fetch(`${API_BASE_URL}/users/restrictions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ restrictionIds })
          });
          alert('Dietary restrictions updated!');
          window.location.reload();
        } catch (error) {
          console.error('Error updating restrictions:', error);
        }
      };
      
  const searchYelpRestaurants = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/yelp/restaurants?lat=${userLocation.lat}&lon=${userLocation.lng}&q=food&radius=5000`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setYelpRestaurants(data.businesses || []);
      setShowMap(true);
    } catch (error) {
      console.error('Error searching Yelp:', error);
    }
  };

  const loadMenu = async (restaurantId) => {
    try {
      const restrictionIds = user.dietaryRestrictions.map(r => r.id);
      const params = new URLSearchParams();
      restrictionIds.forEach(id => params.append('restrictionIds', id));
      
      const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}/menu?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMenu(data);
      setSelectedRestaurant(restaurants.find(r => r.id === restaurantId));
      loadPickupSlots(restaurantId, selectedDate);
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const loadPickupSlots = async (restaurantId, date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}/pickup-slots?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPickupSlots(data);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };
  const addToCart = (food) => {
    const restaurant = selectedRestaurant || restaurants.find(r => r.id === food.restaurant_id);
    
    const foodWithRestaurant = {
      ...food,
      restaurant_id: restaurant?.id,
      restaurant_name: restaurant?.name || 'Unknown Restaurant',
    };
  
    const existing = cart.find(
      item => item.id === food.id && item.restaurant_id === foodWithRestaurant.restaurant_id
    );
  
    if (existing) {
      setCart(cart.map(item =>
        item.id === food.id && item.restaurant_id === foodWithRestaurant.restaurant_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...foodWithRestaurant, quantity: 1 }]);
    }
  
    alert(`${food.name} has been added to ${foodWithRestaurant.restaurant_name}'s cart!`);
  };
  
  

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - item.discount_percent / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);
  };

  const placeOrder = async () => {
    if (!selectedSlot) {
      alert('Please select a pickup time');
      return;
    }

    try {
      const foodItems = cart.map(item => ({
        foodId: item.id,
        quantity: item.quantity,
        price: item.price * (1 - item.discount_percent / 100)
      }));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.id,
          foodItems,
          pickupSlotId: selectedSlot.id,
          totalAmount: calculateTotal()
        })
      });

      if (response.ok) {
        alert('Order placed successfully!');
        setCart([]);
        setSelectedSlot(null);
        setSelectedRestaurant(null);
        loadOrders();
        setActiveTab('orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    
    try {
      await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

//   const SearchTab = () => (
//     <MapView 
//       token={token} 
//       onRestaurantClick={handleRestaurantClick}
//       userRestrictions={user.dietaryRestrictions || []}
//     />
//   );

      return (
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-green-600">Green Meals</h1>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  Profile
                </button>
                <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-lg ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  Search
                </button>
                <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  Map
                </button>
                <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  Orders
                </button>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-600 text-white">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </nav>
         <main className={activeTab === 'profile' ? 'py-0' : 'py-8'}>
            {activeTab === 'profile' && (  
            <ProfileTab
            user={user}
            allRestrictions={allRestrictions}
            updateRestrictions={updateRestrictions}
            />)}
            {activeTab === 'search' &&(
                <SearchResTab  
                token={token}
                handleRestaurantClick={handleRestaurantClick}
                />)}
            {/* {activeTab === 'map' && <SearchTab />} */}
            {activeTab === 'orders' && <OrdersTab cart={cart} setCart={setCart} token={token} />}
            
            {activeTab === 'restaurant-detail' && selectedRestaurant && (
              <RestaurantDetailTab 
              restaurant={selectedRestaurant}
              onBack={() => setActiveTab('search')}
              token={token}
              addToCart={addToCart}
              />
            )}
          </main>
        </div>
      );

}

export default CustomerDashboard;