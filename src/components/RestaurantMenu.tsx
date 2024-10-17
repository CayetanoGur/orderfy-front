import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { CartItem } from '../types';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface RestaurantMenuProps {
  addToCart: (item: CartItem) => void;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ addToCart }) => {
  const { restaurantId, branchId } = useParams<{ restaurantId: string; branchId: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // API endpoint to fetch menu items for a specific restaurant branch
    // GET /api/restaurants/{restaurantId}/branches/{branchId}/menu
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}/branches/${branchId}/menu`);
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, [restaurantId, branchId]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Menu</h1>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-green-600 font-bold mt-2">${item.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => addToCart({ ...item, quantity: 1 })}
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center"
            >
              <PlusCircle size={20} className="mr-2" />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;