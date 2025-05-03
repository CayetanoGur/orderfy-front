import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

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

const EditRestaurant: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_color: '',
    secondary_color: '',
    slug: '',
    image: null as File | null,
    logo: null as File | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRestaurant(data.restaurant);
          setFormData({
            name: data.restaurant.name,
            description: data.restaurant.description,
            primary_color: data.restaurant.primary_color,
            secondary_color: data.restaurant.secondary_color,
            slug: data.restaurant.slug,
            image: null,
            logo: null,
          });
        } else {
          setError('Failed to fetch restaurant data');
        }
      } catch (error) {
        setError('An error occurred while fetching restaurant data');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [user, restaurantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !restaurant) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('primary_color', formData.primary_color);
      formDataToSend.append('secondary_color', formData.secondary_color);
      formDataToSend.append('slug', formData.slug);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/edit_restaurant/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setSuccess('Restaurant updated successfully');
        setTimeout(() => {
          navigate(`/dashboard/restaurant/${restaurantSlug}/admin`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update restaurant');
      }
    } catch (error) {
      setError('An error occurred while updating the restaurant');
    }
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
        <h1 className="text-3xl font-bold">Edit Restaurant</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-12 h-12 p-1 border rounded mr-2"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="flex-1 p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Secondary Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="w-12 h-12 p-1 border rounded mr-2"
              />
              <input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="flex-1 p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Restaurant Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="w-full p-2 border rounded"
            />
            {restaurant?.image && !formData.image && (
              <img
                src={`http://127.0.0.1:8000/media/${restaurant.image}`}
                alt="Current restaurant"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
              className="w-full p-2 border rounded"
            />
            {restaurant?.logo && !formData.logo && (
              <img
                src={`http://127.0.0.1:8000/media/${restaurant.logo}`}
                alt="Current logo"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurant; 