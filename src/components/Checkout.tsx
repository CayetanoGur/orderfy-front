import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardPaymentBrick from './MercadoPago';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutProps {
  cartItems: CartItem[];
  restaurantSlug: string;
  branchSlug: string;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, restaurantSlug, branchSlug }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    table: '',
  });
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      setIsProcessing(true);
      const orderData = { 
        ...formData, 
        items: cartItems,
        restaurantSlug,
        branchSlug,
        paymentId: response.id,
        status: 'pending'
      };

      const orderResponse = await fetch('http://127.0.0.1:8000/orders/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderResponse.json();
      alert('Order placed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
    setShowPayment(false);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={`checkout-item-${item.id}`} className="flex justify-between mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div>
          {!showPayment ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Table Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="table" className="block mb-1">Table Number</label>
                  <input
                    type="text"
                    id="table"
                    name="table"
                    value={formData.table}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors duration-300"
                >
                  Proceed to Payment
                </button>
              </form>
            </>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              {isProcessing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4">Processing your payment...</p>
                </div>
              ) : (
                <CardPaymentBrick
                  amount={total}
                  email={formData.email}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;