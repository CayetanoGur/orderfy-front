import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Cart: React.FC<CartProps> = ({ items, setItems }) => {
  const updateQuantity = (id: number, change: number) => {
    setItems(
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    // API endpoint to update cart item quantity
    // PUT /api/cart/items/{id}
    // Body: { quantity: newQuantity }
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));

    // API endpoint to remove item from cart
    // DELETE /api/cart/items/{id}
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`cart-item-${item.id}`}
                className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-600">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="text-green-500 hover:text-green-600"
                  >
                    <MinusCircle size={20} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="text-green-500 hover:text-green-600"
                  >
                    <PlusCircle size={20} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 ml-4"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
            <Link
              to="/checkout"
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 inline-block"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
