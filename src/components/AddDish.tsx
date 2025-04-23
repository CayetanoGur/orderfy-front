// AddDish.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const AddDish: React.FC = () => {
  const [newDish, setNewDish] = useState({ name: '', price: '', description: '' });
  const navigate = useNavigate();

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
          alert('Dish added successfully');
          navigate('/dashboard');
        } else if (response.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error adding dish:', error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Add New Dish</h1>
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
  );
};

export default AddDish;