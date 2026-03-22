import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter email");
      return;
    }

    console.log("Send OTP to:", email);

    // later → backend will send OTP
    alert("OTP sent to your email");

    // ✅ FIXED FLOW
    navigate("/verify-otp");
  };

  return (
    <div className="relative min-h-screen w-full">

      {/* Background */}
      <div className="absolute inset-0 bg-yellow-100"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-white/30"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <Navbar />

        <div className="flex items-center justify-center flex-grow">
          
          <form
            onSubmit={handleSubmit}
            className="bg-yellow-50 p-10 rounded-2xl shadow-2xl flex flex-col w-96 border border-yellow-200"
          >
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-6">
              Forgot Password
            </h2>

            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <button
              type="submit"
              className="bg-orange-900 text-white p-3 rounded-lg hover:bg-orange-800 transition"
            >
              Send OTP
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;