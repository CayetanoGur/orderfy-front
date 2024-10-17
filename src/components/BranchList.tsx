import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Branch } from '../types';

const BranchList: React.FC = () => {
const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/service/${restaurantSlug}`); 
        const data = await response.json();
        console.log('branches:', data);
        
        setBranches(data.branches.map((branch: any) => ({
          id: branch.id,
          name: branch.name,
          image: `http://127.0.0.1:8000/media/${branch.image}`, 
          address: branch.ubication, // Placeholder if not available; update if needed
        })));
      } catch (error) {
        console.error('Error fetching branch data:', error);
      }
    };
  
    fetchBranches();
  }, [restaurantSlug]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Select a Branch</h1>
      <div className="space-y-4">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            to={`/restaurant/${restaurantSlug}/branch/${branch.id}`}
            className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
          >
             <img src={branch.image} alt={branch.name} className="w-full h-48 object-cover" />
            <h2 className="text-xl font-semibold">{branch.name}</h2>
            <p className="text-gray-600">{branch.address}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BranchList;