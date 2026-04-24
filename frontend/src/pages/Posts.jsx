import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Posts = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOwnedPages() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please login first");
          setLoading(false);
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "/api/user/owned-pages",
          {
            headers: {
              token: token
            }
          }
        );
        console.log(response.data);
        if (!response.data.success) {
          alert("Failed to fetch pages");
          return;
        }
        setPages(response.data.pages);

      } 
      catch (err) {
        console.log("Error:", err.response?.data || err.message);
        alert("Error fetching pages");
      }
      finally {
        setLoading(false);
      }
    }
    fetchOwnedPages();
  }, [navigate]);

  return (
    <div className="bg-yellow-100 min-h-screen pt-[100px]">
      <Navbar/>
      <h1 className="text-4xl font-semibold text-center text-amber-950 mb-8 mt-5">My Blogs</h1>
      <div className="max-w-2xl mx-auto bg-yellow-50 border border-amber-950 rounded-3xl p-6 shadow-md shadow-amber-950">

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : pages.length === 0 ? (
          <p className="text-center font-inter font-medium text-xl text-amber-950">
            No blogs created yet
          </p>
        ) : (
          <div className="flex flex-col gap-7 p-10">
            {pages.map((page) => (
              <div
                key={page.page_id}
                onClick={() => navigate(`/page/${page.page_id}`)}
                className="w-full bg-yellow-100 p-4 rounded-2xl cursor-pointer border-2 border-amber-950 hover:shadow-lg hover:scale-[1.01] transition">
                <h2 className="text-xl font-semibold text-amber-950 mb-1">
                  {page.title}
                </h2>

                <p className="text-sm text-gray-500">
                  {page.createdAt
                    ? new Date(page.createdAt).toLocaleString()
                    : "No date available"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;