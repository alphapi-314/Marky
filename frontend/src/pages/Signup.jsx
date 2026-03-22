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

      {}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/30"></div>

      {}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <Navbar />

        <div className="flex items-center justify-center flex-grow">
          
          <form
            onSubmit={handleSubmit}
            className="bg-yellow-50 p-10 rounded-2xl shadow-2xl flex flex-col w-96 border border-yellow-200"
          >
            <h2 className="text-3xl font-bold text-center text-orange-900 mb-6">
              Sign Up
            </h2>

            {}
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            {}
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            {}
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <button
              type="submit"
              className="bg-orange-900 text-white p-3 rounded-lg hover:bg-orange-800 transition"
            >
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
