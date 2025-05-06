// App.tsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import RestaurantList from './components/RestaurantList';
import BranchList from './components/BranchList';
import RestaurantMenu from './components/RestaurantMenu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import RestaurantDashboard from './components/RestaurantDashboard';
import AddDish from './components/AddDish';  // Import the AddDish component
import Login from './components/Login';
import BranchMenu from './components/BranchMenu';
import RestaurantAdmin from './components/RestaurantAdmin';
import EditRestaurant from './components/EditRestaurant';
import { CartItem } from './types';
import { AuthProvider } from './context/AuthContext';
import EditMenuItem from './components/EditMenuItem';
import OrdersDash from './components/OrdersDash';
import AddBranchForm from './components/AddBranchForm';
import AddTypeForm from './components/AddTypeForm';

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems([...cartItems, item]);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<RestaurantList />} />
              <Route path="/restaurant/:restaurantSlug" element={<BranchList />} />
              <Route path="/restaurant/:restaurantSlug/:branchSlug" element={<RestaurantMenu addToCart={addToCart} />} />
              <Route path="/cart" element={<Cart items={cartItems} setItems={setCartItems} />} />
              <Route path="/checkout" element={<Checkout cartItems={cartItems} />} />
              <Route path="/dashboard" element={<RestaurantDashboard />} />
              <Route path="/add-dish" element={<AddDish />} />  // Set up routing for AddDish
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/branch/:restaurantSlug/:branchSlug/menu" element={<BranchMenu />} />
              <Route path="/dashboard/branch/:restaurantSlug/:branchSlug/orders" element={<OrdersDash/>} />
              <Route path="/dashboard/branch/:restaurantSlug/:branchSlug/edit_menu_item/:itemId" element={<EditMenuItem />} />
              <Route path="/dashboard/restaurant/:restaurantSlug/:branchSlug/:typeSlug" element={<BranchMenu />} />
              <Route path="/dashboard/restaurant/:restaurantSlug" element={<RestaurantDashboard />} />
              <Route path="/dashboard/restaurant/:restaurantSlug/admin" element={<RestaurantAdmin />} />
              <Route path="/dashboard/restaurant/:restaurantSlug/edit" element={<EditRestaurant />} />
              <Route path="/dashboard/restaurant/:restaurantSlug/add_branch" element={<AddBranchForm />} />
              <Route path="/dashboard/restaurant/:restaurantSlug/:branchSlug/add_type" element={<AddTypeForm />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;