import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const API_BASE_URL = "http://localhost:3001/api";


const AddFoodModal = ({ token,loadInventory,setShowAddModal,allRestrictions}) => {
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

  export default AddFoodModal;