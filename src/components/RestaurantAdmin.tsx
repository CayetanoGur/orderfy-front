import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, ClipboardList, PlusCircle, Trash2, Edit2, Settings } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  slug: string;
}

interface Branch {
  id: number;
  name: string;
  ubication: string;
  slug: string;
  image: string;
}

interface Type {
  id: number;
  name: string;
  slug: string;
  image: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const RestaurantAdmin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'restaurant' | 'branches' | 'types' | 'categories'>('restaurant');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantData = async () => {
    if (!user || !restaurantSlug) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      console.log(restaurantSlug);
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data.restaurant);
      } else {
        setError('Failed to fetch restaurant data');
      }
    } catch (error) {
      setError('An error occurred while fetching restaurant data');
    }
  };

  const fetchBranches = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/branches/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchTypes = async () => {
    if (!user || !branches.length) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branches[0].slug}/types/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTypes(data.types);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const fetchCategories = async () => {
    if (!user || !branches.length || !types.length) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branches[0].slug}/${types[0].slug}/categories/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, [user]);

  useEffect(() => {
    if (restaurant) {
      fetchBranches();
    }
  }, [restaurant]);

  useEffect(() => {
    if (branches.length > 0) {
      fetchTypes();
    }
  }, [branches]);

  useEffect(() => {
    if (types.length > 0) {
      fetchCategories();
    }
  }, [types]);

  const handleEditRestaurant = () => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/edit`);
  };

  const handleAddBranch = () => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/add_branch`);
  };

  const handleEditBranch = (branchSlug: string) => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/edit_branch/${branchSlug}`);
  };

  const handleAddType = (branchSlug: string) => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/${branchSlug}/add_type`);
  };

  const handleEditType = (branchSlug: string, typeSlug: string) => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/${branchSlug}/edit_type/${typeSlug}`);
  };

  const handleAddCategory = (branchSlug: string, typeSlug: string) => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/${branchSlug}/${typeSlug}/add_category`);
  };

  const handleEditCategory = (branchSlug: string, typeSlug: string, categorySlug: string) => {
    navigate(`/dashboard/restaurant/${restaurantSlug}/${branchSlug}/${typeSlug}/edit_category/${categorySlug}`);
  };


  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Restaurant Administration</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <Settings className="mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`px-4 py-2 rounded-full ${
            activeTab === 'restaurant' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Restaurant
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-full ${
            activeTab === 'branches' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Branches
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-full ${
            activeTab === 'types' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Types
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-full ${
            activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'restaurant' && restaurant && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Restaurant Details</h2>
              <button
                onClick={() => navigate(`/dashboard/restaurant/${restaurantSlug}/edit`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Edit Restaurant
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-semibold">{restaurant.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Description:</p>
                <p className="font-semibold">{restaurant.description}</p>
              </div>
              <div>
                <p className="text-gray-600">Primary Color:</p>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2"
                    style={{ backgroundColor: restaurant.primary_color }}
                  />
                  <p className="font-semibold">{restaurant.primary_color}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Secondary Color:</p>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2"
                    style={{ backgroundColor: restaurant.secondary_color }}
                  />
                  <p className="font-semibold">{restaurant.secondary_color}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Branches</h2>
              <button
                onClick={handleAddBranch}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                <PlusCircle className="mr-2" />
                Add Branch
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{branch.name}</h3>
                    {/* <button
                      onClick={() => handleEditBranch(branch.slug)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={20} />
                    </button> */}
                  </div>
                  <p className="text-gray-600">{branch.ubication}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'types' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Types</h2>
              {branches.length > 0 && (
                <button
                  onClick={() => handleAddType(branches[0].slug)}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <PlusCircle className="mr-2" />
                  Add Type
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {types.map((type) => (
                <div key={type.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{type.name}</h3>
                    <button
                      onClick={() => handleEditType(branches[0].slug, type.slug)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Categories</h2>
              {branches.length > 0 && types.length > 0 && (
                <button
                  onClick={() => handleAddCategory(branches[0].slug, types[0].slug)}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <PlusCircle className="mr-2" />
                  Add Category
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <button
                      onClick={() => handleEditCategory(branches[0].slug, types[0].slug, category.slug)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAdmin; 