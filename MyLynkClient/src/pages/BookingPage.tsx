import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get } from "../services/api";
import { ScheduleSessionForm } from "../components/ScheduleSessionForm";
import SessionsCalendar from "../components/SessionsCalendar";
import type { LynkerProfile } from "../services/api";

export default function BookingPage() {
  const { lynkerId } = useParams<{ lynkerId: string }>();
  const [lynker, setLynker] = useState<LynkerProfile | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleRefresh = () => setRefresh(!refresh);

  useEffect(() => {
    const fetchLynker = async () => {
      setLoading(true);
      try {
        const response = await get<LynkerProfile>(`/lynkers/${lynkerId}`);
        setLynker(response.data);
      } catch (err) {
        console.error("Error fetching lynker:", err);
      } finally {
        setLoading(false);
      }
    };
    if (lynkerId) fetchLynker();
  }, [lynkerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-700">
        Loading...
      </div>
    );
  }

  if (!lynker) {
    return (
      <div className="text-center mt-10 text-red-600">
        Lynker not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Lynker Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <img
          src={lynker.photo || "/default-profile.png"}
          alt={lynker.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {lynker.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {lynker.category || "No category specified"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Rating: <span className="font-medium">{lynker.rating || "N/A"}</span> ⭐ ({lynker.reviewCount || 0} reviews)
          </p>
        </div>
      </div>

      {/* Book a Session & Calendar */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Book a session with me
          </h2>
          <ScheduleSessionForm lynkerId={lynker._id} onScheduled={handleRefresh} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            My Availability
          </h2>
          <SessionsCalendar key={refresh ? "refresh-1" : "refresh-2"} lynkerId={lynker._id} />
        </div>
      </div>
    </div>
  );
}
