import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

const ReportTab = ({ token }) => {
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/owner/restaurant/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.json();
      console.log("Raw report data from backend:", data);
  
      // Normalize into an array
      const normalized =
        Array.isArray(data)
          ? data
          : Array.isArray(data.report)
          ? data.report
          : Array.isArray(data.rows)
          ? data.rows
          : Array.isArray(data.data)
          ? data.data
          : [];
  
      setReportData(normalized);
    } catch (err) {
      console.error("Error loading report:", err);
      setReportData([]); // safe fallback
    }
  };
  

  const totalRevenue = Array.isArray(reportData)
  ? reportData.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
  : 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Sales Report</h2>

      {reportData.length === 0 ? (
        <p className="text-gray-500">No sales data available yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Item Name</th>
                <th className="py-3 px-4 text-right">Total Sold</th>
                <th className="py-3 px-4 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{item.food_name}</td>
                  <td className="py-2 px-4 text-right">{item.total_sold}</td>
                  <td className="py-2 px-4 text-right">${Number(item.revenue || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold bg-gray-100">
              <tr>
                <td className="py-2 px-4">Total</td>
                <td></td>
                <td className="py-2 px-4 text-right">${Number(totalRevenue || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportTab;
