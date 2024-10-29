import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Restaurant } from '../types';

// const MOCK_RESTAURANTS = [
//   {
//     id: 1,
//     name: "The Gourmet Kitchen",
//     image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60",
//     branches: [
//       { id: 1, name: "Downtown", address: "123 Main St" },
//       { id: 2, name: "Riverside", address: "456 River Rd" }
//     ]
//   },
//   {
//     id: 2,
//     name: "Sushi Master",
//     image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60",
//     branches: [
//       { id: 3, name: "City Center", address: "789 Center Ave" },
//       { id: 4, name: "Mall Location", address: "321 Mall Blvd" }
//     ]
//   },
//   {
//     id: 3,
//     name: "Pasta Paradise",
//     image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&auto=format&fit=crop&q=60",
//     branches: [
//       { id: 5, name: "Beachfront", address: "555 Beach Dr" },
//       { id: 6, name: "University", address: "777 College Rd" }
//     ]
//   }
// ];

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/service/get_restaurants_with_branches/')
      .then(response => response.json())
      .then(data => {
        const restaurantData: Restaurant[] = data.restaurants.map((item: any) => ({
          ...item.restaurant,
          image: `http://127.0.0.1:8000${item.restaurant.image}` || '',
          logo: `http://127.0.0.1:8000${item.restaurant.logo}` || '',
          branches: item.branches.map((branch: any) => ({
            ...branch,
            address: branch.ubication, // Ensure address is populated correctly
            image: `http://127.0.0.1:8000${branch.image}` || ''
          }))
        }));
        setRestaurants(restaurantData);
      })
      .catch(error => console.error('Error fetching restaurants:', error));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <div className="space-y-2">
                {restaurant.branches.map((branch) => (
                  <Link
                    key={branch.id}
                    to={`/restaurant/${restaurant.slug}/${branch.slug}`}
                    className="block bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center text-gray-700">
                      <MapPin size={16} className="mr-2" />
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-gray-500">{branch.address}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;


// useEffect(() => {
//   const fetchRestaurants = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/service/');
//       const data = await response.json();
//       console.log('Restaurants:', data);
//       setRestaurants(data.restaurants.map((restaurant: any) => ({
//         id: restaurant.id,
//         slug: restaurant.slug,
//         name: restaurant.name,
//         image: `http://127.0.0.1:8000/media/${restaurant.image}`, // Prefijo la URL media
//       })));
//     } catch (error) {
//       console.error('Error fetching restaurants:', error);
//     }
//   };

//   fetchRestaurants();
// }, []);