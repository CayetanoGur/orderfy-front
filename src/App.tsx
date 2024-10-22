import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import BranchList from './components/BranchList';
import RestaurantMenu from './components/RestaurantMenu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import RestaurantDashboard from './components/RestaurantDashboard';
import Login from './components/Login';
import { CartItem } from './types';

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems([...cartItems, item]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RestaurantList />} />
            <Route path="/restaurant/:restaurantSlug" element={<BranchList />} />
            <Route path="/restaurant/:restaurantSlug/:branchSlug" element={<RestaurantMenu addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={<Cart items={cartItems} setItems={setCartItems} />}
            />
            <Route path="/checkout" element={<Checkout cartItems={cartItems} />} />
            <Route path="/dashboard" element={<RestaurantDashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;