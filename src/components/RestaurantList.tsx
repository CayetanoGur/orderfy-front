import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/service/');
        const data = await response.json();
        console.log('Restaurants:', data);
        setRestaurants(data.restaurants.map((restaurant: any) => ({
          id: restaurant.id,
          slug: restaurant.slug,
          name: restaurant.name,
          image: `http://127.0.0.1:8000/media/${restaurant.image}`, // Prefijo la URL media
        })));
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        // In RestaurantList.tsx
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.slug}
            to={`/restaurant/${restaurant.slug}`} // Use slug here
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{restaurant.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;