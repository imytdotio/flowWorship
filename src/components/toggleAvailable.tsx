import { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

interface ToggleAvailableProps {
  date: string;
  phoneNumber: string;
  isInitiallyAvailable: boolean;
}

const ToggleAvailable = ({
  date,
  phoneNumber,
  isInitiallyAvailable,
}: ToggleAvailableProps) => {
  const { phoneNumber: authPhoneNumber } = useAuth();
  const [isAvailable, setIsAvailable] = useState(isInitiallyAvailable);
  const [comment, setComment] = useState("");
  const [skills, setSkills] = useState<{ id: number; skillName: string }[]>([]);
  const [activeSkills, setActiveSkills] = useState<Set<number>>(new Set());
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    setIsAvailable(isInitiallyAvailable);
  }, [isInitiallyAvailable]);

  useEffect(() => {
    const fetchComment = async () => {
      setLoadingComment(true);
      try {
        const { data, error } = await supabase
          .from("worship_availabilities")
          .select("comment")
          .eq("date", date)
          .eq("phoneNumber", phoneNumber)
          .limit(1);

        if (error) {
          console.error("Error fetching comment:", error);
        } else if (data && data.length > 0) {
          setComment(data[0].comment || "");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoadingComment(false);
      }
    };

    const fetchSkills = async () => {
      try {
        const { data: profileSkills, error: profileError } = await supabase
          .from("worship_profile_skills")
          .select("skillId")
          .eq("phoneNumber", authPhoneNumber);

        if (profileError) {
          console.error("Error fetching profile skills:", profileError);
          return;
        }

        const skillIds = profileSkills.map(({ skillId }) => skillId);

        const { data: skillData, error: skillError } = await supabase
          .from("worship_skills")
          .select("id, skillName")
          .in("id", skillIds);

        if (skillError) {
          console.error("Error fetching skill names:", skillError);
        } else if (skillData) {
          setSkills(skillData);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    const fetchActiveSkills = async () => {
      try {
        const { data, error } = await supabase
          .from("worship_availabilities")
          .select("skillId")
          .eq("date", date)
          .eq("phoneNumber", phoneNumber);

        if (error) {
          console.error("Error fetching active skills:", error);
        } else if (data) {
          setActiveSkills(new Set(data.map(({ skillId }) => skillId)));
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchComment();
    fetchSkills();
    fetchActiveSkills();
  }, [date, phoneNumber, authPhoneNumber]);

  const toggleAvailable = async () => {
    const newState = !isAvailable;
    setIsAvailable(newState);

    if (newState) {
      try {
        const { data, error } = await supabase
          .from("worship_profile_skills")
          .select("skillId")
          .eq("phoneNumber", authPhoneNumber);

        if (error) {
          console.error("Error fetching skills:", error);
        } else if (data) {
          const insertPromises = data.map(({ skillId }) =>
            supabase
              .from("worship_availabilities")
              .insert({ date, phoneNumber: authPhoneNumber, skillId })
          );

          await Promise.all(insertPromises);
          setActiveSkills(new Set(data.map(({ skillId }) => skillId)));
          console.log("Availability and skills added successfully");
        }
      } catch (insertError) {
        console.error("Error inserting availability and skills:", insertError);
      }
    } else {
      try {
        const { error } = await supabase
          .from("worship_availabilities")
          .delete()
          .eq("date", date)
          .eq("phoneNumber", phoneNumber);

        if (error) {
          console.error("Error removing availability:", error);
        } else {
          setActiveSkills(new Set());
          console.log("Availability removed successfully");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleSkillButtonClick = async (skillId: number) => {
    if (activeSkills.has(skillId)) {
      try {
        const { error } = await supabase
          .from("worship_availabilities")
          .delete()
          .eq("date", date)
          .eq("phoneNumber", phoneNumber)
          .eq("skillId", skillId);

        if (error) {
          console.error("Error removing skill availability:", error);
        } else {
          const updatedActiveSkills = new Set(activeSkills);
          updatedActiveSkills.delete(skillId);
          setActiveSkills(updatedActiveSkills);
          console.log("Skill availability removed successfully");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    } else {
      try {
        const { error } = await supabase
          .from("worship_availabilities")
          .insert({ date, phoneNumber: authPhoneNumber, skillId });

        if (error) {
          console.error("Error adding skill availability:", error);
        } else {
          const updatedActiveSkills = new Set(activeSkills);
          updatedActiveSkills.add(skillId);
          setActiveSkills(updatedActiveSkills);
          console.log("Skill availability added successfully");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center">
        <p>{date}</p>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={toggleAvailable}
              className="sr-only"
            />
            <div
              className={`block w-12 h-6 rounded-full transition-colors ${
                isAvailable ? "bg-teal-400" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                isAvailable ? "transform translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>
      {isAvailable && (
        <div className="flex flex-col gap-2 mb-4 pb-2">
          <div className="flex flex-row flex-wrap gap-2">
            {skills.map(({ id, skillName }) => (
              <button
                key={id}
                onClick={() => handleSkillButtonClick(id)}
                className={`border border-gray-200 text-black px-2 py-1 rounded-md ${
                  activeSkills.has(id) ? "bg-teal-300 border-teal-300" : ""
                }`}
              >
                {skillName}
              </button>
            ))}
          </div>
          <div className="flex flex-row justify-between items-center gap-2">
            <input
              type="text"
              className="w-full h-10 border border-gray-300 rounded-md p-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loadingComment}
            />
            <button
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from("worship_availabilities")
                    .update({ comment })
                    .eq("date", date)
                    .eq("phoneNumber", phoneNumber);

                  if (error) {
                    console.error("Error updating comment:", error);
                  } else {
                    console.log("Comment updated successfully");
                  }
                } catch (error) {
                  console.error("Unexpected error:", error);
                }
              }}
              className="bg-gray-300 text-black px-2 py-2 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToggleAvailable;
