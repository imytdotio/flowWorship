import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import supabase from "../utils/supabase";

type Skill = {
  id: string;
  skillName: string;
  area: string;
};

type ProfileSkill = {
  phoneNumber: string;
  skillId: number;
};

type ProfileSkillsProps = {
  onUserSkillsChange: (newSkills: ProfileSkill[]) => void;
};

const ProfileSkills: React.FC<ProfileSkillsProps> = ({
  onUserSkillsChange,
}) => {
  const { phoneNumber } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<ProfileSkill[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from("worship_skills")
          .select("*");
        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    const fetchUserSkills = async () => {
      if (!phoneNumber) return;
      try {
        const { data, error } = await supabase
          .from("worship_profile_skills")
          .select("phoneNumber, skillId")
          .eq("phoneNumber", phoneNumber);
        if (error) throw error;
        setUserSkills(data || []);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching user skills:", error);
      }
    };

    fetchSkills();
    fetchUserSkills();
  }, [phoneNumber]);

  useEffect(() => {
    if (!isInitialLoad) {
      onUserSkillsChange(userSkills);
    }
  }, [userSkills]);

  const SkillButton = ({
    skillName,
    skillId,
  }: {
    skillName: string;
    skillId: string;
  }) => {
    const acquired = userSkills.some(
      (userSkill) => userSkill.skillId === Number(skillId)
    );

    const handleButtonClick = () => {
      if (phoneNumber) {
        if (!acquired) {
          setUserSkills((prevUserSkills) => {
            const updatedSkills: ProfileSkill[] = [
              ...prevUserSkills,
              { phoneNumber, skillId: Number(skillId) },
            ];
            return updatedSkills;
          });
        } else {
          setUserSkills((prevUserSkills) => {
            const updatedSkills = prevUserSkills.filter(
              (userSkill) => userSkill.skillId !== Number(skillId)
            );
            return updatedSkills;
          });
        }
      }
    };

    return (
      <button
        onClick={handleButtonClick}
        className={`border border-gray-200 text-black px-2 py-1 rounded-md ${
          acquired ? "bg-teal-300 border-teal-300" : ""
        }`}
      >
        {skillName}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold border-b-2 border-gray-300 w-fit">
        Profile Skills
      </h1>
      <div className="flex flex-row gap-2 flex-wrap">
        {skills.map((skill) => (
          <SkillButton
            key={skill.id}
            skillName={skill.skillName}
            skillId={skill.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfileSkills;