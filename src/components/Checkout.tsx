import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardPaymentBrick from './MercadoPago';
import MercadoPagoForm from './MercadoPagoForm';

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
  const { branchSlug: urlBranchSlug } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    table: '',
  });
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      const orderData = {
        name: formData.name,
        email: formData.email,
        table: parseInt(formData.table),
        branchSlug: branchSlug,
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      console.log('Sending order data:', orderData);

      const orderResponse = await fetch('http://127.0.0.1:8000/orders/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Clear cart and redirect
      localStorage.removeItem('cart');
      navigate('/success', { 
        state: { 
          orderId: orderResult.order_id,
          message: 'Order placed successfully!' 
        }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      setShowPayment(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    setShowPayment(false);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          {error.includes('blocked by your browser') && (
            <div className="mt-2">
              <p className="text-sm">To resolve this issue:</p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>Disable any ad blockers or security extensions</li>
                <li>Try using a different browser</li>
                <li>Clear your browser cache and cookies</li>
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <MercadoPagoForm total={total} />
        </div>
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
      </div>
    </div>
  );
};

export default Checkout;