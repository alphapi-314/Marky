import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  async function fetchResults(value = "") {
    try {
      const res = await axios.get(`/api/pages/search?query=${value}`);
      if (res.data.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchResults("");
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);

    fetchResults(value);
  }

  return (
    <div className="bg-yellow-100 font-inter min-h-screen pt-[84px]">
      <Navbar />

      <div className="flex justify-center mt-10">
        <input
          type="text"
          placeholder="Search blogs..."
          value={query}
          onChange={handleChange}
          className="w-[60%] p-4 text-amber-950 bg-yellow-50 rounded-xl border border-amber-950 outline-1"
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">

        {results.length === 0 ? (
          <p className="text-amber-950 text-lg">No results found</p>
        ) : (
          results.map((page) => (
            <div
              key={page.page_id}
              onClick={() => navigate(`/page/${page.page_id}`)}
              className="w-[60%] bg-yellow-50 border-2 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.01] transition"
            >
              <h2 className="text-xl font-semibold text-amber-950">
                {page.title}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                {new Date(page.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Search;