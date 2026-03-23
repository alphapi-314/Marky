import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
        <div className="bg-amber-950 fixed top-0 left-0 w-full h-[84px] justify-between px-7 z-50 flex items-center">
          <div className="font-display text-yellow-100 text-4xl text-shadow-2xs text-shadow-black">
            <Link to='/'>MARKY</Link>
          </div>
          <div className='flex justify-between gap-7 flex-row items-center'>
            <div className="font-inter text-yellow-100 text-lg flex gap-7 text-shadow-2xs text-shadow-black">
            <Link to='/'>Home</Link>
            <Link to='/'>Blogs</Link>
            <Link to='/editor'>Text Editor</Link>
            <Link to='/'>Search</Link>
          </div>
          <div className='flex items-center justify-center'>
            <div className='rounded-l-4xl bg-yellow-100 border-yellow-600  border-t-2 border-l-2 border-r border-b-2 p-1 flex items-center px-3'>
              <Link className='text-amber-950 font-medium font-inter' to='/signup'>Signup</Link>
            </div>
            
            <div className='rounded-r-4xl  bg-amber-950 border-yellow-600 border-t-2 border-r-2 border-l border-b-2 p-1 flex items-center px-3'>
              <Link className=' text-yellow-100 font-medium font-inter' to='/login'>Login</Link>
            </div>
          </div>
          </div>
        </div>
    </>
  )
}

export default Navbar