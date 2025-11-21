import React, { useEffect, useState } from 'react';
const API_BASE_URL = 'http://localhost:3001/api';

const OrdersTab = ({ cart, setCart, token }) => {
  const [orders, setOrders] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({}); // track pickup times per restaurant
  const [orderTimes, setOrderTimes] = useState({}); // track pickup times per order
  const [localSpecificPickup, setLocalSpecificPickup] = useState({}); // track specific pickup locally
  const [savedPickupWindows, setSavedPickupWindows] = useState({});

useEffect(() => {
  const savedTimes = JSON.parse(localStorage.getItem('orderTimes') || '{}');
  const savedSpecific = JSON.parse(localStorage.getItem('localSpecificPickup') || '{}');
  const savedWindows = JSON.parse(localStorage.getItem('savedPickupWindows') || '{}');
  setSavedPickupWindows(savedWindows);

  setOrderTimes(savedTimes);
  setLocalSpecificPickup(savedSpecific);

  loadOrders();
}, []);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data);

      setOrderTimes((prev) => {
        const merged = {};
        data.forEach((order) => {
          merged[order.id] = prev[order.id] || '';
        });

        localStorage.setItem('orderTimes', JSON.stringify(merged));

        return merged;
      });
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  // helper: generate available pickup time options
  const generateTimeOptions = (start, end, interval = 30) => {
    if (!start || !end) return [];

    let startDate;
    let endDate;

    if (typeof start === 'string' && (start.includes('T') || start.includes(' '))) {
      startDate = new Date(start);
      endDate = new Date(end);
    } else {
      const [sH, sM] = start.split(':').map(Number);
      const [eH, eM] = end.split(':').map(Number);
      startDate = new Date();
      startDate.setHours(sH || 0, sM || 0, 0, 0);
      endDate = new Date();
      endDate.setHours(eH || 0, eM || 0, 0, 0);
    }

    const options = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      options.push(
        current.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
      current.setMinutes(current.getMinutes() + interval);
    }

    return options;
  };

  // Group cart items by restaurant_id
  const groupedByRestaurant = cart.reduce((acc, item) => {
    const key = item.restaurant_id;
    if (!acc[key]) {
      acc[key] = {
        restaurant_name: item.restaurant_name || 'Unknown Restaurant',
        items: [],
        subtotal: 0,
        pickup_start: item.pickup_start || '09:00',
        pickup_end: item.pickup_end || '17:00',
      };
    }
    acc[key].items.push(item);
    acc[key].subtotal += (item.price * (1 - (item.discount_percent || 0) / 100)) * item.quantity;
    return acc;
  }, {});

  const total = Object.values(groupedByRestaurant).reduce(
    (sum, group) => sum + group.subtotal,
    0
  );

  const handleTimeChange = (restaurantId, time) => {
    setSelectedTimes((prev) => ({ ...prev, [restaurantId]: time }));
  };

  const handleOrderTimeChange = (orderId, time) => {
    setOrderTimes((prev) => ({ ...prev, [orderId]: time }));
  };

  const handlePlaceOrder = async () => {
    try {
      if (cart.length === 0) return alert('Your cart is empty!');

      // group orders by restaurant
      for (const [restaurantId, group] of Object.entries(groupedByRestaurant)) {
        const body = {
          restaurantId: parseInt(restaurantId),
          pickupSlotId: 1, // simplification
          pickupTime: selectedTimes[restaurantId] || null,
          specificPickup: group.items.some(i => i.specificPickup),
          totalAmount: group.subtotal,
          foodItems: group.items.map((i) => ({
            foodId: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error('Failed to checkout:', await response.text());
          alert('Checkout failed for one of your restaurants.');
          return;
        }

        const result = await response.json();

        if (result && result.orderId) {
          const newOrderId = result.orderId;

          setOrderTimes((prev) => {
            const updated = {
              ...prev,
              [newOrderId]: selectedTimes[restaurantId] || '',
            };
            localStorage.setItem('orderTimes', JSON.stringify(updated));
            return updated;
          });

          if (group.items.some((i) => i.specificPickup)) {
            setLocalSpecificPickup((prev) => {
              const updated = {
                ...prev,
                [newOrderId]: true,
              };
              localStorage.setItem('localSpecificPickup', JSON.stringify(updated));
              return updated;
            });
          }

          setSavedPickupWindows(prev => {
            const updated = {
              ...prev,
              [newOrderId]: {
                start: group.pickup_start,
                end: group.pickup_end
              }
            };
            localStorage.setItem('savedPickupWindows', JSON.stringify(updated));
            return updated;
          });
        }
      }

      setCart([]);
      loadOrders();
  
      alert("Order successfully placed!.");
  
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Something went wrong during checkout.');
    }
  };

  const handlePay = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to mark order as paid.');
        return;
      }

      alert('Order marked as paid!');
      loadOrders();
    } catch (err) {
      console.error('Pay order error:', err);
      alert('Server error while marking order as paid.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>

      {/* Current Cart */}
      {cart && cart.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4 text-lg">🛒 Current Cart</h3>


    {/* Loop through each restaurant group */}
    {Object.entries(groupedByRestaurant).map(([restaurantId, group], idx) => (
      <div key={restaurantId} className="mb-4 relative border-b pb-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-green-700">{group.restaurant_name}</h4>
          <button
            onClick={() =>
              setCart(cart.filter(item => item.restaurant_id !== parseInt(restaurantId)))
            }
            className="text-red-500 hover:text-red-700 text-xl font-bold"
            title="Remove this restaurant's items"
          >
            ✖
          </button>
        </div>

        {group.items.map((item, i) => (
          <div key={i} className="flex justify-between text-gray-800 py-1">
            <span>• {item.name} × {item.quantity}</span>
            <span>
              ${(item.price * (1 - (item.discount_percent || 0) / 100) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

              <div className="flex justify-between font-semibold mt-2 border-t border-gray-300 pt-2">
                <span>Subtotal:</span>
                <span>${group.subtotal.toFixed(2)}</span>
              </div>

              {group.items.some((i) => i.specificPickup) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change Pickup Time:
                  </label>
                  <select
                    className="border rounded-md px-3 py-2 w-48"
                    value={selectedTimes[restaurantId] || ''}
                    onChange={(e) =>
                      handleTimeChange(restaurantId, e.target.value)
                    }
                  >
                    <option value="">Select time</option>
                    {generateTimeOptions(
                      group.pickup_start,
                      group.pickup_end
                    ).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}

    {/* Grand total */}
    <div className="flex justify-between font-bold text-lg border-t-2 border-yellow-400 pt-3">
      <span>Total:</span>
      <span>${total.toFixed(2)}</span>
    </div>
      <button onClick={handlePlaceOrder}
      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
        Place Order</button>
  </div>
)}
      
          {/* Past Orders from Backend */}
          {orders.length === 0 ? (
            <p className="text-gray-500">You have no history orders.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-500"><strong> {order.restaurant_name}</strong></p>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    Pickup time:{' '}
                    <span className="font-semibold">
                      {orderTimes[order.id] || 'Not set'}
                    </span>
                  </p>
                  {localSpecificPickup[order.id] &&
                   order.status === 'pending' &&
                   order.slot_start && order.slot_end && (
                    <div className="mt-1">
                     
                    </div>
                  )}
                </div>
      
                <div className="divide-y divide-gray-200">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1">
                      <span>{item.food_name} × {item.quantity}</span>
                      <span>${((item.discounted_price ?? item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
      
                <div className="flex justify-between mt-3 font-semibold items-center">
                  <span>Status: {order.status}</span>
                  <div className="flex items-center gap-3">
                    <span>Total: ${Number(order.total_amount).toFixed(2)}</span>
  </div>
</div>
              </div>
            ))
          )}
        </div>
      );
};

export default OrdersTab;