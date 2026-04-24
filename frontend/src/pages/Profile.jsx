import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login first");
          navigate("/login");
          return;
        }
        const res = await axios.get(
          "http://localhost:5000/api/user/me",
          {
            headers: { token }
          }
        );

        setUser(res.data.user);
        setAuthorName(res.data.user.authorName || res.data.user.username);

      } catch (err) {
        console.log(err);
        alert("Error loading profile");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [navigate]);

    async function updateAuthorName() {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
        "http://localhost:5000/api/user/update-author",
        { authorName },
        {
            headers: { token }
        }
        );
        if (response.data.success) {
        setUser((prevUser) => ({
            ...prevUser,
            authorName: response.data.user.authorName
        }));

        setIsEditing(false);
        alert("Author name updated!");
        }

    } catch (err) {
        console.log(err);
        alert("Update failed");
    }
    }

    if (loading) return <p className="text-center mt-20">Loading...</p>;
    if (!user) return <p className="text-center mt-20">Failed to load profile</p>;

    return (
    <div className="bg-yellow-100 min-h-screen pt-[100px] font-inter">
        <Navbar />
        <h1 className="text-4xl font-semibold text-center text-amber-950 mb-8 mt-5">
        Profile
        </h1>
        <div className="max-w-2xl mx-auto bg-yellow-50 border border-amber-950 rounded-2xl p-12 shadow-md shadow-amber-950 space-y-6">


        <div className="mb-0 text-amber-950 mb-2 flex items-center justify-between">
            <p className="text-lg"><b>Author Name:</b> {authorName}</p>
            {!isEditing && (
                <button
                onClick={() => setIsEditing(true)}
                className="bg-amber-950 text-base text-yellow-100  cursor-pointer px-3 py-2 rounded-2xl hover:bg-amber-900">Change
                </button>
            )}
        </div>
        {isEditing && (
        <div className="mb-4 flex text-base gap-3">
            <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="flex-1 p-2 rounded-lg border border-amber-950 outline-none"
            />
            <button onClick={updateAuthorName}  className="bg-amber-950 cursor-pointer text-yellow-100 px-4 py-2 rounded-2xl hover:bg-amber-900">Save
            </button>

            <button onClick={() => setIsEditing(false)} className="bg-amber-950 cursor-pointer text-yellow-100 px-4 py-2 rounded-2xl hover:bg-amber-900">Cancel
            </button>
        </div>
        )}

        <div className="text-amber-950 flex flex-col gap-4 text-lg">
            <p><b>Username:</b> {user.username}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Blogs Written:</b> {user.ownedPages?.length || 0}</p>
        </div>
        </div>
    </div>
    );
}

export default Profile;