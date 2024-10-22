import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { CartItem, MenuItem } from '../types';

interface RestaurantMenuProps {
  addToCart: (item: CartItem) => void;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ addToCart }) => {
  const { restaurantSlug, branchSlug, typeOfCategorySlug} = useParams<{
    restaurantSlug: string;
    branchSlug: string;
    typeOfCategorySlug: string;
  }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/service/get_menu/${restaurantSlug}/${branchSlug}/napolitana`);
        const data = await response.json();
        console.log('Menu items:', data);
        // Assuming menu_items is an array containing arrays of menu items
        setMenuItems(data.menu_items.map((menu_items: any) => ({
          id: menu_items.id,
          name: menu_items.name,
          description: menu_items.description,
          price: menu_items.price,
          image: `http://127.0.0.1:8000/media/${menu_items.image}`,
          in_stock: menu_items.in_stock,
        })));
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, [restaurantSlug, branchSlug]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Menu</h1>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-green-600 font-bold mt-2">${item.price}</p>
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