import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, ClipboardList, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order, Branch } from '../types';

interface RestaurantInfo {
  id: number;
  name: string;
  description: string;
  branches: Branch[];
  orders: Order[];
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'branches' | 'orders'>('branches');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    console.log("Dashboard user", user);
    // Fetch restaurant data
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/database/${user.restaurantSlug}/edit_restaurant/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await response.json();
        setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      }
    };

    fetchRestaurantData();
  }, [user, navigate]);

  const handleBranchClick = (branchId: number) => {
    navigate(`/dashboard/branch/${branchId}/menu`);
  };

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600">{restaurant.description}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/menu')}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Menu Items
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('branches')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
              activeTab === 'branches'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 size={20} className="mr-2" />
            Branches
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
              activeTab === 'orders'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClipboardList size={20} className="mr-2" />
            Orders
          </button>
        </div>

        {activeTab === 'branches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant.branches && restaurant.branches.map((branch) => (
              <div
                key={branch.id}
                onClick={() => handleBranchClick(branch.id)}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center mb-2">
                  <MapPin size={20} className="text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                </div>
                <p className="text-gray-600">{branch.address}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {restaurant.orders && restaurant.orders.map((order) => (
              <div key={order.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;