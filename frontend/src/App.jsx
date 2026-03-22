import { useState } from 'react'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Home from './pages/Home'
import TextEditor from './pages/TextEditor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} ></Route>
        <Route path="/editor" element={<TextEditor/>}></Route>
      </Routes>
    </>
  )
}

export default App
