import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/common/Card";
import { API_URL } from "../config";
import Wishlist from "../components/curator/wishlist";

export default function Search() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searching, setSearching] = useState(false);

  const [artifacts, setArtifacts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Suggestion States ---
  const [sugg, setSugg] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMuseum, setFilterMuseum] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [order, setOrder] = useState("");
  const [page, setPage] = useState(1);

  const [museums, setMuseums] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [categories, setCategories] = useState([]);

  const [wishlist, setWishlist] = useState([]);

  const [yearRange, setYearRange] = useState([-2000, 1500]);
  const minYear = -3000;
  const maxYear = 2024;

  const formatYear = (year) => {
    if (year < 0) return `${Math.abs(year)} BC`;
    if (year > 0) return `AD ${year}`;
    return "1 BC";
  };

  const getPercent = (value) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "curator") {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/search/authorize`, {
          method: "GET",
          headers: { token: token },
        });

        const parseRes = await response.json();

        if (response.ok) {
          setUser(parseRes.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/search/filters`, {
          headers: { token: token },
        });

        const parseRes = await response.json();

        console.log("Check Filters Data:", parseRes);

        if (response.ok) {
          setCategories(parseRes.categories);
          setOrigins(parseRes.origins);
          setMuseums(parseRes.museums);
          setWishlist(parseRes.wishlist);
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err.message);
      }
    };

    if (localStorage.getItem("token")) {
      fetchFilters();
    }
  }, []);

  //Suggestion Fetching  ---
  const handleSearchInput = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/search/suggest?letters=${value}`,
          {
            headers: { token: token },
          },
        );
        const data = await response.json();

        // console.log("letters:", value);
        // console.log("Backend :", response.status);
        // console.log("Data :", data);

        if (response.ok) {
          setSugg(data);
          setShowSugg(true);
        }
      } catch (error) {
        console.error("Suggestions failed:", error.message);
      }
    } else {
      setSugg([]);
      setShowSugg(false);
    }
  };
  const [popMsg, setPopMsg] = useState(null);

  const handleRemoveFav = async (artifactId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/search/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ artifact_id: artifactId }),
      });

      const res = await response.json();

      setPopMsg(res.msg || res.error);

      if (response.ok) {
        const updated = wishlist.filter(
          (item) => item.artifact_id !== artifactId,
        );
        setWishlist(updated);
      }
    } catch (error) {
      setPopMsg("An error occurred. Please try again.");
    } finally {
      setTimeout(() => setPopMsg(null), 3000);
    }
  };

  const fetchArtifacts = async () => {
    setSearching(true);
    setShowSugg(false);
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append("letters", searchTerm);
      if (filterMuseum) params.append("museum", filterMuseum);
      if (filterOrigin) params.append("origin", filterOrigin);
      if (filterCat) params.append("category", filterCat);
      if (order) params.append("order", order);

      params.append("start", yearRange[0]);
      params.append("end", yearRange[1]);
      params.append("page", page);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/search?${params.toString()}`, {
        headers: { token: token },
      });

      const data = await response.json();

      if (response.ok) {
        setArtifacts(data.artifacts);
        setTotalItems(data.total);
        setTotalPages(data.total_pages);
      }
    } catch (error) {
      console.error("Search failed:", error.message);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMuseum, filterOrigin, filterCat, order, yearRange, page]);

  const [isWishlistVisible, setWishlistVisible] = useState(false);

  const toggleWishlist = () => {
    setWishlistVisible((prev) => !prev);
  };

  return (
    <>
      {/* dual slider styles */}
      <style>{`
        .dual-range::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #f59e0b; /* amber-500 */
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .dual-range::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          background: #f59e0b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="relative min-h-screen bg-old-paper font-dmsans text-dark flex flex-col">
        {/* Noise Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-15 bg-noise mix-blend-multiply"></div>

        {/* --- Navbar --- */}
        <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-black"
              >
                <li>
                  <a>My Museums</a>
                </li>
                <li>
                  <a>Explore</a>
                </li>
                <li>
                  <a>Book a Tour</a>
                </li>
              </ul>
            </div>
            <a className="btn btn-ghost text-xl text-white ml-2">Kyubiku</a>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-5 text-white">
              <li>
                <Link to="/my-museums">My museums</Link>
              </li>
              <li>
                <a>Explore</a>
              </li>
              <li>
                <a>Book a Tour</a>
              </li>
            </ul>
          </div>
          <div className="navbar-end">
            <div className="avatar avatar-online">
              <div className="w-12 rounded-full">
                <img
                  src={user?.avatar_url || "https://placehold.co/150"}
                  alt="User Avatar"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Searchbar section --- */}
        <div className="relative h-100 w-full">
          <img
            src="https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=2070&auto=format&fit=crop"
            alt="bg-pic"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-50 flex flex-col items-center justify-center h-full px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide">
              Step Into the Unknown
            </h1>
            <p className="text-gray-200 mb-8 max-w-lg">
              Explore thousands of years of history through our digital
              archives.
            </p>

            {/* Search Bar Container */}
            <div className="relative w-full max-w-2xl">
              <div className="join w-full shadow-xl">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onKeyDown={(e) => e.key === "Enter" && fetchArtifacts()}
                  onFocus={() => {
                    if (sugg.length > 0) setShowSugg(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSugg(false), 200);
                  }}
                  placeholder="Search for sculptures, authors, artifacts..."
                  className="input input-bordered join-item w-full bg-white h-14 text-lg focus:outline-none border-none pl-6 text-stone-900"
                />
                <button
                  onClick={fetchArtifacts}
                  className="btn btn-primary join-item h-14 px-8 text-lg bg-amber-400 hover:bg-amber-500 border-none text-white"
                >
                  Search
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSugg && sugg.length > 0 && (
                <div className="absolute top-full left-0 w-[calc(100%-110px)] mt-2 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-stone-200 text-left">
                  {sugg.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-none transition-colors"
                      onClick={() => {
                        setSearchTerm(item.artifact_name);
                        setShowSugg(false);
                        fetchArtifacts();
                      }}
                    >
                      <img
                        src={item.picture_url}
                        alt={item.artifact_name}
                        className="w-12 h-12 object-cover rounded-md bg-stone-200"
                      />
                      <div>
                        <p className="font-bold text-stone-800 text-base leading-tight">
                          {item.artifact_name}
                        </p>
                        <p className="text-sm text-stone-500 mt-0.5">
                          {item.creator || "Unknown Creator"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="grow container mx-auto px-4 py-12 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* --- Filters Sidebar --- */}
            <div className="col-span-1">
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-sm border border-stone-200 sticky top-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-stone-800">Filters</h3>
                  <button
                    className="text-xs text-orange-700 hover:underline font-medium"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterMuseum("");
                      setFilterOrigin("");
                      setFilterCat("");
                      setYearRange([-2000, 1500]);
                    }}
                  >
                    Reset All
                  </button>
                </div>

                {/* BC/AD Timeline Slider */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
                    Time Period
                  </h4>

                  <div className="relative pt-6 pb-4">
                    <div className="absolute top-8 left-0 w-full h-1.5 bg-stone-200 rounded-full">
                      <div
                        className="absolute -top-6 w-0.5 bg-green-600 border-l-2 border-dashed border-green-600 z-0"
                        style={{ left: `${getPercent(0)}%`, height: "40px" }}
                      >
                        <div className="absolute -top-4 -left-12 w-24 text-center text-[9px] font-bold text-green-700">
                          Birth of Christ
                        </div>
                        <div className="absolute -bottom-2 -left-1.5 w-3 h-3 bg-green-600 rounded-full"></div>
                      </div>
                    </div>

                    <div
                      className="absolute top-8 h-1.5 bg-amber-400 rounded-full z-10"
                      style={{
                        left: `${getPercent(yearRange[0])}%`,
                        right: `${100 - getPercent(yearRange[1])}%`,
                      }}
                    ></div>

                    <input
                      type="range"
                      min={minYear}
                      max={maxYear}
                      value={yearRange[0]}
                      onChange={(e) =>
                        setYearRange([
                          Math.min(Number(e.target.value), yearRange[1] - 1),
                          yearRange[1],
                        ])
                      }
                      className="dual-range absolute top-7 w-full appearance-none bg-transparent pointer-events-none z-20"
                    />
                    <input
                      type="range"
                      min={minYear}
                      max={maxYear}
                      value={yearRange[1]}
                      onChange={(e) =>
                        setYearRange([
                          yearRange[0],
                          Math.max(Number(e.target.value), yearRange[0] + 1),
                        ])
                      }
                      className="dual-range absolute top-7 w-full appearance-none bg-transparent pointer-events-none z-30"
                    />
                  </div>

                  <div className="flex justify-between text-sm font-bold text-stone-700 mt-2 bg-stone-100 p-2 rounded-lg border border-stone-200">
                    <span>{formatYear(yearRange[0])}</span>
                    <span>-</span>
                    <span>{formatYear(yearRange[1])}</span>
                  </div>
                </div>

                <hr className="my-5 border-stone-200" />

                {/* Filter 2: Museums */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    Museum
                  </h4>
                  <select
                    value={filterMuseum}
                    onChange={(e) => setFilterMuseum(e.target.value)}
                    className="select select-bordered w-full bg-white border-stone-300 text-stone-700 focus:outline-amber-400"
                  >
                    <option value="">All Museums</option>
                    {(museums || []).map((m, i) => (
                      <option key={i} value={m.museum_name}>
                        {m.museum_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter 3: Origin */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    Origin
                  </h4>
                  <select
                    value={filterOrigin}
                    onChange={(e) => setFilterOrigin(e.target.value)}
                    className="select select-bordered w-full bg-white border-stone-300 text-stone-700 focus:outline-amber-400"
                  >
                    <option value="">All Origins</option>
                    {(origins || []).map((m, i) => (
                      <option key={i} value={m.origin}>
                        {m.origin}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="my-5 border-stone-200" />

                {/* Filter 4: Category */}
                {(categories || []).map((c, i) => (
                  <label
                    key={i}
                    className="label cursor-pointer justify-start gap-3 py-1.5 hover:bg-stone-50 rounded px-2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filterCat === c.category_name}
                      onChange={() =>
                        setFilterCat(
                          filterCat === c.category_name ? "" : c.category_name,
                        )
                      }
                      className="checkbox checkbox-sm border-stone-400 checked:bg-amber-400 checked:border-amber-400"
                    />
                    <span className="label-text text-stone-700 font-medium">
                      {c.category_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* --- Search Results --- */}
            <div className="col-span-1 md:col-span-3">
              <div className="flex justify-between items-center mb-6 bg-white/50 p-3 rounded-lg border border-stone-200 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-stone-800">
                  {totalItems} items found
                </h2>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="select select-sm select-bordered w-full max-w-xs bg-white border-stone-300 text-stone-700"
                >
                  <option value="" disabled>
                    Sort by
                  </option>
                  <option value="newest added">Newest Added</option>
                  <option value="oldest artefact">Oldest Artefact</option>
                  <option value="most popular">Most Popular</option>
                </select>
              </div>

              {/* Artefact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-4 w-72 h-112.5 rounded-xl bg-stone-100 p-4 shadow-sm"
                    >
                      <div className="skeleton h-full w-full bg-stone-300 rounded-lg"></div>
                      <div className="skeleton h-6 w-3/4 bg-stone-300 mx-auto mt-2"></div>
                    </div>
                  ))
                ) : artifacts.length > 0 ? (
                  artifacts.map((item, index) => {
                    // check in wishlist
                    const isInWishlist = wishlist.some(
                      (favItem) => favItem.artifact_id === item.artifact_id,
                    );

                    return (
                      <Card
                        key={item.artifact_id || index}
                        artifactId={item.artifact_id}
                        name={item.artifact_name}
                        image={item.picture_url}
                        description={item.description}
                        creator={item.creator}
                        time_period={item.time_period}
                        acquisition_date={new Date(
                          item.acquisition_date,
                        ).toLocaleDateString()}
                        museum_name={item.museum_name}
                        category={item.category_name}
                        origin={item.origin}
                        color={isInWishlist}
                        userRole={localStorage.getItem("role")}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                        setPopMsg={setPopMsg}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12 text-stone-500 text-lg font-medium">
                    No artifacts found matching your criteria. Try adjusting
                    your filters.
                  </div>
                )}
              </div>

              {/* Wishlist fab */}
              <div className="fab">
                <button
                  className="btn btn-lg btn-circle btn-primary bg-black/80"
                  onClick={toggleWishlist}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#f43f5e"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#f43f5e"
                    className="w-5 h-5 transition-transform active:scale-90"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
              </div>

              {isWishlistVisible && (
                <div className="fixed bottom-10 right-10 z-50 bg-white shadow-lg rounded-lg p-4">
                  <Wishlist items={wishlist} handleRemove={handleRemoveFav} />
                </div>
              )}

              {popMsg && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
                  {popMsg}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex justify-center mt-12">
                  <div className="join gap-2 shadow-sm">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="join-item btn btn-sm bg-white text-stone-700 border-stone-300 hover:bg-stone-100 disabled:opacity-50"
                    >
                      «
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`join-item btn btn-sm ${
                            page === p
                              ? "bg-amber-400 text-white border-amber-400 hover:bg-amber-500"
                              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="join-item btn btn-sm bg-white text-stone-700 border-stone-300 hover:bg-stone-100 disabled:opacity-50"
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
