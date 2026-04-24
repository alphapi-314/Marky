import { useNavigate } from 'react-router-dom';

const Dropdown = ({ user, showMenu, setShowMenu, logout }) => {
const navigate = useNavigate();
  return (
    <div className="relative">
      <div
        onClick={(e) => { e.stopPropagation(); setShowMenu(prev => !prev); }}
        className="w-10 h-10 rounded-full bg-yellow-100 text-amber-950 flex items-center justify-center font-medium text-lg cursor-pointer hover:scale-105 transition"
      >
        {user?.username?.charAt(0).toUpperCase()}
      </div>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-40 bg-yellow-50 drop-shadow-md drop-shadow-amber-950 text-amber-950 rounded-xl border font-medium border-amber-950 overflow-hidden">
          <div className="flex flex-col justify-between">
            <button
              onClick={() => navigate("/profile")}
              className="text-left px-6 py-2 cursor-pointer hover:bg-amber-950 hover:text-yellow-100 transition">Profile
            </button>
            <hr></hr>
            <button
              onClick={() => navigate("/posts")}
              className="text-left px-6 py-2 cursor-pointer hover:bg-amber-950 hover:text-yellow-100 transition">My Blogs
            </button>
            <hr></hr>
            <button
                onClick={logout}
                className="text-left px-6 py-2 cursor-pointer hover:text-yellow-100 hover:bg-red-800 transition">Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown