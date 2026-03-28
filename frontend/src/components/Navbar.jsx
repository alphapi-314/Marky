import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
        <div className="bg-amber-950 fixed top-0 left-0 w-full h-[84px] justify-between px-7 z-50 flex items-center">
          <div className="transition active:scale-95 font-display text-yellow-100 text-4xl text-shadow-2xs text-shadow-black ">
            <Link to='/'>MARKY</Link>
          </div>
          <div className='flex justify-between gap-7 flex-row items-center'>
            <div className="font-inter text-yellow-100 text-lg flex gap-7 text-shadow-2xs text-shadow-black">
              <Link className='transition active:scale-95' to='/'>Home</Link>
              <Link className='transition active:scale-95' to='/'>Blogs</Link>
              <Link className='transition active:scale-95' to='/editor'>Text Editor</Link>
              <Link className='transition active:scale-95' to='/'>Search</Link>
            </div>
            <div className='flex items-center justify-center'>
              <div className='rounded-l-4xl bg-yellow-100 border-yellow-600  border-t-3 border-l-3  border-b-3 p-1 flex items-center px-3'>
                <Link className='text-amber-950 font-medium font-inter transition active:scale-95' to='/signup'>Signup</Link>
              </div>
            
              <div className='rounded-r-4xl  bg-amber-950 border-yellow-600 border-t-3 border-r-3  border-b-3 p-1 flex items-center px-3'>
                <Link className=' text-yellow-100 font-medium font-inter transition active:scale-95' to='/login'>Login</Link>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default Navbar