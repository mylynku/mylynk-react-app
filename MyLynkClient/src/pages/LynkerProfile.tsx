import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get } from '../services/api';
import type { LynkerProfile } from '../services/api';

const NotFound: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen text-gray-600 text-xl">
    {message || 'Not found'}
  </div>
);

const LynkerProfilePage: React.FC = () => {
  const { lynkerId } = useParams<{ lynkerId: string }>();
  const [lynker, setLynker] = useState<LynkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLynker = async () => {
      setLoading(true);
      try {
        const response = await get<LynkerProfile>(`/lynkers/${lynkerId}`);
        setLynker(response.data);
      } catch {
        setLynker(null);
      } finally {
        setLoading(false);
      }
    };
    if (lynkerId) fetchLynker();
  }, [lynkerId]);

  if (loading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!lynker)
    return <NotFound message="Lynker not found" />;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-5">
            <img
              src={lynker.photo || '/default-profile.png'}
              alt={lynker.name}
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lynker.name}</h1>
              <p className="text-gray-600 text-sm">{lynker.category}</p>
              <div className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                <Star size={16} className="text-yellow-500" />
                <span>{lynker.rating} ({lynker.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
              <Heart size={20} />
            </button>
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
              <Share2 size={20} />
            </button>
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 pt-10">
        {/* About Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{lynker.bio || 'No bio available.'}</p>
          </div>
        </div>

        {/* Booking Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-2xl font-semibold mb-4">Book a session with me</h2>

            {/* Tags as categories */}
            {lynker.tags?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {lynker.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-700 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-4">No categories listed.</p>
            )}

            <button
              onClick={() => navigate(`/book/${lynker._id}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
            >
              Go to Booking Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LynkerProfilePage;
