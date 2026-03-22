import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Login = () => {
  const navigate = useNavigate();

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let isEmail = loginInput.includes("@");

    if (!loginInput || !password) {
      alert("Please fill all fields");
      return;
    }

    if (isEmail) {
      console.log("Login using EMAIL:", loginInput);
    } else {
      console.log("Login using USERNAME:", loginInput);
    }

    navigate("/home");
  };

  return (
    <div className="relative min-h-screen w-full">

      {}
      <div className="absolute inset-0 bg-yellow-100"></div>
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
              Login
            </h2>

            {}
            <input
              type="text"
              placeholder="Enter Email or Username"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
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

            {}
            <button
              type="submit"
              className="bg-orange-900 text-white p-3 rounded-lg hover:bg-orange-800 transition"
            >
              Login
            </button>

            {}
            <p className="text-sm text-center mt-4">
              Don't have an account?{" "}
              <span
                className="text-orange-900 font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </p>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
