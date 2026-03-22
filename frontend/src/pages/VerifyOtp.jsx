import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const VerifyOtp = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

  
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  
  const handleResend = () => {
    if (timer > 0) return;

    console.log("Resending OTP...");
    alert("OTP resent!");

    setTimer(60);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Enter OTP");
      return;
    }

    console.log("OTP:", otp);

    alert("OTP Verified");
    navigate("/reset-password");
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
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-6">
              Verify OTP
            </h2>

            {}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-4 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            {}
            <div className="flex items-center justify-center gap-2 mb-3">
              
              {}
              {timer > 0 && (
                <span className="text-gray-600 text-sm">
                  00:{timer < 10 ? `0${timer}` : timer}
                </span>
              )}

              {}
              <span
                onClick={handleResend}
                className={`text-base ${
                  timer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-orange-900 cursor-pointer hover:underline"
                }`}
              >
                Resend OTP
              </span>

            </div>

            {}
            <button
              type="submit"
              className="bg-orange-900 text-white p-3 rounded-lg hover:bg-orange-800 transition"
            >
              Verify OTP
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
