import React from "react";
import { useState } from "react";
const API_BASE_URL = 'http://localhost:3001/api';
const EditInfoTab = ({restaurant, token, loadRestaurant}) => {
    const [formData, setFormData] = useState({
      name: restaurant?.name || '',
      address: restaurant?.address || '',
      cuisine_type: restaurant?.cuisine_type || '',
      phone: restaurant?.phone || ''
    });
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${API_BASE_URL}/restaurant/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) throw new Error('Failed to update');
        alert('Restaurant information updated successfully!');
        loadRestaurant(); // refresh data
      } catch (error) {
        console.error('Update error:', error);
        alert('Error updating restaurant information');
      }
    };
  
    return (
      <div className="max-w-3xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Edit Restaurant Information</h2>
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Cuisine Type"
            value={formData.cuisine_type}
            onChange={(e) => setFormData({...formData, cuisine_type: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
  
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    );
  };
  

export default EditInfoTab;