import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react'; // Add the Edit2 icon

interface Dish {
  id: number;
  name: string;
  price: number;
  description: string;
}

const RestaurantDashboard: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newDish, setNewDish] = useState({ name: '', price: '', description: '' });
  const [editingDishId, setEditingDishId] = useState<number | null>(null); // State to store currently editing dish
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDishes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/database/pizzeriapopular/va/napolitana/menu/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const dishesArray = [];
          for (const category of Object.values(data.menu_items) as { menu_items: any[] }[]) {
            dishesArray.push(...category.menu_items);
          }
          setDishes(dishesArray);
        } else if (response.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };

    fetchDishes();
  }, [navigate]);

  function getCSRFToken() {
    const name = 'csrftoken';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const part = parts.pop();
      return part ? part.split(';').shift() : undefined;
    }
  }
  const handleLogout = async () => {
    const csrfToken = getCSRFToken();
    try {
      const response = await fetch('http://127.0.0.1:8000/database/api/logout/', { 
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-CSRFToken': csrfToken || '',  // include the CSRF token in the headers
      },
      credentials: 'include',
    });
    if (response.ok) {
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('An error occurred. Please try again.');
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDish({ ...newDish, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDish.name && newDish.price) {
      const token = localStorage.getItem('token');
      const formBody = new URLSearchParams({
        name: newDish.name,
        description: newDish.description,
        image: "",
        price: newDish.price,
        in_stock: "true",
        action: "save_and_add_another"
      }).toString();

      try {
        const response = await fetch('http://127.0.0.1:8000/database/pizzeriapopular/va/napolitana/pizzas/add_menu_item/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`,
          },
          body: formBody,
        });
        if (response.ok) {
          const addedDish = await response.json();
          setDishes([...dishes, { ...addedDish, price: Number(addedDish.price) }]);
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

  const handleEdit = (id: number) => {
    setEditingDishId(id);
    // Add further logic to bring up an edit form or modal, set state for editing, etc.
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
      <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
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
                    <p className="text-gray-600">${dish.price}</p>
                    <p className="text-sm text-gray-500">{dish.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(dish.id)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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