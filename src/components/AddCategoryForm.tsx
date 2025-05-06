import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface CategoryFormData {
  name: string;
  slug: string;
  type: string;
}

interface Type {
  id: number;
  name: string;
  slug: string;
}

const AddCategoryForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug, branchSlug } = useParams<{ 
    restaurantSlug: string; 
    branchSlug: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<Type[]>([]);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    type: '',
  });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/types/`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTypes(data.types);
          // Set the first type as default if available
          if (data.types.length > 0) {
            setFormData(prev => ({
              ...prev,
              type: data.types[0].slug
            }));
          }
        }
      } catch (err) {
        setError('Failed to fetch types');
      }
    };

    fetchTypes();
  }, [restaurantSlug, branchSlug, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.name.length > 80) {
      setError('Name must be less than 80 characters');
      return false;
    }
    if (formData.slug.length > 20) {
      setError('Slug must be less than 20 characters');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    if (!formData.type) {
      setError('Please select a type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('action', 'save');

      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/${formData.type}/add_category/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to add category');
      }

      // Navigate to the menu page with the correct URL structure
      navigate(`/dashboard/restaurant/${restaurantSlug}/${branchSlug}/menu`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add New Category</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a type</option>
              {types.map((type) => (
                <option key={type.id} value={type.slug}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter category slug (e.g., main-dishes)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding Category...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm; 