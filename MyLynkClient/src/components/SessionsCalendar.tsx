import React, { useEffect, useState } from "react";
import axios from "axios";

interface Session {
  _id: string;
  sessionDateTime: string;
  userId: string;
  lynkerId: string;
}

interface LynkerBookingCalendarProps {
  lynkerId: string;
}

const LynkerBookingCalendar: React.FC<LynkerBookingCalendarProps> = ({ lynkerId }) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchBookedSessions = async () => {
      try {
        const response = await axios.get<Session[]>(`/api/sessions?lynkerId=${lynkerId}`);
        // Defensive: handle non-array response
        const sessions = Array.isArray(response.data) ? response.data : [];
        const booked = sessions.map((session) => new Date(session.sessionDateTime));

        const uniqueDates: Date[] = Array.from(
          new Set(booked.map((date) => date.toDateString()))
        ).map((dateStr) => new Date(dateStr));

        setBookedDates(uniqueDates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setLoading(false);
      }
    };

    fetchBookedSessions();
  }, [lynkerId]);

  const isDateBooked = (date: Date): boolean => {
    return bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === date.toDateString()
    );
  };

  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];

    // Fill empty slots before the 1st of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(next);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // remove time for comparison

  const calendarDays = generateMonthDays();

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-4">Book a session</h2>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="text-gray-600 hover:text-black font-semibold"
        >
          ← Prev
        </button>
        <h3 className="text-lg font-semibold text-center">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="text-gray-600 hover:text-black font-semibold"
        >
          Next →
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading sessions...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-sm font-medium text-center text-gray-500">
              {day}
            </div>
          ))}

          {calendarDays.map((date, idx) => {
            if (!date) return <div key={idx} />;

            const isPast = date < today;
            const isBooked = isDateBooked(date);

            let bgColor = "";
            if (isPast) {
              bgColor = "bg-gray-200 text-gray-400 cursor-not-allowed";
            } else if (isBooked) {
              bgColor = "bg-red-100 text-red-600";
            } else {
              bgColor = "bg-green-100 hover:bg-green-200 text-green-700 cursor-pointer";
            }

            return (
              <div
                key={date.toDateString()}
                className={`h-12 flex items-center justify-center rounded-full text-sm font-medium transition-all ${bgColor}`}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LynkerBookingCalendar;
