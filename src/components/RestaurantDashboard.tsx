import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, ClipboardList, PlusCircle, Trash2, Edit2, Settings, ArrowLeft } from 'lucide-react';
import { Order, Branch, RestaurantInfo, BranchInfo, MenuItem } from '../types';

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'branches' | 'orders' | 'menu'>('branches');
  const [editingDishId, setEditingDishId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

      try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/database/${user.restaurantSlug}/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
        console.log('Restaurant data:', data);
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
      } else {
        setError('Failed to fetch restaurant data');
      }
    } catch (error) {
      setError('An error occurred while fetching restaurant data');
    }
  };

  const fetchBranchData = async () => {
    if (!user || !restaurant) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurant.slug}/branches/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Branches data:', data);
        const branchList = data.branches.map((branch: any) => ({
          id: branch.id,
          name: branch.name,
          ubication: branch.ubication,
          slug: branch.slug,
          image: branch.image,
        }));
        setBranches(branchList);
        // Set the first branch as selected by default
        if (branchList.length > 0 && !selectedBranch) {
          setSelectedBranch(branchList[0]);
        }
      } else {
        setError('Failed to fetch branch data');
      }
    } catch (error) {
      setError('An error occurred while fetching branch data');
    }
  };

  const fetchMenuData = async () => {
    if (!user || !restaurant || !selectedBranch) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurant.slug}/${selectedBranch.slug}/menu/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Menu data:', data);
        
        // Process menu data dynamically
        const allMenuItems: MenuItem[] = [];
        
        // Iterate through each menu type
        Object.entries(data.menu).forEach(([typeSlug, typeData]: [string, any]) => {
          console.log('Processing menu type:', typeSlug);
          
          // Iterate through each category in the type
          Object.entries(typeData).forEach(([categorySlug, categoryData]: [string, any]) => {
            console.log('Processing category:', categorySlug);
            
            // Add items from this category to the list
            if (Array.isArray(categoryData)) {
              categoryData.forEach((item: any) => {
                allMenuItems.push({
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.image,
            price: item.price,
                  in_stock: item.in_stock,
                  created_at: item.created_at || new Date().toISOString(),
                  updated_at: item.updated_at || new Date().toISOString(),
                  type: typeSlug,
                  category: categorySlug
                });
              });
            }
          });
        });

        console.log('Processed menu items:', allMenuItems);
        setMenuItems(allMenuItems);
      } else {
        setError('Failed to fetch menu data');
        }
      } catch (error) {
      setError('An error occurred while fetching menu data');
    } finally {
      setLoading(false);
      }
    };

  useEffect(() => {
    fetchRestaurantData();
  }, [user]);

  useEffect(() => {
    if (restaurant) {
      fetchBranchData();
    }
  }, [restaurant]);

  useEffect(() => {
    if (selectedBranch) {
      fetchMenuData();
    }
  }, [selectedBranch]);

  const handleBranchClick = (branch: BranchInfo) => {
    setSelectedBranch(branch);
  };

  const handleMenuClick = (branch: BranchInfo) => {
    if (restaurant) {
      navigate(`/dashboard/branch/${restaurant.slug}/${branch.slug}/menu`);
    }
  };

  const handleOrdersClick = (branch: BranchInfo) => {
    if (restaurant) {
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
        <div className="flex space-x-4">
          {restaurant && (
            <button
              onClick={() => navigate(`/dashboard/restaurant/${restaurant.slug}/admin`)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <Settings className="mr-2" />
              Admin Panel
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600">{restaurant.description}</p>
          </div>
        </div>

        {activeTab === 'branches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <MapPin size={20} className="text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{branch.ubication}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMenuClick(branch)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <ClipboardList size={20} className="mr-2" />
                    Menu
                  </button>
                  <button
                    onClick={() => handleOrdersClick(branch)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <ClipboardList size={20} className="mr-2" />
                    Orders
                  </button>
                </div>
              </div>
            ))}
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