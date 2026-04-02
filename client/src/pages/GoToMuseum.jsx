import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { Search, ChevronLeft, ChevronRight, Heart, User, MapPin } from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

export default function GoToMuseum() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [museum, setMuseum] = useState(null);
  const [allArtifacts, setAllArtifacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1200);
    return () => clearTimeout(t);
  }, [toast]);

  const fallbackArtifacts = [
    {
      artifact_id: 1,
      artifact_name: "Museum Artifact I",
      description: "A featured artifact from this museum.",
      creator: "Unknown",
      time_period: "Unknown",
      picture_url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80",
      category_name: "Art",
      origin: "Unknown",
    },
    {
      artifact_id: 2,
      artifact_name: "Museum Artifact II",
      description: "Historic artifact with cultural relevance.",
      creator: "Unknown",
      time_period: "Unknown",
      picture_url: "https://images.unsplash.com/photo-1596726224151-50802c659e51?w=800&q=80",
      category_name: "History",
      origin: "Unknown",
    },
    {
      artifact_id: 3,
      artifact_name: "Museum Artifact III",
      description: "Another highlighted piece from the museum.",
      creator: "Unknown",
      time_period: "Unknown",
      picture_url: "https://images.unsplash.com/photo-1555009312-3df64fb56cb2?w=800&q=80",
      category_name: "Science",
      origin: "Unknown",
    },
  ];

  const fetchArtifacts = async (museumId, term = "") => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "50");
      if (term.trim()) params.append("letters", term.trim());

      const response = await fetch(`${API_URL}/museum/${museumId}/artifacts?${params.toString()}`, {
        method: "GET",
        headers: { token },
      });

      if (!response.ok) throw new Error("Could not fetch museum artifacts");

      const data = await response.json();
      const rows = data.artifacts || [];
      setAllArtifacts(rows.length > 0 ? rows : fallbackArtifacts);
      setActiveIndex(0);
    } catch (error) {
      console.error(error.message);
      setAllArtifacts(fallbackArtifacts);
      setActiveIndex(0);
    }
  };

  const fetchSuggestions = async (museumId, term) => {
    if (!term.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/museum/${museumId}/suggest?letters=${encodeURIComponent(term)}`, {
        method: "GET",
        headers: { token },
      });

      if (!response.ok) throw new Error("Could not fetch suggestions");

      const data = await response.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error(error.message);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchFavoritesState = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/museum/favorites`, {
        method: "GET",
        headers: { token },
      });

      if (!response.ok) return;

      const data = await response.json();
      const mapped = {};
      (data || []).forEach((row) => {
        mapped[row.artifact_id] = true;
      });
      setLikedMap(mapped);
    } catch (error) {
      console.error(error.message);
    }
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

        const authRes = await fetch(`${API_URL}/museum/authorize`, {
          method: "GET",
          headers: { token },
        });

        if (!authRes.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        const authData = await authRes.json();
        setUser(authData.user);

        const museumRes = await fetch(`${API_URL}/museum/info/${id}`, {
          method: "GET",
          headers: { token },
        });

        if (!museumRes.ok) throw new Error("Could not load museum details");

        const museumData = await museumRes.json();

        const selectedMuseum =
          museumData ||
          {
            id,
            name: "Museum",
            description: "Museum details will be available shortly.",
            image: "",
            country: "Unknown",
            category: "Unknown",
            creator: "Unknown",
          };

        setMuseum(selectedMuseum);
        await fetchArtifacts(selectedMuseum.id, "");
        await fetchFavoritesState();
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const next = () => {
    if (filteredArtifacts.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % filteredArtifacts.length);
  };

  const prev = () => {
    if (filteredArtifacts.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + filteredArtifacts.length) % filteredArtifacts.length);
  };

  const categories = useMemo(() => {
    const set = new Set();
    allArtifacts.forEach((item) => {
      if (item.category_name) set.add(item.category_name);
    });
    return ["All", ...Array.from(set)];
  }, [allArtifacts]);

  const filteredArtifacts = useMemo(() => {
    if (selectedCategory === "All") return allArtifacts;
    return allArtifacts.filter((item) => item.category_name === selectedCategory);
  }, [allArtifacts, selectedCategory]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  const activeArtifact = filteredArtifacts[activeIndex] || null;

  const leftArtifact = useMemo(() => {
    if (filteredArtifacts.length === 0) return null;
    return filteredArtifacts[(activeIndex - 1 + filteredArtifacts.length) % filteredArtifacts.length];
  }, [filteredArtifacts, activeIndex]);

  const rightArtifact = useMemo(() => {
    if (filteredArtifacts.length === 0) return null;
    return filteredArtifacts[(activeIndex + 1) % filteredArtifacts.length];
  }, [filteredArtifacts, activeIndex]);

  const handleSearch = () => {
    if (!searchTerm.trim() || filteredArtifacts.length === 0) return;

    const idx = filteredArtifacts.findIndex(
      (item) =>
        item.artifact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.creator?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (idx !== -1) {
      setActiveIndex(idx);
    }

    setShowSuggestions(false);
  };

  const toggleHeart = async (artifactId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/museum/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ artifact_id: artifactId }),
      });

      if (!response.ok) throw new Error("Could not update favorites");

      const data = await response.json();
      setLikedMap((prev) => ({ ...prev, [artifactId]: data.added }));
      setToast(data.msg || "Updated");
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate selection:bg-accent-orange/30 selection:text-dark-chocolate relative">
      <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>

      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            <li><Link to="/my-museums" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">My Museums</Link></li>
            <li><Link to="/explore" className="text-accent-yellow bg-white/10 rounded-lg">Explore</Link></li>
            <li><Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Search</Link></li>
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">{user.username}</span>
          </div>
          <UserAvatarMenu user={user} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="join w-full mb-8 shadow-xl rounded-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-chocolate/40" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                if (museum?.id) fetchSuggestions(museum.id, value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Search artifacts from this museum..."
              className="input join-item w-full bg-white h-14 focus:outline-none border-none pl-12 text-dark-chocolate"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-dark-chocolate/10 shadow-xl z-30 overflow-hidden">
                {suggestions.map((item) => (
                  <button
                    key={item.artifact_id}
                    onMouseDown={() => {
                      setSearchTerm(item.artifact_name);
                      setShowSuggestions(false);

                      const idx = filteredArtifacts.findIndex(
                        (artifact) => artifact.artifact_id === item.artifact_id
                      );

                      if (idx !== -1) {
                        setActiveIndex(idx);
                        return;
                      }

                      const idxAll = allArtifacts.findIndex(
                        (artifact) => artifact.artifact_id === item.artifact_id
                      );

                      if (idxAll !== -1) {
                        setSelectedCategory("All");
                        setActiveIndex(idxAll);
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-old-paper text-dark-chocolate text-sm"
                  >
                    {item.artifact_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSearch} className="btn join-item h-14 px-6 bg-accent-yellow hover:bg-accent-orange text-dark-chocolate border-none font-bold">
            Search
          </button>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-7 flex flex-col">
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Museum Details</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate mb-3">{museum?.name}</h1>
            <p className="text-dark-chocolate/70 leading-relaxed mb-5">{museum?.description || "No description available yet."}</p>

            <div className="space-y-2 text-sm text-dark-chocolate/80 mb-7">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-accent-orange" /> {museum?.country || "Unknown"}</p>
              <p className="flex items-center gap-2"><User size={14} className="text-accent-orange" /> {museum?.creator || "Unknown"}</p>
              <p><span className="font-bold">Category:</span> {museum?.category || "Unknown"}</p>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <Link
                to={`/trivia/${id}`}
                className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
              >
                Take Trivia
              </Link>
              <Link
                to={`/leaderboard/${id}`}
                className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
              >
                Go To Leaderboard
              </Link>
            </div>
          </div>

          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md overflow-hidden min-h-80">
            <img
              src={museum?.image || "https://placehold.co/900x600?text=Museum+Image"}
              alt={museum?.name || "Museum"}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <section className="relative bg-dark-chocolate rounded-2xl overflow-hidden border border-white/10 py-12 px-4 md:px-8">
          <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,210,90,0.25), rgba(0,0,0,0) 45%)" }}></div>

          <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-widest text-accent-yellow font-bold mb-2">Museum Artifacts</p>
              <h2 className="font-playfair text-4xl text-white font-bold">Curious Carousel</h2>
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs uppercase tracking-widest text-white/70 font-bold mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select select-sm w-full bg-white text-dark-chocolate border-none focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredArtifacts.length === 0 ? (
            <div className="text-center text-white/70 py-10">No artifacts found in this category.</div>
          ) : (
            <div className="relative h-[520px] flex items-center justify-center">
              <button
                onClick={prev}
                className="absolute left-2 md:left-8 z-20 w-11 h-11 rounded-full bg-white/15 text-white border border-white/20 hover:bg-white/25 flex items-center justify-center"
              >
                <ChevronLeft size={22} />
              </button>

              {leftArtifact && (
                <div className="hidden md:block absolute left-[7%] w-64 h-[390px] opacity-35 scale-90 pointer-events-none transition-all">
                  <img src={leftArtifact.picture_url || "https://placehold.co/600x800"} alt={leftArtifact.artifact_name} className="w-full h-56 object-cover rounded-t-xl" />
                  <div className="bg-white/10 text-white p-4 rounded-b-xl backdrop-blur-sm">
                    <p className="font-playfair text-lg font-bold line-clamp-1">{leftArtifact.artifact_name}</p>
                  </div>
                </div>
              )}

              {activeArtifact && (
                <div
                  className="relative w-full max-w-sm h-[460px] bg-white rounded-xl overflow-hidden shadow-2xl border border-white/20 transition-transform"
                  onMouseDown={(e) => setDragStartX(e.clientX)}
                  onMouseUp={(e) => {
                    if (dragStartX === null) return;
                    const delta = e.clientX - dragStartX;
                    if (delta > 50) prev();
                    if (delta < -50) next();
                    setDragStartX(null);
                  }}
                  onMouseLeave={() => setDragStartX(null)}
                  onTouchStart={(e) => setDragStartX(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    if (dragStartX === null) return;
                    const endX = e.changedTouches[0].clientX;
                    const delta = endX - dragStartX;
                    if (delta > 45) prev();
                    if (delta < -45) next();
                    setDragStartX(null);
                  }}
                >
                  <div className="relative h-58 overflow-hidden">
                    <img
                      src={activeArtifact.picture_url || "https://placehold.co/600x800"}
                      alt={activeArtifact.artifact_name}
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() => toggleHeart(activeArtifact.artifact_id)}
                      className="absolute top-3 right-3 bg-black/45 rounded-full p-2 border border-white/20"
                    >
                      <Heart
                        size={18}
                        className={likedMap[activeArtifact.artifact_id] ? "text-red-500 fill-red-500" : "text-white"}
                      />
                    </button>
                  </div>

                  <div className="p-5 text-dark-chocolate">
                    <h3 className="font-playfair text-2xl font-bold mb-2 line-clamp-1">{activeArtifact.artifact_name}</h3>
                    <p className="text-sm text-dark-chocolate/70 line-clamp-2 mb-3">{activeArtifact.description || "No description available."}</p>
                    <div className="text-xs space-y-1 text-dark-chocolate/80">
                      <p><span className="font-bold">Creator:</span> {activeArtifact.creator || "Unknown"}</p>
                      <p><span className="font-bold">Period:</span> {activeArtifact.time_period || "Unknown"}</p>
                      <p><span className="font-bold">Category:</span> {activeArtifact.category_name || "Unknown"}</p>
                      <p><span className="font-bold">Origin:</span> {activeArtifact.origin || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              )}

              {rightArtifact && (
                <div className="hidden md:block absolute right-[7%] w-64 h-[390px] opacity-35 scale-90 pointer-events-none transition-all">
                  <img src={rightArtifact.picture_url || "https://placehold.co/600x800"} alt={rightArtifact.artifact_name} className="w-full h-56 object-cover rounded-t-xl" />
                  <div className="bg-white/10 text-white p-4 rounded-b-xl backdrop-blur-sm">
                    <p className="font-playfair text-lg font-bold line-clamp-1">{rightArtifact.artifact_name}</p>
                  </div>
                </div>
              )}

              <button
                onClick={next}
                className="absolute right-2 md:right-8 z-20 w-11 h-11 rounded-full bg-white/15 text-white border border-white/20 hover:bg-white/25 flex items-center justify-center"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div className="fixed top-24 right-4 z-50 bg-white text-dark-chocolate border border-dark-chocolate/20 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold">
          {toast}
        </div>
      )}

    </div>
  );
}
