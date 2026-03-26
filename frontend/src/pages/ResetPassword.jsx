import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState(""); 

  const handleSubmit = (e) => {
    e.preventDefault();

    // if (!newPassword) {
    //   alert("Enter new password");
    //   return;
    // }

    // console.log("New Password:", newPassword);

    
    alert("Password reset successful!");

    navigate("/login"); 
  };

  return (
    <div className="min-h-screen w-full bg-yellow-100 flex flex-col items-center justify-center">
        <Navbar />
        <div>
          <form onSubmit={handleSubmit} className="bg-yellow-50 py-11 font-inter text-center rounded-3xl flex flex-col items-center justify-center w-115 drop-shadow-amber-950 drop-shadow-md">
            <h2 className="text-3xl font-medium text-center font-inter text-amber-950 mb-8">Reset Password</h2>
            <input type="password" placeholder="Enter New Password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />
            <input type="password" placeholder="Enter Password Again" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />
            <button
              type="submit"
              className="bg-amber-950 w-auto cursor-pointer mt-1 text-yellow-50 p-3 px-7 rounded-3xl hover:bg-amber-900 transition active:scale-97">
              Reset
            </button>
          </form>
        </div>
    </div>
  );
};

export default ResetPassword;
