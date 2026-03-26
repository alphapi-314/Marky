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

    // if (!otp) {
    //   alert("Enter OTP");
    //   return;
    // }

    // console.log("OTP:", otp);

    alert("OTP Verified");
    navigate("/reset");
  };

  return (
    <div className="min-h-screen w-full bg-yellow-100 flex flex-col items-center justify-center">  
        <Navbar />

        <div className="relative flex font-inter items-center justify-center">
          
          <form onSubmit={handleSubmit} className="bg-yellow-50 p-12 font-inter text-center rounded-3xl flex flex-col items-center justify-center w-105 drop-shadow-amber-950 drop-shadow-md">
            <h2 className="text-3xl font-medium text-center text-amber-950 mb-8"> Verify OTP
            </h2>

            <input type="text" placeholder="Enter OTP" value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-6 p-3 text-amber-950 rounded-lg w-80 outline-1 focus:ring-2 focus:ring-amber-900"
              required
            />

            <div className="flex items-center justify-center mb-2 gap-2">
              {timer > 0 && (
                <span className="text-amber-950 text-sm">
                  00:{timer < 10 ? `0${timer}` : timer}
                </span>
              )}

              <span
                onClick={handleResend} className={`text-base ${
                  timer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-orange-900 cursor-pointer hover:underline"
                }`}
              > Resend OTP
              </span>
            </div>

            <button type="submit" className="bg-amber-950 mt-1 w-auto cursor-pointer text-yellow-50 p-3 px-7 rounded-3xl hover:bg-amber-900 transition active:scale-97">
              Verify
            </button>

          </form>
        </div>
    </div>
  );
};

export default VerifyOtp;
