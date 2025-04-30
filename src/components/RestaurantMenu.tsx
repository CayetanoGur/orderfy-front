import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Clock, ArrowLeft } from "lucide-react";
import { CartItem, MenuType } from "../types";

interface RestaurantMenuProps {
  addToCart: (item: CartItem) => void;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ addToCart }) => {
  const { restaurantSlug, branchSlug } = useParams<{ restaurantSlug: string; branchSlug: string }>();
  const navigate = useNavigate();
  const [menuTypes, setMenuTypes] = useState<MenuType[]>([]);
  const [activeType, setActiveType] = useState<number | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/service/get_menu_with_type/${restaurantSlug}/${branchSlug}`);
        const data = await response.json();

        const formattedMenuTypes = data.menus.map((menu: any) => ({
          id: menu.type_of_category.id,
          name: menu.type_of_category.name,
          slug: menu.type_of_category.slug,
          image: `http://127.0.0.1:8000${menu.type_of_category.image}`,
          items: menu.menu_items.flat().map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            image: `http://127.0.0.1:8000/media/${item.image}`,
            in_stock: item.in_stock,
          })),
        }));

        setMenuTypes(formattedMenuTypes);
        if (formattedMenuTypes.length > 0) {
          setActiveType(formattedMenuTypes[0].id);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
      }
    };

    fetchMenuData();
  }, [restaurantSlug, branchSlug]);

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
      >
        <ArrowLeft size={20} className="mr-2" />
        Go Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Restaurant Menu</h1>
      
      {/* Menu Type Tabs */}
      <div className="mb-8 flex space-x-2 overflow-x-auto pb-2">
        {menuTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap ${
              activeType === type.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={16} className="mr-2" />
            {type.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="space-y-8">
        {menuTypes.map((type) => (
          <div
            key={type.id}
            className={`transition-opacity duration-300 ${
              activeType === type.id ? 'block' : 'hidden'
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">{type.name}</h2>
            <div className="grid gap-4">
              {type.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-green-600 font-bold mt-2">
                      ${item.price.toFixed(0)}
                    </p>
                  </div>
                  <img 
                    src={item.image as string} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-full mr-4" />
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
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;