import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MenuItem } from '../types';

interface MenuType {
  id: number;
  name: string;
  slug: string;
  image: string;
  categories: {
    [key: string]: {
      name: string;
      items: MenuItem[];
    };
  };
}

const BranchMenu: React.FC = () => {
  const { restaurantSlug, branchSlug } = useParams<{ restaurantSlug: string; branchSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuTypes, setMenuTypes] = useState<MenuType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/menu/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Raw menu data:', data);
          
          // Process the menu data to match the MenuType interface
          const processedMenuTypes: MenuType[] = [];
          Object.entries(data.menu).forEach(([typeSlug, typeData]: [string, any]) => {
            const categories: { [key: string]: { name: string; items: MenuItem[] } } = {};
            
            Object.entries(typeData).forEach(([categorySlug, categoryData]: [string, any]) => {
              const items = Array.isArray(categoryData) ? categoryData.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image: typeof item.image === 'string' ? `http://127.0.0.1:8000/media/${item.image}` : '/default_menu_item.jpg',
                price: parseFloat(item.price),
                in_stock: item.in_stock,
                created_at: item.created_at || new Date().toISOString(),
                updated_at: item.updated_at || new Date().toISOString()
              })) : [];

              categories[categorySlug] = {
                name: categorySlug,
                items
              };
            });

            processedMenuTypes.push({
              id: typeData.id,
              name: typeData.name,
              slug: typeSlug,
              image: typeData.image,
              categories
            });
          });

          console.log('Processed menu types:', processedMenuTypes);
          setMenuTypes(processedMenuTypes);
          // Set the first type as selected by default
          if (processedMenuTypes.length > 0) {
            setSelectedType(processedMenuTypes[0].slug);
          }
        } else {
          throw new Error('Failed to fetch menu items');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [user, navigate, restaurantSlug, branchSlug]);

  const handleDelete = async (id: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/database/${restaurantSlug}/${branchSlug}/menu/${id}/delete_menu_item/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        // Update the menu types state to remove the deleted item
        setMenuTypes(prevTypes => 
          prevTypes.map(type => ({
            ...type,
            categories: Object.fromEntries(
              Object.entries(type.categories).map(([slug, category]) => [
                slug,
                {
                  ...category,
                  items: category.items.filter(item => item.id !== id)
                }
              ])
            )
          }))
        );
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the menu item');
    }
  };

  const handleEditItem = (itemId: number) => {
    navigate(`/dashboard/branch/${restaurantSlug}/${branchSlug}/edit_menu_item/${itemId}`);
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold">Menu Items</h1>
        <button
          onClick={() => navigate(`/dashboard/branch/${restaurantSlug}/${branchSlug}/add_menu_item`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <PlusCircle className="mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Type Selection Buttons */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {menuTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.slug)}
            className={`px-6 py-2 rounded-full transition-colors duration-200 whitespace-nowrap font-medium ${
              selectedType === type.slug
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.name || type.slug}
          </button>
        ))}
      </div>

      {/* Menu Items Display */}
      {selectedType && (
        <div className="space-y-4">
          {menuTypes
            .find(type => type.slug === selectedType)
            ?.categories && Object.entries(menuTypes.find(type => type.slug === selectedType)?.categories || {})
              .flatMap(([_, category]) => category.items)
              .map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-4">
                  <img
                    src={typeof item.image === 'string' ? item.image : '/default_menu_item.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default_menu_item.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      </div>
                      <p className="text-lg font-bold ml-4">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditItem(item.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

export default BranchMenu; 