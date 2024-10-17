import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Dish {
  id: number;
  name: string;
  price: number;
  description: string;
}

const RestaurantDashboard: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newDish, setNewDish] = useState({ name: '', price: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // API endpoint to fetch restaurant's dishes
    // GET /api/restaurant/dishes
    const fetchDishes = async () => {
      try {
        const response = await fetch('/api/restaurant/dishes', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDishes(data);
        } else if (response.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };

    fetchDishes();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDish({ ...newDish, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDish.name && newDish.price) {
      const token = localStorage.getItem('token');
      const newDishData = { ...newDish, price: parseFloat(newDish.price) };

      // API endpoint to add a new dish
      // POST /api/restaurant/dishes
      try {
        const response = await fetch('/api/restaurant/dishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newDishData),
        });
        if (response.ok) {
          const addedDish = await response.json();
          setDishes([...dishes, addedDish]);
          setNewDish({ name: '', price: '', description: '' });
        } else if (response.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error adding dish:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');

    // API endpoint to delete a dish
    // DELETE /api/restaurant/dishes/{id}
    try {
      const response = await fetch(`/api/restaurant/dishes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setDishes(dishes.filter(dish => dish.id !== id));
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Dish</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1">Dish Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newDish.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-1">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newDish.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="description" className="block mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={newDish.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center"
            >
              <PlusCircle size={20} className="mr-2" />
              Add Dish
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Menu</h2>
          {dishes.length === 0 ? (
            <p>No dishes added yet.</p>
          ) : (
            <ul className="space-y-4">
              {dishes.map((dish) => (
                <li key={dish.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{dish.name}</h3>
                    <p className="text-gray-600">${dish.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{dish.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;