import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, ClipboardList, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order, Branch, RestaurantInfo, BranchInfo, MenuItem } from '../types'; // Import interfaces

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [branch, setBranch] = useState<BranchInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'branches' | 'orders' | 'menu'>('branches');
  const [editingDishId, setEditingDishId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/database/pizzeriapopular/va/menu/', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRestaurant({
            id: data.restaurant.id,
            name: data.restaurant.name,
            description: data.restaurant.description,
            branches: [], // Fill as needed
            orders: [], // Fill as needed
            image: data.restaurant.image,
            logo: data.restaurant.logo,
            primary_color: data.restaurant.primary_color,
            secondary_color: data.restaurant.secondary_color,
            slug: data.restaurant.slug
          });
          setBranch({
            id: data.branch.id,
            name: data.branch.name,
            ubication: data.branch.ubication,
            slug: data.branch.slug,
            image: data.branch.image,
          });

          const allMenuItems = [
            ...data.menu.napolitana.bebidas,
            ...data.menu.napolitana.pizzas
          ];

          setMenuItems(allMenuItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.image,
            price: item.price,
            in_stock: item.in_stock,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleBranchClick = (branchId: number) => {
    navigate(`/dashboard/branch/${branchId}/menu`);
  };

  const handleMenuClick = (branchId: number) => {
    if (restaurant && branch) {
      navigate(`/dashboard/branch/${restaurant.slug}/${branch.slug}/menu`);
    }
  };

  const handleOrdersClick = (branchId: number) => {
    if (restaurant && branch) {
      navigate(`/dashboard/branch/${restaurant.slug}/${branch.slug}/orders`);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/restaurant/dishes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setMenuItems(menuItems.filter(item => item.id !== id));
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  const handleEdit = (id: number) => {
    setEditingDishId(id);
    // Further logic to bring up an edit form or modal, set state for editing, etc.
  };

  const handleAddDishClick = () => {
    navigate('/add-dish');
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
            onClick={handleAddDishClick}
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
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
              activeTab === 'menu'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Menuuu
          </button>
        </div>

        {activeTab === 'branches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branch && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <MapPin size={20} className="text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{branch.ubication}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMenuClick(branch.id)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <ClipboardList size={20} className="mr-2" />
                    Menu
                  </button>
                  <button
                    onClick={() => handleOrdersClick(branch.id)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <ClipboardList size={20} className="mr-2" />
                    Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'menu' ? (
          <div className="space-y-4">
            {menuItems.map(item => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add orders display logic here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;