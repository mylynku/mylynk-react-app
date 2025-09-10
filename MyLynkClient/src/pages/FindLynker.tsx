import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type LynkerProfile = {
  _id: string;
  name: string;
  photo: string;
  category: string;
  tags: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  rate: number;
};

const Lynkers = () => {
  const [lynkers, setLynkers] = useState<LynkerProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLynkers = async () => {
      try {
        const response = await axios.get('http://localhost:9000/lynkers');
        const data: LynkerProfile[] = response.data;

        setLynkers(data);

        const uniqueCats = Array.from(
          new Set(data.map((lynker) => lynker.category))
        );
        setCategories(uniqueCats);
      } catch (error) {
        console.error('Error fetching Lynkers:', error);
      }
    };

    fetchLynkers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Explore Lynkers</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Categories</h3>
        <ul className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <li
              key={cat}
              className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition"
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lynkers.map((lynker) => (
          <div
            key={lynker._id}
            className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition duration-300 flex flex-col"
          >
            <img
              src={lynker.photo}
              alt={lynker.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-800">{lynker.name}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-3">{lynker.bio}</p>

              <div className="mt-3 text-sm text-gray-500">
                <strong className="text-gray-700">Category:</strong> {lynker.category}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                <strong className="text-gray-700">Tags:</strong>{' '}
                <span className="italic">{lynker.tags.join(', ')}</span>
              </div>

              <div className="mt-2 flex justify-between items-center text-sm font-medium">
                <span className="text-yellow-500">⭐ {lynker.rating} ({lynker.reviewCount})</span>
                <span className="text-green-600 text-base">₹{lynker.rate}</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/book/${lynker._id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition text-sm"
                >
                  Lynk Me!
                </button>
                <button
                  onClick={() => navigate(`/lynker/${lynker._id}`)}
                  className="flex-1 border border-gray-400 text-gray-800 py-2 px-4 rounded-xl hover:bg-gray-100 transition text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lynkers;
