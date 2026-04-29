import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  async function fetchResults(value = "") {
    try {
      const res = await axios.get(`/api/pages/search?query=${value}`);
      if (res.data.success) {
        setResults(res.data.results);
        setPage(0);
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

  const isSearching = query.trim() !== "";
  const sourceResults = isSearching ? results : results;
  const totalPages = Math.ceil(sourceResults.length / PAGE_SIZE);
  const displayedResults = sourceResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-yellow-100 font-inter min-h-screen pt-[84px]">
      <Navbar />
      <div className="flex justify-center mt-12">
        <input
          type="text"
          placeholder="Search Blogs..."
          value={query}
          onChange={handleChange}
          className="w-[20%] p-4 text-amber-950 bg-yellow-50 rounded-3xl border border-amber-950 outline-1"
        />
      </div>
      <div className="mt-12 p-2 flex flex-col items-center gap-5 min-h-[430px]">
        {displayedResults.length === 0 ? (
          <p className="text-amber-950 text-lg">No results found :(</p>
        ) : (
          displayedResults.map((page) => (
            <div
              key={page.page_id}
              onClick={() => navigate(`/page/${page.page_id}`)}
              className="w-[50%] bg-yellow-50 border-2 p-4 pl-7 rounded-2xl cursor-pointer hover:shadow-lg hover:scale-[1.01] transition"
            >
              <h2 className="text-xl font-semibold text-amber-950">
                {page.title}
              </h2>
            </div>
          ))
        )}
      </div>

    {totalPages > 1 && (
      <div className="flex justify-center items-center gap-6 mt-8 mb-10">
        
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 0}
          className="bg-amber-950 text-white p-2 px-5 rounded-2xl 
          transition cursor-pointer
          hover:bg-amber-800 hover:text-yellow-100 active:scale-95 
          disabled:opacity-40 disabled:cursor-not-allowed 
          disabled:pointer-events-none 
          disabled:hover:bg-amber-950 disabled:hover:text-white 
          disabled:active:scale-100"
        > Prev
        </button>
        <span className="text-amber-950 font-medium">
          {page + 1} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages - 1}
          className="bg-amber-950 text-white p-2 px-5 rounded-2xl 
          transition cursor-pointer
          hover:bg-amber-800 hover:text-yellow-100 active:scale-95 
          disabled:opacity-40 disabled:cursor-not-allowed 
          disabled:pointer-events-none 
          disabled:hover:bg-amber-950 disabled:hover:text-white 
          disabled:active:scale-100"
        > Next
        </button>

      </div>
    )}
    </div>
  );
};

export default Search;