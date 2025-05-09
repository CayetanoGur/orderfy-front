import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface TypeFormData {
  name: string;
  slug: string;
  image?: File;
  branch: string;
}

interface Branch {
  id: number;
  name: string;
  slug: string;
}

const AddTypeForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState<TypeFormData>({
    name: '',
    slug: '',
    branch: '',
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/branches/`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBranches(data.branches);
          // Set default branch if available
          if (data.branches.length > 0) {
            setFormData(prev => ({ ...prev, branch: data.branches[0].slug }));
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('Failed to load branches');
      }
    };

    fetchBranches();
  }, [restaurantSlug, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.branch) {
      setError('Please select a branch');
      return false;
    }
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.name.length > 80) {
      setError('Name must be less than 80 characters');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Slug is required');
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
    // Check for common problematic characters
    if (/[áéíóúñÁÉÍÓÚÑ]/.test(formData.name)) {
      setError('Name cannot contain special characters or accents');
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
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('slug', formData.slug.trim().toLowerCase());
      formDataToSend.append('branch', formData.branch);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('action', 'save');

      console.log('Sending type data:', {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        branch: formData.branch
      });

      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${formData.branch}/add_type/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formDataToSend,
      });

      const responseData = await response.text();
      console.log('API Response:', responseData);

      if (!response.ok) {
        // Try to parse the error message if it's JSON
        try {
          const errorData = JSON.parse(responseData);
          throw new Error(errorData.message || errorData.error || 'Failed to add type');
        } catch {
          throw new Error(responseData || 'Failed to add type');
        }
      }

      // Verify the type was created by fetching the types list
      const verifyResponse = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${formData.branch}/types/`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (verifyResponse.ok) {
        const typesData = await verifyResponse.json();
        console.log('Types after creation:', typesData);
        
        // Verify the type exists in the response
        const typeExists = typesData.types.some((type: any) => type.slug === formData.slug.trim().toLowerCase());
        if (!typeExists) {
          throw new Error('Type was not found after creation');
        }
        
        // Navigate to the branch menu page where the type was created
        navigate(`/dashboard/branch/${restaurantSlug}/${formData.branch}/menu`);
      } else {
        throw new Error('Failed to verify type creation');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
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
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.slug}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

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