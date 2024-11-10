import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import ToggleAvailable from "../components/toggleAvailable";
import { getUpcomingSaturdays } from "../utils/dateUtils";
import supabase from "../utils/supabase";
import { useNavigate } from "react-router-dom";

const Availability = () => {
  const { phoneNumber } = useAuth();
  const navigate = useNavigate();
  const upcomingSaturdays = useMemo(() => getUpcomingSaturdays(), []);
  const [availabilities, setAvailabilities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/auth");
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (phoneNumber) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("worship_availabilities")
            .select("date")
            .eq("phoneNumber", phoneNumber);

          if (error) {
            console.error("Error fetching availabilities:", error);
          } else {
            const availableDates = new Set(data.map((entry) => entry.date));
            setAvailabilities(availableDates);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAvailabilities();
  }, [phoneNumber]);

  return (
    <div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {upcomingSaturdays.map((date) => (
            <ToggleAvailable
              key={date}
              date={date}
              phoneNumber={phoneNumber || ""}
              isInitiallyAvailable={availabilities.has(date)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Availability;
