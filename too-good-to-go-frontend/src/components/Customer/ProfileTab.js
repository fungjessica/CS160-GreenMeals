import React from "react";
import { useState } from "react";
const API_BASE_URL = 'http://localhost:3001/api';

const ProfileTab = ({ user, allRestrictions, updateRestrictions }) => {
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

  export default ProfileTab;