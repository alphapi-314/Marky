import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import TextEditor from './pages/TextEditor'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyOtp from './pages/VerifyOtp'   

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {}
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/editor" element={<TextEditor />} />
      </Routes>
    </>
  )
}

export default App
