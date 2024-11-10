import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";

type ProfileInfoProps = {
  onUserNameChange: (newUserName: string) => void;
};

const ProfileInfo: React.FC<ProfileInfoProps> = ({ onUserNameChange }) => {
  const { phoneNumber } = useAuth();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (phoneNumber) {
      fetchUserName();
    }
  }, [phoneNumber]);

  const fetchUserName = async () => {
    try {
      const { data, error } = await supabase
        .from("worship_profile_info")
        .select("userName")
        .eq("phoneNumber", phoneNumber)
        .single();

      if (error) {
        console.error("Error fetching user name:", error);
      } else {
        setUserName(data.userName || "");
        onUserNameChange(data.userName || "");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserName = e.target.value;
    setUserName(newUserName);
    onUserNameChange(newUserName);
  };



  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold border-b-2 border-gray-300 w-fit">
        Profile Info
      </h1>
      <div className="flex flex-row gap-2 justify-between">
        <span>Phone Number:</span>
        <input type="text" value={phoneNumber || ""} className="" disabled />
      </div>
      <div className="flex flex-row gap-2 justify-between">
        <span>Name: </span>
        <input
          type="text"
          value={userName}
          onChange={handleChange}
          placeholder="你個大名"
        />
      </div>
    </div>
  );
};

export default ProfileInfo;