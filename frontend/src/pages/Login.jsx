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
    <div className="relative min-h-screen w-full bg-yellow-100 flex flex-col items-center justify-center"> 
          <Navbar />
        
        <div className="relative flex items-center justify-center">
          
          <form onSubmit={handleSubmit} className="bg-yellow-50 py-11 font-inter text-center rounded-3xl flex flex-col items-center justify-center w-130 drop-shadow-amber-950 drop-shadow-md">

            <h2 className="text-3xl font-medium text-center font-inter text-amber-950 mb-7"> Login </h2>

            <input type="text" placeholder="Enter Email or Username" value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <button type="submit" className="bg-amber-950 cursor-pointer text-yellow-50 p-3 px-7 rounded-3xl hover:bg-amber-900 transition active:scale-97"> Login
            </button>

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
  );
};

export default Login;
