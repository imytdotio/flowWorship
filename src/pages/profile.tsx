import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import ProfileInfo from "../components/profile_info";
import ProfileSkills from "../components/profile_skills";

type ProfileSkill = {
  phoneNumber: string;
  skillId: number;
};

const Profile = () => {
  const { phoneNumber, logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userSkills, setUserSkills] = useState<ProfileSkill[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/auth");
    } else {
    }
  }, [phoneNumber, navigate]);

  const handleUserNameChange = (newUserName: string) => {
    setUserName(newUserName);
    setHasUnsavedChanges(true);
  };

  const handleUserSkillsChange = (newSkills: ProfileSkill[]) => {
    setUserSkills(newSkills);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    console.log("Saving user name:", userName);
    console.log("Using phoneNumber:", phoneNumber);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("worship_profile_info")
        .update({ userName })
        .eq("phoneNumber", phoneNumber);

      if (profileError) {
        console.error("Error updating profile info:", profileError);
      } else if (profileData === null) {
        console.log("No matching record found to update.");
      } else {
        console.log("Profile info updated successfully:", profileData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }

    try {
      const { data: skillsData, error: skillsError } = await supabase
        .from("worship_profile_skills")
        .delete()
        .eq("phoneNumber", phoneNumber);
      if (skillsError) {
        console.error("Error deleting old skills:", skillsError);
      } else {
        console.log("Old skills deleted successfully:", skillsData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }

    try {
      const { data: skillsData, error: skillsError } = await supabase
        .from("worship_profile_skills")
        .insert(userSkills);
      if (skillsError) {
        console.error("Error inserting new skills:", skillsError);
      } else {
        console.log("New skills inserted successfully:", skillsData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* <h1 className="">Profile</h1> */}
      <ProfileInfo onUserNameChange={handleUserNameChange} />
      <ProfileSkills onUserSkillsChange={handleUserSkillsChange} />
      <button
        onClick={handleSave}
        className={`rounded-md border px-2 ${
          hasUnsavedChanges
            ? "bg-teal-300 border-teal-300"
            : "bg-transparent border-gray-200"
        }`}
      >
        記得 Save
      </button>
      <button
        onClick={logout}
        className="rounded-md border px-2 hover:bg-red-300 hover:border-red-300 transition duration-200"
      >
        登出
      </button>
    </div>
  );
};

export default Profile;
