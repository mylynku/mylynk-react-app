import { useState } from "react"
import { useApi } from "../hooks/useApi"
import { post } from "../services/api"
import { useAuth } from '../context/AuthContext';

interface Props {
  lynkerId: string;
  onScheduled: () => void;
}

export function ScheduleSessionForm({ lynkerId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const { loading, error, callApi } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert('You must be logged in to schedule a session.');
      return;
    }
    const sessionDateTime = new Date(`${date}T${time}`);

    await callApi(
      () =>
        post("sessions", {
          LynkerId: lynkerId,
          sessionDateTime,
          ipAddress: "127.0.0.1",
          satisfactionRating: 5,
          feedback: "Auto scheduled",
          status: "pending",
          location,
        }),
      (session) => {
        // Redirect to RazorpayCheckout with session info (optional: pass sessionId)
        const s = session as { _id: string };
        window.location.href = `/razorpay-checkout?sessionId=${s._id}`;
      },
      (err) => {
        console.error("Failed to schedule session", err);
        alert(`Error scheduling session: ${err.message}`);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-xl border">
      <h3 className="font-semibold text-xl mb-2">Schedule a Session</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 w-full border p-2 rounded-md"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="mt-1 w-full border p-2 rounded-md"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="mt-1 w-full border p-2 rounded-md"
          placeholder="Enter session location"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
        disabled={loading}
      >
        {loading ? "Scheduling..." : "Schedule"}
      </button>

      {error && <div className="text-red-500 text-sm mt-2">Error: {error.message}</div>}
    </form>
  );
}
