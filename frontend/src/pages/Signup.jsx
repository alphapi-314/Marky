import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");   
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    console.log("Name:", name);   
    console.log("Email:", email);
    console.log("Password:", password);

    alert("Signup Successful!");
    navigate("/");
  };

  return (
    <div className="relative min-h-screen w-full">

      {}
      <div className="absolute inset-0 bg-yellow-100"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <Navbar />

        <div className="flex items-center justify-center flex-grow">
          
          <form onSubmit={handleSubmit}
            className="bg-yellow-50 py-11  font-inter text-center rounded-3xl flex flex-col items-center justify-center w-130 drop-shadow-md drop-shadow-amber-950"
          >
            <h2 className="text-3xl font-medium text-center font-inter text-amber-950 mb-7">
              Sign Up
            </h2>

            {}
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            {}
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            {}
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <button type="submit"
              className="bg-amber-950 cursor-pointer text-white p-3 px-6 rounded-3xl hover:bg-amber-900 transition active:scale-97">
              Sign Up
            </button>

            {}
            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <span
                className="text-orange-900 cursor-pointer font-semibold hover:underline"
                onClick={() => navigate("/")}
              >
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
