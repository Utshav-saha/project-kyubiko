import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Trophy, ChevronDown } from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

const rankSuffix = (rank) => {
  if (rank % 100 >= 11 && rank % 100 <= 13) return `${rank}th`;
  if (rank % 10 === 1) return `${rank}st`;
  if (rank % 10 === 2) return `${rank}nd`;
  if (rank % 10 === 3) return `${rank}rd`;
  return `${rank}th`;
};

const avatarFallback = (username = "U") => username.charAt(0).toUpperCase();

const createDummyLeaderboard = () => {
  const names = [
    "Ava", "Liam", "Noah", "Emma", "Mason", "Olivia", "Ethan", "Mia", "Lucas", "Sophia",
    "Elijah", "Amelia", "James", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Benjamin", "Ella",
  ];

  return Array.from({ length: 100 }, (_, i) => {
    const points = i <= 1 ? 980 : Math.max(120, 970 - i * 7);
    return {
      user_id: i + 1,
      username: `${names[i % names.length]} ${i + 1}`,
      avatar_url: "",
      points,
    };
  });
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [museumName, setMuseumName] = useState("Museum");
  const [participants, setParticipants] = useState(0);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const username = localStorage.getItem("username") || "Curator";

        if (!token || role !== "curator") {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }
        
        setUser({ username });

        /*
         * Live leaderboard API is temporarily disabled until real quiz data is ready.
         * Keeping this code commented (not deleted) for easy re-enable later.
         *
         * const authRes = await fetch(`${API_URL}/museum/authorize`, {
         *   method: "GET",
         *   headers: { token },
         * });
         *
         * if (!authRes.ok) {
         *   localStorage.removeItem("token");
         *   localStorage.removeItem("role");
         *   navigate("/login");
         *   return;
         * }
         *
         * const authData = await authRes.json();
         * setUser(authData.user);
         *
         * const boardRes = await fetch(`${API_URL}/leaderboard/${id}`, {
         *   method: "GET",
         *   headers: { token },
         * });
         *
         * if (!boardRes.ok) throw new Error("Could not fetch leaderboard");
         *
         * const boardData = await boardRes.json();
         * setMuseumName(boardData.museum_name || "Museum");
         * setParticipants(boardData.total_eager_minds_participated || 0);
         * setEntries(boardData.leaderboard || []);
         */

        const dummyEntries = createDummyLeaderboard();
        setMuseumName(`Museum ${id}`);
        setParticipants(dummyEntries.length);
        setEntries(dummyEntries);
      } catch (error) {
        console.error(error.message);
        const dummyEntries = createDummyLeaderboard();
        setMuseumName(`Museum ${id}`);
        setParticipants(dummyEntries.length);
        setEntries(dummyEntries);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const rankedEntries = useMemo(() => {
    let currentRank = 1;

    return (entries || []).map((entry, index, arr) => {
      if (index > 0 && entry.points !== arr[index - 1].points) {
        currentRank = index + 1;
      }

      return {
        ...entry,
        rank: currentRank,
        rankLabel: rankSuffix(currentRank),
      };
    });
  }, [entries]);

  const first = rankedEntries[0] || null;
  const second = rankedEntries[1] || null;
  const third = rankedEntries[2] || null;

  const otherEntries = rankedEntries.slice(3, 100);
  const pageSize = 17;
  const totalPages = Math.max(1, Math.ceil(otherEntries.length / pageSize));

  const pagedEntries = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const chunk = otherEntries.slice(start, end);

    if (!showMore) {
      return chunk.filter((entry) => entry.rank <= 10);
    }

    return chunk;
  }, [page, otherEntries, showMore]);

  const topCard = (entry, size = "small") => {
    if (!entry) {
      return (
        <div className="bg-white border border-dark-chocolate/10 rounded-2xl p-5 text-center text-dark-chocolate/50">
          No Data
        </div>
      );
    }

    const big = size === "big";

    return (
      <div className={`bg-white border border-dark-chocolate/10 rounded-2xl shadow-md ${big ? "p-6" : "p-4"} text-center`}>
        <div className="mb-2">
          <span className="inline-flex px-3 py-1 rounded-full bg-accent-yellow/40 text-dark-chocolate font-bold text-xs tracking-wide">
            {entry.rankLabel}
          </span>
        </div>

        <div className={`mx-auto mb-3 rounded-full border-2 border-accent-orange/50 bg-old-paper flex items-center justify-center font-bold text-dark-chocolate ${big ? "w-20 h-20 text-2xl" : "w-16 h-16 text-xl"}`}>
          {entry.avatar_url ? (
            <img src={entry.avatar_url} alt={entry.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            avatarFallback(entry.username)
          )}
        </div>

        <p className={`font-playfair font-bold text-dark-chocolate ${big ? "text-2xl" : "text-xl"}`}>{entry.username}</p>
        <p className="text-sm text-dark-chocolate/70">{entry.points} pts</p>
      </div>
    );
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
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative">
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
            <li><Link to="/explore" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Explore</Link></li>
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/go-to-museum/${id}`}
            className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
          >
            Back to Museum
          </Link>
          <Link
            to={`/trivia/${id}`}
            className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
          >
            Take Trivia
          </Link>
        </div>

        <section className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-6 md:p-8 mb-7 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-accent-yellow/40 flex items-center justify-center text-dark-chocolate">
              <Trophy size={28} />
            </div>
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-dark-chocolate mb-2">
            Top Trivia Takers in {museumName}
          </h1>
          <p className="text-dark-chocolate/70">
            Total eager minds participated: <span className="font-bold text-dark-chocolate">{participants}</span>
          </p>
        </section>

        <section className="sticky top-3 z-10 bg-old-paper/95 backdrop-blur-sm border border-dark-chocolate/10 rounded-2xl p-4 md:p-6 mb-7 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:order-1">{topCard(second, "small")}</div>
            <div className="md:order-2">{topCard(first, "big")}</div>
            <div className="md:order-3">{topCard(third, "small")}</div>
          </div>
        </section>

        <section className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-4 md:p-6">
          <div className="mb-4">
            <h2 className="font-playfair text-2xl font-bold">Leaderboard Rankings</h2>
          </div>

          <div className="space-y-3">
            {pagedEntries.map((entry) => (
              <div
                key={`${entry.rank}-${entry.user_id}-${entry.username}`}
                className="w-full rounded-xl border border-dark-chocolate/10 bg-old-paper/60 px-3 md:px-4 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 text-sm font-bold text-dark-chocolate/70">{entry.rankLabel}</div>
                  <div className="w-9 h-9 rounded-full bg-white border border-dark-chocolate/10 overflow-hidden flex items-center justify-center text-sm font-bold text-dark-chocolate">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                    ) : (
                      avatarFallback(entry.username)
                    )}
                  </div>
                  <p className="font-medium truncate">{entry.username}</p>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-[#205b3e] text-white text-sm font-bold whitespace-nowrap">
                  {entry.points} pts
                </div>
              </div>
            ))}

            {pagedEntries.length === 0 && (
              <div className="text-center py-8 text-dark-chocolate/60">No ranking rows visible for this view.</div>
            )}
          </div>

          {!showMore && (
            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={() => {
                  setShowMore(true);
                  setPage(1);
                }}
                className="text-sm font-medium text-dark-chocolate/70 hover:text-dark-chocolate transition-colors inline-flex items-center gap-1"
              >
                <span>See more</span>
                <ChevronDown size={16} />
              </button>
            </div>
          )}

          {showMore && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="btn btn-sm bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
              >
                Left
              </button>
              <span className="text-sm font-bold text-dark-chocolate">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="btn btn-sm bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
              >
                Right
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
