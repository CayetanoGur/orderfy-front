import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface TypeFormData {
  name: string;
  slug: string;
  image?: File;
}

const AddTypeForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug, branchSlug } = useParams<{ restaurantSlug: string; branchSlug: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TypeFormData>({
    name: '',
    slug: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
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
      formDataToSend.append('branch', branchSlug || '');
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('action', 'save');

      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/add_type/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to add type');
      }

      // Navigate back to the types list
      navigate(`/dashboard/restaurant/${restaurantSlug}/admin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add New Type</h1>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Type Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter type name"
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
              placeholder="Enter type slug (e.g., main-dishes)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Type Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional. Max file size: 10MB
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
              {loading ? 'Adding Type...' : 'Add Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTypeForm; 