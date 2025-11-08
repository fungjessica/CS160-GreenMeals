import React, { useState, useEffect } from 'react';
import EditInfoTab from './EditInfoTab';
import InventoryTab from './InventoryTab';
import OrdersTab from './OrdersTab';
import ReportTab from './ReportTab';
import { Calendar, MapPin, Filter, Clock, ShoppingBag, User, CheckCircle, XCircle, Plus, Edit, Trash2, LogOut, Map as MapIcon } from 'lucide-react';



const API_BASE_URL = 'http://localhost:3001/api';
const RestaurantDashboard = ({ user, token, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('editInfo');
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [allRestrictions, setAllRestrictions] = useState([]);
    const [showAddInfoModal, setShowAddInfoModal] = useState(false);
  
    useEffect(() => {
      loadRestaurant();
      loadInventory();
      loadOrders();
      loadRestrictions();
    }, []);
  
    const loadRestaurant = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/owner/restaurant/my-restaurant`, {
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
        const response = await fetch(`${API_BASE_URL}/owner/restaurant/inventory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setInventory(Array.isArray(data) ? data : data.inventory || []);
      } catch (error) {
        console.error('Error loading inventory:', error);
      }
    };
  
    const loadOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/owner/restaurant/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
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
        await fetch(`${API_BASE_URL}/owner/restaurant/orders/${orderId}/status`, {
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
        await fetch(`${API_BASE_URL}/owner/restaurant/foods/${foodId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        loadInventory();
      } catch (error) {
        console.error('Error deleting food:', error);
      }
    };

    return (
        <div className="min-h-screen bg-gray-100">
                  <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600">Green Meals</h1>
            <p className="text-sm text-gray-600">Welcome, {restaurant?.name} !</p>
          </div>
          <div className="flex gap-4">
          <button
              onClick={() => setActiveTab('editInfo')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'editInfo' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Edit Information
            </button>
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
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Report
            </button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-600 text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
          <main>
            {activeTab === 'editInfo' && (
              <EditInfoTab
                restaurant={restaurant}
                token={token}
                reload={loadRestaurant}
              />
            )}
    
            {activeTab === 'inventory' && (
              <InventoryTab
                inventory={inventory}
                deleteFood={deleteFood}
                showAddModal={showAddModal}
                setShowAddModal={setShowAddModal}
                token={token}
                reload={loadInventory}
                allRestrictions={allRestrictions}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                updateOrderStatus={updateOrderStatus}
              />
            )}
            {activeTab === 'report' && (
              <ReportTab token={token} />
            )}
          </main>
        </div>
      );
}

export default RestaurantDashboard;
