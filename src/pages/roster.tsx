import { useEffect, useState } from "react";
import RosterCard from "../components/rosterCard";
import supabase from "../utils/supabase";

const Roster = () => {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("worship_availabilities")
          .select("date")
          .order("date", { ascending: true })
        //   .limit(4);

        if (error) {
          console.error("Error fetching dates:", error);
        } else {
          // Extract unique dates
          const uniqueDates = Array.from(
            new Set(data.map((entry) => entry.date))
          );
          setDates(uniqueDates);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  return (
    <div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {dates.map((date) => (
            <RosterCard key={date} date={date} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Roster;
