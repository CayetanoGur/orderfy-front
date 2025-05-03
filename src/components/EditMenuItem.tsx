import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  image: string | File;
  price: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

const EditMenuItem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug, branchSlug, itemId } = useParams<{ restaurantSlug: string; branchSlug: string; itemId: string }>();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/menu/${itemId}/edit_menu_item/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMenuItem(data.menu_item);
        } else if (response.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch menu item');
        }
      } catch (error) {
        console.error('Error fetching menu item:', error);
        setError('An error occurred while fetching the menu item');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [user, navigate, restaurantSlug, branchSlug, itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !menuItem) return;

    try {
      const formData = new FormData();
      formData.append('name', menuItem.name);
      formData.append('description', menuItem.description);
      formData.append('price', menuItem.price.toString());
      formData.append('in_stock', menuItem.in_stock ? 'true' : 'false');
      if (menuItem.image && typeof menuItem.image !== 'string') {
        formData.append('image', menuItem.image);
      }

      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/menu/${itemId}/edit_menu_item/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate(`/dashboard/branch/${restaurantSlug}/${branchSlug}/menu`);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError('An error occurred while updating the menu item');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!menuItem) {
    return <div>Menu item not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Menu Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={menuItem.name}
            onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={menuItem.description}
            onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            value={menuItem.price}
            onChange={(e) => setMenuItem({ ...menuItem, price: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            step="0.01"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={menuItem.in_stock}
            onChange={(e) => setMenuItem({ ...menuItem, in_stock: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">In Stock</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setMenuItem({ ...menuItem, image: file });
              }
            }}
            className="mt-1 block w-full"
            accept="image/*"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/branch/${restaurantSlug}/${branchSlug}/menu`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMenuItem; 