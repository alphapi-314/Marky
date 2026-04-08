import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate=useNavigate();
  return (
    <div className='bg-yellow-100 flex flex-col min-h-screen w-full'>
      <Navbar/>
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="max-w-6xl text-amber-950 text-center">
          <h2 className="font-display font-extrabold text-5xl mb-5">Welcome to Marky</h2>
          <span>
            <p className='[word-spacing:1px] font-inter font-normal text-xl'>
            The simplest way to turn your ideas into a beautiful blog. No coding, no complicated builders, no messy layouts. Just write in plain Markdown, and Marky instantly transforms your words into a clean, professional webpage. Your content and design are always kept separate, so your blog stays fast, flexible, and fully yours. With real-time preview, built-in search, and effortless publishing, Marky gives every writer(beginner or expert) the power to create, manage, and share their stories without the technical headache. <span className='font-bold'>Write more. Worry less. Blog with Marky.</span>
          </p>
          </span>
        </div>
        <button onClick={function() {
          navigate('/editor')
        }} className='mt-5 w-46 h-14 text-xl font-inter text-yellow-100 bg-amber-950 rounded-4xl cursor-pointer hover:bg-amber-900 transition active:scale-97'>Start Writing</button>
      </div>
      <Footer/>
    </div>
  )
}

export default Home