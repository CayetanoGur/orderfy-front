import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-green-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Orderfy</Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-green-200">
                <Menu className="inline-block mr-1" size={20} />
                Restaurants
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-green-200">
                <ShoppingCart className="inline-block mr-1" size={20} />
                Cart
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-green-200">Dashboard</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;