import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AddFoodModal from './AddFoodModal';

const InventoryTab = ({
    inventory,
    deleteFood,
    showAddModal,
    setShowAddModal,
    token,
    reload,
    allRestrictions
  })=>{
    return(    <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Food Item
          </button>
          {showAddModal && (
          <AddFoodModal
            token={token}
            loadInventory={reload}   
            setShowAddModal={setShowAddModal}
            allRestrictions={allRestrictions}
          />
      )}
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
        
      </div>)
  }

export default InventoryTab