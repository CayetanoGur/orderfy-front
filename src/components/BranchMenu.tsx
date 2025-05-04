import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Edit2, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MenuItem } from '../types';

interface MenuType {
  id: number;
  name: string;
  slug: string;
  image: string;
  categories: {
    [key: string]: {
      name: string;
      items: MenuItem[];
    };
  };
}

interface AddMenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  categories: Array<{ id: number; name: string; slug: string }>;
  selectedType: string;
}

const AddMenuItemForm: React.FC<AddMenuItemFormProps> = ({ isOpen, onClose, onSubmit, categories, selectedType }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null as File | null,
    category: '',
    in_stock: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when type changes
    setFormData({
      name: '',
      description: '',
      price: '',
      image: null,
      category: '',
      in_stock: true
    });
    setError(null);
  }, [selectedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(null);

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('in_stock', formData.in_stock.toString());
    if (formData.image) {
      data.append('image', formData.image);
    }
    
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the menu item');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => {
                const selectedCategory = categories.find(cat => cat.slug === e.target.value);
                console.log('Selected category:', selectedCategory);
                setFormData({ ...formData, category: e.target.value });
              }}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700">In Stock</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BranchMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug, branchSlug } = useParams<{ restaurantSlug: string; branchSlug: string }>();
  const [menuTypes, setMenuTypes] = useState<MenuType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [restaurant, setRestaurant] = useState<any>(null);

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
        setRestaurant(data.restaurant);
      } else {
        setError('Failed to fetch restaurant data');
      }
    } catch (error) {
      setError('An error occurred while fetching restaurant data');
    }
  };

  const fetchMenuData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/database/${user.restaurantSlug}/${branchSlug}/menu/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Raw menu data:', JSON.stringify(data, null, 2));
        
        // Process the menu data to match the MenuType interface
        const processedMenuTypes: MenuType[] = [];
        Object.entries(data.menu).forEach(([typeSlug, typeData]: [string, any]) => {
          console.log('Processing type:', typeSlug, 'with data:', JSON.stringify(typeData, null, 2));
          const categories: { [key: string]: { name: string; items: MenuItem[] } } = {};
          
          Object.entries(typeData).forEach(([categorySlug, categoryData]: [string, any]) => {
            console.log('Processing category:', categorySlug, 'with data:', JSON.stringify(categoryData, null, 2));
            const items = Array.isArray(categoryData) ? categoryData.map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              image: typeof item.image === 'string' ? `http://127.0.0.1:8000/media/${item.image}` : '/default_menu_item.jpg',
              price: parseFloat(item.price),
              in_stock: item.in_stock,
              created_at: item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString()
            })) : [];

            categories[categorySlug] = {
              name: categorySlug,
              items
            };
          });

          processedMenuTypes.push({
            id: 0, // This will be replaced with actual ID
            name: typeSlug,
            slug: typeSlug,
            image: '',
            categories
          });
        });

        console.log('Processed menu types:', JSON.stringify(processedMenuTypes, null, 2));
        setMenuTypes(processedMenuTypes);
        // Set the first type as selected by default
        if (processedMenuTypes.length > 0 && !selectedType) {
          console.log('Setting default selected type:', processedMenuTypes[0].slug);
          setSelectedType(processedMenuTypes[0].slug);
        }
        setError(null);
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
      fetchMenuData();
    }
  }, [restaurant, branchSlug]);

  const fetchCategories = async () => {
    if (!user || !selectedType) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/${selectedType}/categories/`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Categories data:', data);
        // Process the categories data
        const categoryList = data.categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          slug: category.slug
        }));
        console.log('Processed categories:', categoryList);
        setCategories(categoryList);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (error) {
      setError('An error occurred while fetching categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedType, restaurantSlug, branchSlug, user]);

  const handleAddMenuItem = async (formData: FormData) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedType) {
      setError('Please select a menu type first');
      return;
    }

    try {
      const categorySlug = formData.get('category') as string;
      console.log('Selected Type:', selectedType);
      console.log('Category Slug:', categorySlug);
      console.log('Restaurant Slug:', restaurantSlug);
      console.log('Branch Slug:', branchSlug);
      
      // Add the action parameter
      formData.append('action', 'save_and_add_another');
      
      const url = `http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/${selectedType}/${categorySlug}/add_menu_item/`;
      console.log('Full URL:', url);
      
      // Log all form data entries
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'X-Requested-With': 'XMLHttpRequest', // Add this to indicate it's an AJAX request
        },
        body: formData,
        credentials: 'include', // Include cookies if needed
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        // Close the form and refresh the menu data
        setIsAddFormOpen(false);
        await fetchMenuData(); // Refresh the menu data
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.message || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while adding the menu item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/menu/${id}/delete_menu_item/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        // Update the menu types state to remove the deleted item
        setMenuTypes(prevTypes => 
          prevTypes.map(type => ({
            ...type,
            categories: Object.fromEntries(
              Object.entries(type.categories).map(([slug, category]) => [
                slug,
                {
                  ...category,
                  items: category.items.filter(item => item.id !== id)
                }
              ])
            )
          }))
        );
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the menu item');
    }
  };

  const handleEditItem = (itemId: number) => {
    navigate(`/dashboard/branch/${restaurantSlug}/${branchSlug}/edit_menu_item/${itemId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Type Selection Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            {menuTypes.map((type) => (
              <button
                key={type.slug}
                onClick={() => {
                  console.log('Setting selected type to:', type.slug);
                  setSelectedType(type.slug);
                }}
                className={`px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${
                  selectedType === type.slug
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.name || type.slug}
              </button>
            ))}
        </div>
        <button
          onClick={() => setIsAddFormOpen(true)}
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          <PlusCircle className="mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Menu Items Display */}
      {selectedType && (
        <div className="space-y-4">
          {menuTypes
            .find(type => type.slug === selectedType)
            ?.categories && Object.entries(menuTypes.find(type => type.slug === selectedType)?.categories || {})
              .flatMap(([_, category]) => category.items)
              .map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-4">
                  <img
                    src={typeof item.image === 'string' ? item.image : '/default_menu_item.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default_menu_item.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                      <p className="text-lg font-bold ml-4">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditItem(item.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Add Menu Item Form Modal */}
      <AddMenuItemForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddMenuItem}
        categories={categories}
        selectedType={selectedType || ''}
      />
    </div>
  );
};

export default BranchMenu;