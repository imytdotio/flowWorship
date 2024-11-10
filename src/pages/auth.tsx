import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Auth = () => {
  const [phoneNumberInput, setphoneNumberInput] = useState("");
  const [pin, setPin] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { phoneNumber, login } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      navigate("/profile");
    }
  }, [phoneNumber, navigate]);

  const handleLogin = async () => {
    console.log("Logging in with:", { phoneNumberInput, pin: Number(pin) });
    try {
      const { data, error } = await supabase
        .from("worship_usersAuth")
        .select("*")
        .eq("phoneNumber", phoneNumberInput);

      if (error) {
        console.error("Error logging in:", error);
        setMessage("An error occurred during login.");
        setIsSuccess(false);
      } else if (data.length === 0) {
        setMessage("No such phone number.");
        setIsSuccess(false);
      } else if (data[0].pin !== Number(pin)) {
        setMessage("Wrong password.");
        setIsSuccess(false);
      } else {
        console.log("Login successful:", data);
        login(phoneNumberInput);
        setMessage("");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage("Unexpected error occurred.");
      setIsSuccess(false);
    }
  };

  const handleSignUp = async () => {
    console.log("Signing up with:", { phoneNumberInput, pin });
    if (phoneNumberInput.length !== 8) {
      setMessage("Phone number wrong. It must be 8 digits.");
      setIsSuccess(false);
      return;
    }

    try {
      const { data: existingUser, error: existingUserError } = await supabase
        .from("worship_usersAuth")
        .select("phoneNumber")
        .eq("phoneNumber", phoneNumberInput);

      if (existingUserError) {
        console.error("Error checking existing user:", existingUserError);
        setMessage("An error occurred during sign up.");
        setIsSuccess(false);
        return;
      }

      if (existingUser.length > 0) {
        setMessage("Registered. Phone number already exists.");
        setIsSuccess(false);
        return;
      }

      const { data: authData, error: authError } = await supabase
        .from("worship_usersAuth")
        .insert([{ phoneNumber: phoneNumberInput, pin }]);

      if (authError) {
        console.error("Error signing up:", authError);
        setMessage("An error occurred during sign up.");
        setIsSuccess(false);
        return;
      }

      console.log(
        "User signed up successfully in worship_usersAuth:",
        authData
      );
      setMessage("Signed up successfully.");
      setIsSuccess(true);

      const { data: profileData, error: profileError } = await supabase
        .from("worship_profile_info")
        .insert([{ phoneNumber: phoneNumberInput }]);

      if (profileError) {
        console.error("Error creating profile info:", profileError);
      } else {
        console.log("Profile info created successfully:", profileData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage("Unexpected error occurred.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 ${
            isLoginMode ? "border-b-2" : "border-b-2 border-transparent"
          }`}
          onClick={() => setIsLoginMode(true)}
        >
          登入
        </button>
        <button
          className={`px-4 py-2 ${
            !isLoginMode ? "border-b-2" : "border-b-2 border-transparent"
          }`}
          onClick={() => setIsLoginMode(false)}
        >
          註冊
        </button>
      </div>
      <div className="flex flex-col gap-4 w-full sm:w-1/2">
        <input
          type="text"
          placeholder="電話號碼"
          value={phoneNumberInput}
          onChange={(e) => setphoneNumberInput(e.target.value)}
          className="border-2 border-gray-300 rounded-md p-2"
        />
        <input
          type="password"
          placeholder="短密碼"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="border-2 border-gray-300 rounded-md p-2"
        />
        <button
          onClick={isLoginMode ? handleLogin : handleSignUp}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {isLoginMode ? "登入" : "註冊"}
        </button>
        {message && (
          <p
            className={`text-center ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
