import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // if (!email) {
    //   alert("Please enter email");
    //   return;
    // }

    // console.log("Send OTP to:", email);

    alert("OTP sent to your email");

    navigate("/verify");
  };

  return (
    <div className="min-h-screen w-full bg-yellow-100 flex flex-col items-center justify-center">
        <Navbar />
        <div className="relative flex items-center justify-center">

          <form onSubmit={handleSubmit} className="bg-yellow-50 p-13 font-inter text-center rounded-3xl flex flex-col items-center justify-center w-105 drop-shadow-amber-950 drop-shadow-md">

            <h2 className="text-3xl font-medium text-center font-inter text-amber-950 mb-9"> Forgot Password</h2>

            <input type="email" placeholder="Enter your Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-6 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <button type="submit" className="bg-amber-950 cursor-pointer text-yellow-50 w-auto p-3 px-7 rounded-3xl hover:bg-amber-900 transition active:scale-97">
              Send OTP
            </button>
          </form>

        </div>
    </div>
  );
};

export default ForgotPassword;
