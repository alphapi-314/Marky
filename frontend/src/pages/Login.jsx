import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate();

  const [Input, setInput] = useState("")
  const [Password, setPassword] = useState("")

  async function chkLogin(e) {
    e.preventDefault();
    try {
      const isEmail = Input.includes("@");
      const payload = {
        password: Password,
      };
      if (isEmail) payload.email = Input.trim().toLowerCase();
      else payload.username = Input.trim();
      const response = await axios.post(
        "/api/user/login",
        payload
      );
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        alert("Login Successful!");
        navigate("/");
      }
    } 
    catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Invalid Credentials!");
    }
  }

  return (
    <div className="min-h-screen w-full bg-yellow-100 flex flex-col items-center justify-center"> 
          <Navbar />
        <div className="flex items-center justify-center">
          <form onSubmit={chkLogin} className="bg-yellow-50 py-11 font-inter text-center rounded-3xl flex flex-col items-center justify-center w-130 border drop-shadow-amber-950 drop-shadow-md">

            <h2 className="text-4xl font-medium text-center font-inter text-amber-950 mb-8"> Login </h2>

            <input type="text" placeholder="Enter Email/Username" value={Input}
              onChange={(e) => setInput(e.target.value)}
              className="mb-5 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <input type="password" placeholder="Enter Password" value={Password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <div className="text-orange-900 font-normal text-sm w-80 flex justify-end cursor-pointer mb-3  hover:underline">
              <p onClick={() => navigate("/forgot")}>Forgot Password?</p>
            </div>

            <button type="submit" className="bg-amber-950 cursor-pointer text-yellow-50 p-3 px-7 rounded-3xl hover:bg-amber-900 transition active:scale-97"> Login
            </button>

            <p className="text-sm text-center mt-4">Don't have an account?{" "}
              <span
                className="text-orange-900 font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}>
                Sign Up
              </span>
            </p>

          </form>
        </div>
      </div>
  );
};

export default Login;
