import React from "react";
const OrdersTab = ({orders, updateOrderStatus}) => (
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

  export default OrdersTab;