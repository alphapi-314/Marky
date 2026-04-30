import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [Name, setName] = useState("")
  const [Email, setEmail] = useState("")
  const [Password, setPassword] = useState("")


  async function chkSignup(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/user/signup",
        {
          username: Name.trim(),
          email: Email.trim().toLowerCase(),
          password: Password,
        }
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        alert("Signup Successful!");
        navigate("/");
      }
    } 
    catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Signup Failed!");
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="absolute inset-0 bg-yellow-100"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          
          <form onSubmit={chkSignup}
            className="bg-yellow-50 py-11  font-inter text-center rounded-3xl flex flex-col items-center justify-center w-130 border drop-shadow-md drop-shadow-amber-950">
            <h2 className="text-4xl font-medium text-center font-inter text-amber-950 mb-8"> Sign Up </h2>

            <input type="text" placeholder="Enter Name" value={Name}
              onChange={(e) => setName(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <input type="email" placeholder="Enter Email" value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <input type="password" placeholder="Enter Password" value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <button type="submit"
              className="bg-amber-950 cursor-pointer text-white p-3 px-6 rounded-3xl hover:bg-amber-900 transition active:scale-97">
              Sign Up
            </button>

            <p className="text-sm text-center mt-4">Already have an account?{" "}
              <span
                className="text-orange-900 cursor-pointer font-semibold hover:underline"
                onClick={() => navigate("/login")}>
                Login
              </span>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;
