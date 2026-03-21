import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
        <div className="bg-amber-950 h-[84px] justify-between px-7 flex items-center">
          <div className="font-display text-yellow-100 text-4xl text-shadow-2xs text-shadow-black">
            <Link to='/'>MARKY</Link>
          </div>
          {/* <div style={{ fontFamily: "Poppins" }}>hello how are you</div> */}
          <div className="font-baskerville text-orange-100 text-lg flex gap-7 text-shadow-2xs text-shadow-black">
            <Link to='/'>Home</Link>
            <Link to='/'>Blogs</Link>
            <Link to='/editor'>Text Editor</Link>
            <Link to='/'>Login</Link>
          </div>
        </div>
    </>
  )
}

export default Navbar