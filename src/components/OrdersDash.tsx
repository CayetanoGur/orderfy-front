import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderItem } from '../types';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
interface OrdersResponse {
  [key: string]: {
    info: {
      id: number;
      created: string;
      status: string;
      total: number;
      client?: {
        name: string;
        email: string;
      };
      branch: {
        name: string;
        slug: string;
      };
    };
    items: {
      [key: string]: {
        info: {
          id: number;
          menu_item: {
            name: string;
            price: number;
          };
          quantity: number;
        };
        ingredients_added: {
          [key: string]: {
            menu_item_ingredient: {
              ingredient: {
                name: string;
                price: number;
              };
            };
          };
        } | null;
        ingredients_removed: {
          [key: string]: {
            menu_item_ingredient: {
              ingredient: {
                name: string;
              };
            };
          };
        } | null;
      };
    } | null;
  };
}

const OrdersDash: React.FC = () => {
  const { user } = useAuth();
  const { restaurantSlug, branchSlug } = useParams<{ restaurantSlug: string; branchSlug: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrdersResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurantSlug || !branchSlug) {
        setError('Restaurant or branch information is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/order/${restaurantSlug}/${branchSlug}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        console.log('Received orders data:', data); // Debug log
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err); // Debug log
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOrders();
    }
  }, [user?.token, restaurantSlug, branchSlug]);

  const calculateItemTotal = (item: any) => {
    let total = item.info.menu_item.price * item.info.quantity;
    
    // Add cost of added ingredients
    if (item.ingredients_added) {
      Object.values(item.ingredients_added).forEach((ingredient: any) => {
        total += ingredient.menu_item_ingredient.ingredient.price;
      });
    }
    
    return total;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (Object.keys(orders).length === 0) {
    return <div className="text-center p-4">No orders found for this branch.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recent Orders</h1>
        <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
      </div>
      
      <div className="grid gap-6">
        {Object.entries(orders).map(([orderId, orderData]) => {
          if (!orderData?.info) return null; // Skip if info is missing
          
          return (
            <div key={orderId} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{orderId}</h2>
                  <p className="text-gray-600">
                    {orderData.info.created ? format(new Date(orderData.info.created), 'PPpp') : 'No date available'}
                  </p>
                  {orderData.info.client && (
                    <p className="text-sm text-gray-500">
                      Customer: {orderData.info.client.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    orderData.info.status === 'completed' ? 'bg-green-100 text-green-800' :
                    orderData.info.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {orderData.info.status || 'Unknown'}
                  </span>
                  <p className="text-lg font-semibold mt-2">
                    Total: ${(orderData.info.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {orderData.items && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Items</h3>
                  <div className="space-y-4">
                    {Object.entries(orderData.items).map(([itemId, item]) => (
                      <div key={itemId} className="border-t pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.info.menu_item.name}</p>
                            <p className="text-gray-600">Quantity: {item.info.quantity}</p>
                            
                            {item.ingredients_added && Object.keys(item.ingredients_added).length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-green-600">Added:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {Object.entries(item.ingredients_added).map(([ingId, ing]) => (
                                    <li key={ingId}>
                                      {ing.menu_item_ingredient.ingredient.name}
                                      (+${ing.menu_item_ingredient.ingredient.price.toFixed(2)})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {item.ingredients_removed && Object.keys(item.ingredients_removed).length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-red-600">Removed:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {Object.entries(item.ingredients_removed).map(([ingId, ing]) => (
                                    <li key={ingId}>
                                      {ing.menu_item_ingredient.ingredient.name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${calculateItemTotal(item).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersDash;
