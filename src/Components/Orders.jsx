import React, { useState } from "react";

const Orders = () => {
    // timestamps every 30 mins 
    function generateTimeOptions(){
        const options = [];
        const start = new Date();

        // hardcoded time, change to either store's opening hours or when they accept too good to go orders
        for (let i = 0; i <= 24; i++) {
            start.setHours(8, 0, 0, 0); 
            
            const option = new Date(start.getTime() + i * 30 * 60 * 1000);
            if (option.getHours() > 20 || (option.getHours() === 20 && option.getMinutes() > 0)) break;

            // format as hh:mm
            const hh = option.getHours().toString().padStart(2, "0");
            const mm = option.getMinutes().toString().padStart(2, "0");
            const label = option.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            options.push({ value: `${hh}:${mm}`, label });
        }
        return options;
    }
    const timeOptions = generateTimeOptions();

    // hardcoded data to test
    const [orders, setOrders] = useState([
        {
        id: 1,
        restaurant: "Green Bowl",
        item: "Vegan Buddha Bowl",
        pickupTime: "2025-10-10T13:00", 
        status: "Pending",
        },
        {
        id: 2,
        restaurant: "Zero Waste Bakery",
        item: "Day-Old Croissant Pack",
        pickupTime: "2025-10-09T17:30",
        status: "Completed",
        },
    ]);

    const handlePickupChange = (id, newTimePart) => {
        setOrders((prev) =>
        prev.map((o) => {
            if (o.id !== id) return o;

            const orig = new Date(o.pickupTime);
            const [hours, minutes] = newTimePart.split(":");
            orig.setHours(Number(hours), Number(minutes), 0, 0);

            // format as yyyy-mm-dd in local time (pst for san jose)
            const year = orig.getFullYear();
            const month = (orig.getMonth() + 1).toString().padStart(2, "0");
            const day = orig.getDate().toString().padStart(2, "0");
            const hh = orig.getHours().toString().padStart(2, "0");
            const mm = orig.getMinutes().toString().padStart(2, "0");
            const localIso = `${year}-${month}-${day}T${hh}:${mm}`;
            return { ...o, pickupTime: localIso };
        })
        );
        // backend here
    };

    return (
        <div className="orders-page">
        <h1>Orders</h1>
        {orders.length === 0 ? (
            <p>You have no orders yet.</p>
        ) : (
            <ul className="order-list">
            {orders.map((order) => (
                <li key={order.id} className="order-card">
                <h2>{order.item}</h2>
                <p><strong>Restaurant:</strong> {order.restaurant}</p>
                <p><strong>Status:</strong> {order.status}</p>

                <label>
                    <strong>Pickup Time:</strong>{" "}
                    {order.status === "Pending" ? (
                    <select
                        value={
                        (() => {
                            const d = new Date(order.pickupTime);
                            if (isNaN(d.getTime())) {
                            return "12:00";
                            }
                            const hh = d.getHours().toString().padStart(2, "0");
                            const mm = d.getMinutes().toString().padStart(2, "0");
                            return `${hh}:${mm}`;
                        })()
                        }
                        onChange={(e) =>
                        handlePickupChange(order.id, e.target.value)
                        }
                    >
                        {timeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                        ))}
                    </select>
                    ) : (
                    <span>
                        {new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    )}
                </label>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
    };

export default Orders;