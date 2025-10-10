import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Filter, Clock, ShoppingBag, User, CheckCircle, XCircle, Plus, Edit, Trash2, LogOut, Map as MapIcon } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <AuthScreen setToken={setToken} />;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return user.user.role === 'restaurant' ? (
    <RestaurantDashboard user={user} token={token} handleLogout={handleLogout} />
  ) : (
    <CustomerDashboard user={user} token={token} handleLogout={handleLogout} />
  );
};

// ============ AUTH SCREEN ============
const AuthScreen = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    restaurantId: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">Too Good To Go</h1>
        
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 font-semibold ${isLogin ? 'bg-green-600 text-white' : 'bg-gray-200'} rounded-l-lg`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 font-semibold ${!isLogin ? 'bg-green-600 text-white' : 'bg-gray-200'} rounded-r-lg`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border rounded-lg"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 border rounded-lg"
            required
          />

          {!isLogin && (
            <>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border rounded-lg"
              />
              
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant Owner</option>
              </select>

              {formData.role === 'restaurant' && (
                <input
                  type="number"
                  placeholder="Restaurant ID (1-5)"
                  value={formData.restaurantId}
                  onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Test accounts: customer@test.com / owner@greenplate.com (password: anything)
        </p>
      </div>
    </div>
  );
};

// ============ CUSTOMER DASHBOARD ============
const CustomerDashboard = ({ user, token, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [allRestrictions, setAllRestrictions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [yelpRestaurants, setYelpRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pickupSlots, setPickupSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userLocation, setUserLocation] = useState({ lat: 37.3382, lng: -121.8863 });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadAllRestrictions();
    loadOrders();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Using default location');
        }
      );
    }
  };

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

  const searchRestaurants = async () => {
    try {
      const restrictionIds = user.dietaryRestrictions.map(r => r.id);
      const params = new URLSearchParams({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: 10
      });
      
      restrictionIds.forEach(id => params.append('restrictionIds', id));
      
      const response = await fetch(`${API_BASE_URL}/restaurants/search?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error searching restaurants:', error);
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
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu?${params}`, {
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
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/pickup-slots?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPickupSlots(data);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const addToCart = (food) => {
    const existing = cart.find(item => item.id === food.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
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

  const ProfileTab = () => {
    const [selectedIds, setSelectedIds] = useState(user.dietaryRestrictions.map(r => r.id));

    const toggleRestriction = (id) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(rid => rid !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    };

    const groupedRestrictions = allRestrictions.reduce((acc, r) => {
      if (!acc[r.restriction_type]) acc[r.restriction_type] = [];
      acc[r.restriction_type].push(r);
      return acc;
    }, {});

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <p><strong>Name:</strong> {user.user.name}</p>
          <p><strong>Email:</strong> {user.user.email}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Dietary Restrictions</h3>
          
          {Object.entries(groupedRestrictions).map(([type, restrictions]) => (
            <div key={type} className="mb-6">
              <h4 className="font-semibold text-lg mb-3 capitalize">
                {type.replace('_', ' ')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {restrictions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => toggleRestriction(r.id)}
                    className={`p-3 rounded-lg border-2 ${
                      selectedIds.includes(r.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{r.restriction_name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => updateRestrictions(selectedIds)}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  const SearchTab = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Find Restaurants</h2>
        <div className="flex gap-4">
          <button
            onClick={searchRestaurants}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            Search Our Restaurants
          </button>
          <button
            onClick={searchYelpRestaurants}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center"
          >
            <MapIcon className="w-5 h-5 mr-2" />
            Discover Nearby (Yelp)
          </button>
        </div>
        {user.dietaryRestrictions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <span>Filtering by:</span>
            {user.dietaryRestrictions.map(r => (
              <span key={r.id} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                {r.restriction_name}
              </span>
            ))}
          </div>
        )}
      </div>

      {showMap && yelpRestaurants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Nearby Restaurants (Yelp)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yelpRestaurants.map((rest, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <h4 className="font-bold">{rest.name}</h4>
                <p className="text-sm text-gray-600">{rest.categories?.[0]?.title}</p>
                <p className="text-sm">⭐ {rest.rating} ({rest.review_count} reviews)</p>
                <p className="text-sm">{(rest.distance / 1000).toFixed(1)} km away</p>
                <p className="text-xs text-gray-500">{rest.location?.address1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine_type}</p>
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{restaurant.distance?.toFixed(1)} km</span>
            </div>
            <button
              onClick={() => loadMenu(restaurant.id)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              View Menu
            </button>
          </div>
        ))}
      </div>

      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
                <button onClick={() => { setSelectedRestaurant(null); setCart([]); }}>
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Available Items</h3>
              {menu.map(food => (
                <div key={food.id} className="border rounded-lg p-4 mb-4 flex justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{food.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{food.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="line-through text-gray-400">${food.price}</span>
                      <span className="text-green-600 font-bold">
                        ${(food.price * (1 - food.discount_percent / 100)).toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                        {food.discount_percent}% off
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {food.dietaryCompliance?.map(dc => (
                        <span key={dc.id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {dc.restriction_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(food)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-4"
                  >
                    Add
                  </button>
                </div>
              ))}

              {cart.length > 0 && (
                <>
                  <div className="border-t pt-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Cart</h3>
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between mb-3 bg-gray-50 p-3 rounded">
                        <div>
                          <span className="font-semibold">{item.name}</span>
                          <span className="ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-bold">
                          ${(item.price * (1 - item.discount_percent / 100) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="text-right text-xl font-bold">
                      Total: ${calculateTotal().toFixed(2)}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold mb-4">Select Pickup Time</h3>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        loadPickupSlots(selectedRestaurant.id, e.target.value);
                        setSelectedSlot(null);
                      }}
                      className="mb-4 p-2 border rounded-lg"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {pickupSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={slot.available_slots === 0}
                          className={`p-3 rounded-lg border-2 ${
                            selectedSlot?.id === slot.id ? 'border-blue-500 bg-blue-50' :
                            slot.available_slots === 0 ? 'border-gray-300 bg-gray-100 opacity-50' :
                            'border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-semibold">
                            {new Date(slot.slot_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs">{slot.available_slots} left</div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={placeOrder}
                      disabled={!selectedSlot}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const OrdersTab = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{order.restaurant_name}</h3>
                  <p className="text-sm text-gray-600">{order.restaurant_address}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {new Date(order.slot_start).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="mt-3">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm">• {item.food_name} x{item.quantity}</p>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <span className="font-bold text-lg">${order.total_amount}</span>
                {order.status === 'pending' && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Too Good To Go</h1>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Profile
            </button>
            <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-lg ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Search
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
      <main className="py-8">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </main>
    </div>
  );
};

// ============ RESTAURANT DASHBOARD ============
const RestaurantDashboard = ({ user, token, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allRestrictions, setAllRestrictions] = useState([]);

  useEffect(() => {
    loadRestaurant();
    loadInventory();
    loadOrders();
    loadRestrictions();
  }, []);

  const loadRestaurant = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant/my-restaurant`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRestaurant(data);
    } catch (error) {
      console.error('Error loading restaurant:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadRestrictions = async () => {
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`${API_BASE_URL}/restaurant/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteFood = async (foodId) => {
    if (!window.confirm('Delete this item?')) return;
    
    try {
      await fetch(`${API_BASE_URL}/restaurant/foods/${foodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadInventory();
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const AddFoodModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      discount_percent: '',
      available_quantity: '',
      pickup_start: '',
      pickup_end: '',
      dietary_restriction_ids: []
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE_URL}/restaurant/foods`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        setShowAddModal(false);
        loadInventory();
      } catch (error) {
        console.error('Error adding food:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Add Food Item</h2>
            <button onClick={() => setShowAddModal(false)}>
              <XCircle className="w-8 h-8" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border rounded-lg"
              rows="3"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Discount %"
                value={formData.discount_percent}
                onChange={(e) => setFormData({...formData, discount_percent: e.target.value})}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <input
              type="number"
              placeholder="Available Quantity"
              value={formData.available_quantity}
              onChange={(e) => setFormData({...formData, available_quantity: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                placeholder="Pickup Start"
                value={formData.pickup_start}
                onChange={(e) => setFormData({...formData, pickup_start: e.target.value})}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="time"
                placeholder="Pickup End"
                value={formData.pickup_end}
                onChange={(e) => setFormData({...formData, pickup_end: e.target.value})}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Dietary Tags</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-3 rounded-lg">
                {allRestrictions.map(r => (
                  <label key={r.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietary_restriction_ids.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            dietary_restriction_ids: [...formData.dietary_restriction_ids, r.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            dietary_restriction_ids: formData.dietary_restriction_ids.filter(id => id !== r.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{r.restriction_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Add Food Item
            </button>
          </form>
        </div>
      </div>
    );
  };

  const InventoryTab = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Food Item
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          No items yet. Add your first food item!
        </div>
      ) : (
        <div className="grid gap-4">
          {inventory.map(food => (
            <div key={food.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{food.name}</h3>
                  <p className="text-gray-600 mb-3">{food.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Price:</span>
                      <p className="font-semibold">${food.price}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Discount:</span>
                      <p className="font-semibold">{food.discount_percent}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <p className="font-semibold">{food.available_quantity}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Pickup:</span>
                      <p className="font-semibold text-sm">{food.pickup_start} - {food.pickup_end}</p>
                    </div>
                  </div>
                  {food.dietary_tags && (
                    <div className="flex gap-2 flex-wrap">
                      {food.dietary_tags.split(',').map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteFood(food.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const OrdersTab = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id}</h3>
                  <p className="text-sm">Customer: {order.customer_name}</p>
                  <p className="text-sm">Phone: {order.customer_phone}</p>
                  <p className="text-sm">
                    Pickup: {new Date(order.slot_start).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`px-3 py-2 rounded-lg font-semibold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold mb-2">Items:</p>
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm">
                    • {item.food_name} x{item.quantity} - ${item.price.toFixed(2)}
                  </p>
                ))}
                <p className="font-bold text-lg mt-3">Total: ${order.total_amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600">Too Good To Go</h1>
            <p className="text-sm text-gray-600">Restaurant Dashboard - {restaurant?.name}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Orders
            </button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-600 text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="py-8">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </main>

      {showAddModal && <AddFoodModal />}
    </div>
  );
};

export default App;