import React, { useEffect, useState } from 'react';
const API_BASE_URL = 'http://localhost:3001/api';
const OrdersTab = ({ cart, setCart, token }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("📦 Orders from backend:", data);
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  // Group cart items by restaurant_id
  const groupedByRestaurant = cart.reduce((acc, item) => {
    const key = item.restaurant_id;
    if (!acc[key]) {
      acc[key] = {
        restaurant_name: item.restaurant_name || 'Unknown Restaurant',
        items: [],
        subtotal: 0,
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
  const handlePlaceOrder = async () => {
    try {
      if (cart.length === 0) return alert("Your cart is empty!");
  
      //Group items by restaurant (so each restaurant gets its own order)

      for (const [restaurantId, group] of Object.entries(groupedByRestaurant)) {
        const body = {
          restaurantId: parseInt(restaurantId),
          pickupSlotId: 1, // for simplification, just let only 1 slot for customers to pick up
          totalAmount: group.subtotal,
          foodItems: group.items.map((i) => ({
            foodId: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
        };
  
        // Send request
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          console.error("❌ Failed to checkout:", await response.text());
          alert("Checkout failed for one of your restaurants.");
          return;
        }
  
        console.log("✅ Order placed for restaurant:", restaurantId);
      }
  
      // Clear cart
      setCart([]);
  
      // Reload orders from backend
      loadOrders();
  
      alert("🎉 Order successfully placed!.");
  
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Something went wrong during checkout.");
    }
  };
  const handlePay = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pay`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to mark order as paid.");
        return;
      }
  
      alert(" Order marked as paid!");
      loadOrders(); // refresh the list
    } catch (err) {
      console.error("Pay order error:", err);
      alert("Server error while marking order as paid.");
    }
  };
  
  
  return (
        <div className="max-w-5xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4">My Orders</h2>
          
          {/* 🛒 Current Cart */}
          {cart && cart.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4 text-lg">🛒 Current Cart</h3>

    {/* Loop through each restaurant group */}
    {Object.values(groupedByRestaurant).map((group, idx) => (
      <div key={idx} className="mb-4">
        <h4 className="font-bold text-green-700 mb-2">{group.restaurant_name}</h4>

        {group.items.map((item, i) => (
          <div key={i} className="flex justify-between text-gray-800 py-1">
            <span>• {item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <div className="flex justify-between font-semibold mt-2 border-t border-gray-300 pt-2">
          <span>Subtotal:</span>
          <span>${group.subtotal.toFixed(2)}</span>
        </div>
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
      
          {/* 🧾 Past Orders from Backend */}
          {orders.length === 0 ? (
            <p className="text-gray-500">You have no history orders.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">🏠<strong> {order.restaurant_name}</strong></p>
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
