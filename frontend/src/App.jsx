import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import TextEditor from './pages/TextEditor'
import Login from './pages/Login'
import Signup from './pages/Signup'   

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />        
        <Route path="/signup" element={<Signup />} />   {}
        <Route path="/home" element={<Home />} />
        <Route path="/editor" element={<TextEditor />} />
      </Routes>
    </>
  )
}

export default App
