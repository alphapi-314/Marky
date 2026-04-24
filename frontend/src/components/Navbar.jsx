import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Dropdown from './Dropdown';

const Navbar = () => {
  const navigate=useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
  const handleClick = () => setShowMenu(false);
  window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = "/home";
  }

  return (
    <div className="bg-amber-950 fixed top-0 left-0 w-full h-[84px] justify-between px-7 z-50 flex items-center">
      <div className="font-display text-yellow-100 text-4xl transition active:scale-95">
        <Link to='/'>MARKY</Link>
      </div>

      <div className='flex gap-7 items-center'>
        <div className="font-inter text-yellow-100 text-lg flex gap-7">
          <Link className='transition active:scale-95' to='/'>Home</Link>
          <Link className='transition active:scale-95' to='/editor'>Write</Link>
          <Link className='transition active:scale-95' to='/search'>Search</Link>
        </div>

        <div className='flex items-center justify-center'>
          {isLoggedIn ? (
            <Dropdown user={user} showMenu={showMenu} setShowMenu={setShowMenu} logout={logout} />
          ) : (
            <>
              <div className='rounded-l-4xl bg-yellow-100 border-yellow-800 border-t-3 border-l-3 border-b-3 p-1 flex items-center px-3'>
                <Link className='text-amber-950 font-medium font-inter transition active:scale-95' to='/signup'>Signup</Link>
              </div>
              <div className='rounded-r-4xl bg-amber-950 border-yellow-800 border-t-3 border-r-3 border-b-3 p-1 flex items-center px-3'>
                <Link className='text-yellow-100 font-medium font-inter transition active:scale-95' to='/login'>Login</Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default Navbar;