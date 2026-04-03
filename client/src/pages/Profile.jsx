import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Layers3, Trophy, Vault } from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu";
import Card from "../components/common/Card";
import CategoryDistributionChart from "../components/common/CategoryDistribution";
import DailyEngagementChart from "../components/common/DailyEngagementChart";
import { API_URL, CLOUD_NAME, UPLOAD_PRESET } from "../config";

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    console.error("Image upload failed:", err);
    return null;
  }
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [suggestions, setSuggestions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [overview, setOverview] = useState({
    total_mini_museums: 0,
    total_artifacts: 0,
    total_likes: 0,
  });
  const [quizResults, setQuizResults] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tourTickets, setTourTickets] = useState([]);

  // Analytics State
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [userRole, setUserRole] = useState("curator");
  const [popMsg, setPopMsg] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toTwelve = (time24) => {
    const [hRaw, mRaw] = String(time24 || "00:00:00").split(":");
    let h = Number(hRaw || 0);
    const m = Number(mRaw || 0);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  useEffect(() => {
    if (!popMsg) return;
    const t = setTimeout(() => setPopMsg(null), 2500);
    return () => clearTimeout(t);
  }, [popMsg]);

  const openAvatarEditor = () => {
    setAvatarDraft(user?.avatar_url || "");
    setAvatarFile(null);
    setShowAvatarModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      setAvatarDraft(URL.createObjectURL(file));
    }
  };

  const saveAvatar = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      return;
    }

    try {
      setAvatarSaving(true);

      if (!avatarFile) {
        setPopMsg("Please choose an image file");
        return;
      }

      const uploadedUrl = await uploadImage(avatarFile);
      if (!uploadedUrl) {
        setPopMsg("Image upload failed");
        return;
      }

      const response = await fetch(`${API_URL}/profile/avatar`, {
        method: "POST",
        headers: {
          token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar_url: uploadedUrl }),
      });

      if (!response.ok) {
        setPopMsg("Could not update avatar");
        return;
      }

      setUser((prev) => ({
        ...(prev || {}),
        avatar_url: uploadedUrl,
      }));
      setShowAvatarModal(false);
      setAvatarFile(null);
      setPopMsg("Avatar updated");
    } catch {
      setPopMsg("Could not update avatar");
    } finally {
      setAvatarSaving(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setUserRole(role || "curator");

      if (!token || !["curator", "manager"].includes(role)) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      const authRes = await fetch(`${API_URL}/profile/authorize`, {
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

      // Fetch analytics for manager
      if (role === "manager") {
        try {
          const [pieRes, lineRes] = await Promise.all([
            fetch(`${API_URL}/analytics/museum/distribution`, {
              headers: { token },
            }),
            fetch(`${API_URL}/analytics/museum/engagement`, {
              headers: { token },
            }),
          ]);

          if (pieRes.ok) {
            setPieData(await pieRes.json());
          } else {
            const msg = await pieRes.text();
            console.error("Distribution analytics failed:", pieRes.status, msg);
          }

          if (lineRes.ok) {
            setLineData(await lineRes.json());
          } else {
            const msg = await lineRes.text();
            console.error("Engagement analytics failed:", lineRes.status, msg);
          }
        } catch (error) {
          console.error("Failed to fetch analytics", error);
        }

        // Manager profile currently focuses only on analytics.
        setSuggestions([]);
        setAchievements([]);
        setOverview({
          total_mini_museums: 0,
          total_artifacts: 0,
          total_likes: 0,
        });
        setQuizResults([]);
        setBookings([]);
        setWishlist([]);
        setTourTickets([]);
        return;
      }

      const [
        suggestionsRes,
        achievementsRes,
        overviewRes,
        quizRes,
        bookingsRes,
        wishlistRes,
      ] = await Promise.all([
        fetch(`${API_URL}/profile/suggestions`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/profile/achievements`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/profile/overview`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/profile/quiz-results`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/tour/my-bookings`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/view/wishlist`, {
          method: "GET",
          headers: { token },
        }),
      ]);

      const suggestionsData = suggestionsRes.ok
        ? await suggestionsRes.json()
        : { suggestions: [] };
      const achievementsData = achievementsRes.ok
        ? await achievementsRes.json()
        : { achievements: [] };
      const overviewData = overviewRes.ok
        ? await overviewRes.json()
        : {
            overview: {
              total_mini_museums: 0,
              total_artifacts: 0,
              total_likes: 0,
            },
          };
      const quizData = quizRes.ok ? await quizRes.json() : { results: [] };
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
      const wishlistData = wishlistRes.ok ? await wishlistRes.json() : [];

      setSuggestions(suggestionsData?.suggestions || []);
      setAchievements(achievementsData?.achievements || []);
      setOverview(
        overviewData?.overview || {
          total_mini_museums: 0,
          total_artifacts: 0,
          total_likes: 0,
        },
      );
      setQuizResults(quizData?.results || []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
      setTourTickets(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const favoriteIds = useMemo(
    () => new Set(wishlist.map((item) => item.artifact_id)),
    [wishlist],
  );

  const maxScore = useMemo(() => {
    const scores = quizResults.map((q) => Number(q.score) || 0);
    return Math.max(1, ...scores);
  }, [quizResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        .hover-3d {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          grid-template-rows: repeat(3, minmax(0, 1fr));
          width: 24rem;
          max-width: 100%;
          aspect-ratio: 1.6 / 1;
        }

        .hover-3d > .card {
          grid-column: 1 / 4;
          grid-row: 1 / 4;
          transition: transform 220ms ease, box-shadow 220ms ease;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .hover-3d > div:not(.card) {
          z-index: 2;
        }

        .hover-3d > div:nth-child(2) { grid-column: 1; grid-row: 1; }
        .hover-3d > div:nth-child(3) { grid-column: 2; grid-row: 1; }
        .hover-3d > div:nth-child(4) { grid-column: 3; grid-row: 1; }
        .hover-3d > div:nth-child(5) { grid-column: 1; grid-row: 2; }
        .hover-3d > div:nth-child(6) { grid-column: 3; grid-row: 2; }
        .hover-3d > div:nth-child(7) { grid-column: 1; grid-row: 3; }
        .hover-3d > div:nth-child(8) { grid-column: 2; grid-row: 3; }
        .hover-3d > div:nth-child(9) { grid-column: 3; grid-row: 3; }

        .hover-3d:has(> div:nth-child(2):hover) > .card { transform: perspective(850px) rotateX(8deg) rotateY(-10deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(3):hover) > .card { transform: perspective(850px) rotateX(8deg) rotateY(0deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(4):hover) > .card { transform: perspective(850px) rotateX(8deg) rotateY(10deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(5):hover) > .card { transform: perspective(850px) rotateX(0deg) rotateY(-10deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(6):hover) > .card { transform: perspective(850px) rotateX(0deg) rotateY(10deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(7):hover) > .card { transform: perspective(850px) rotateX(-8deg) rotateY(-10deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(8):hover) > .card { transform: perspective(850px) rotateX(-8deg) rotateY(0deg) translateY(-4px); }
        .hover-3d:has(> div:nth-child(9):hover) > .card { transform: perspective(850px) rotateX(-8deg) rotateY(10deg) translateY(-4px); }
      `}</style>

      <div className="min-h-screen bg-old-paper font-dmsans selection:bg-accent-orange/30 selection:text-dark-chocolate relative">
        <div className="fixed inset-0 bg-noise opacity-40 pointer-events-none mix-blend-multiply z-0"></div>

        <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
          <div className="navbar-start">
            <Link
              to="/"
              className="btn btn-ghost text-xl text-white ml-2 font-playfair"
            >
              Kyubiko
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
              <li>
                <Link
                  to="/my-museums"
                  className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"                >
                  My Museums
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>
          <div className="navbar-end gap-3 pr-5">
            {["curator", "manager"].includes(userRole) && (
              <button
                type="button"
                onClick={openAvatarEditor}
                className="btn btn-sm bg-white text-dark-chocolate border border-dark-chocolate/10 hover:bg-old-paper"
              >
                Edit Avatar
              </button>
            )}
            <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-white">
                {user.username}
              </span>
            </div>
            <UserAvatarMenu user={user} />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-14">
          {/* ----- MANAGER ANALYTICS SECTION ----- */}
          {userRole === "manager" && (
            <section>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                  Analytics
                </p>
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">
                  Museum Performance
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-dark-chocolate/10 p-6 shadow-md flex flex-col">
                  <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-6">
                    Category Distribution
                  </h3>
                  <div className="h-72 w-full">
                    <CategoryDistributionChart data={pieData} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-dark-chocolate/10 p-6 shadow-md flex flex-col">
                  <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-6">
                    Daily Engagement
                  </h3>
                  <div className="h-72 w-full">
                    <DailyEngagementChart data={lineData} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {userRole !== "manager" && (
            <>
              <section>
                <div className="mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                      Recommended
                    </p>
                    <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">
                      You May Like
                    </h2>
                  </div>
                </div>

                {suggestions.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dark-chocolate/10 p-10 text-center text-dark-chocolate/60">
                    No recommendations yet. Explore more artifacts to improve
                    suggestions.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                    {suggestions.slice(0, 5).map((artifact) => (
                      <Card
                        key={artifact.artifact_id}
                        size="sm"
                        artifactId={artifact.artifact_id}
                        name={artifact.artifact_name}
                        image={artifact.picture_url}
                        description={artifact.description}
                        creator={artifact.creator}
                        time_period={
                          artifact.time_period ||
                          `${artifact.start_year ?? ""} - ${artifact.end_year ?? ""}`.trim()
                        }
                        acquisition_date={artifact.acquisition_date}
                        museum_name={artifact.museum_name}
                        category={artifact.category_name}
                        origin={artifact.origin}
                        color={favoriteIds.has(artifact.artifact_id)}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                        setPopMsg={setPopMsg}
                        userRole={userRole}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                    Experiences
                  </p>
                  <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">
                    Tour Tickets
                  </h2>
                </div>

                {tourTickets.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dark-chocolate/10 p-10 text-center text-dark-chocolate/60">
                    No tour tickets yet. Book a tour to see your tickets here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {tourTickets.map((ticket) => {
                      const museumId = ticket?.museum?.id;
                      const ticketUrl = museumId
                        ? `/tour/${museumId}/payment-success/${ticket.booking_id}`
                        : "/profile";
                      const parsedTourDate = new Date(ticket.tour_date);
                      const formattedTourDate = Number.isNaN(parsedTourDate.getTime())
                        ? String(ticket.tour_date || "-")
                        : parsedTourDate.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          });

                      return (
                      <Link
                        key={ticket.booking_id}
                        to={ticketUrl}
                        className="hover-3d mx-2 cursor-pointer"
                        aria-label={`Open ticket ${ticket.ticket_code}`}
                      >
                        <div className="card w-full bg-dark-chocolate text-white border border-white/10 rounded-2xl shadow-xl bg-[radial-gradient(circle_at_bottom_left,#ffffff04_35%,transparent_36%),radial-gradient(circle_at_top_right,#ffffff04_35%,transparent_36%)] bg-size-[4.95em_4.95em]">
                          <div className="card-body">
                            <div className="flex justify-between mb-10">
                              <div className="text-md font-bold uppercase truncate max-w-[85%] text-white/75" title={ticket?.museum?.name || "Museum"}>
                                {ticket?.museum?.name || "Museum"}
                              </div>
                              <div className="text-5xl opacity-10">❁</div>
                            </div>

                            <div className="text-xs opacity-20 uppercase">Card Number</div>
                            <div className="text-base mb-4 opacity-40 uppercase tracking-wide">
                              {ticket.ticket_code}
                            </div>

                            <div className="flex justify-between pb-8">
                              <div>
                                <div className="text-xs opacity-20 uppercase">Owner</div>
                                <div className="text-white/85">{user.username}</div>
                              </div>
                              <div>
                                <div className="text-xs opacity-20 uppercase">Tour Date</div>
                                <div className="text-white/85">{formattedTourDate}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                    Snapshot
                  </p>
                  <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">
                    Profile Overview
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="relative overflow-hidden rounded-2xl p-6 border border-dark-chocolate/10 bg-[radial-gradient(circle_at_top_right,rgba(253,186,116,0.35),rgba(255,255,255,0.98)_52%)] shadow-md">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-accent-orange/20"></div>
                    <div className="relative flex items-center justify-between mb-6">
                      <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">
                        Mini Museums
                      </p>
                      <Vault className="text-dark-chocolate/70" size={20} />
                    </div>
                    <p className="relative font-playfair text-5xl leading-none text-dark-chocolate">
                      {overview.total_mini_museums}
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl p-6 border border-dark-chocolate/10 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.28),rgba(255,255,255,0.98)_52%)] shadow-md">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-accent-yellow/25"></div>
                    <div className="relative flex items-center justify-between mb-6">
                      <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">
                        Total Artifacts
                      </p>
                      <Layers3 className="text-dark-chocolate/70" size={20} />
                    </div>
                    <p className="relative font-playfair text-5xl leading-none text-dark-chocolate">
                      {overview.total_artifacts}
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl p-6 border border-dark-chocolate/10 bg-[radial-gradient(circle_at_top_right,rgba(248,113,113,0.28),rgba(255,255,255,0.98)_52%)] shadow-md">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-red-400/20"></div>
                    <div className="relative flex items-center justify-between mb-6">
                      <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">
                        Total Likes
                      </p>
                      <Heart className="text-red-500" size={20} />
                    </div>
                    <p className="relative font-playfair text-5xl leading-none text-dark-chocolate">
                      {overview.total_likes}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                    Performance
                  </p>
                  <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">
                    Last 5 Quiz Scores
                  </h2>
                </div>

                {quizResults.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dark-chocolate/10 p-10 text-center text-dark-chocolate/60">
                    No quiz attempts yet.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-dark-chocolate/10 p-6 md:p-8 shadow-md">
                    <div className="flex items-end justify-between gap-3 md:gap-6 h-72">
                      {quizResults.map((result, idx) => {
                        const score = Number(result.score) || 0;
                        const barHeight = `${Math.max(10, (score / maxScore) * 100)}%`;

                        return (
                          <div
                            key={`${result.quiz_title}-${idx}`}
                            className="flex-1 min-w-0 h-full flex flex-col justify-end"
                          >
                            <p className="text-center text-xs md:text-sm font-bold text-dark-chocolate mb-2">
                              {score}
                            </p>
                            <div
                              className="w-full rounded-t-lg bg-linear-to-t from-accent-orange to-accent-yellow transition-all duration-500"
                              style={{ height: barHeight }}
                            ></div>
                            <p className="text-center text-[11px] md:text-xs text-dark-chocolate/80 mt-2 line-clamp-2 min-h-8">
                              {result.quiz_title}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              <section>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                    Just for Fun
                  </p>
                  <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">
                    Achievements
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {achievements.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dark-chocolate/10 p-6 shadow-md md:col-span-3 text-dark-chocolate/60">
                      No achievements yet.
                    </div>
                  ) : (
                    achievements.map((item, idx) => (
                      <div
                        key={`${item.achievement_title}-${idx}`}
                        className="bg-white rounded-xl border border-dark-chocolate/10 p-6 shadow-md"
                      >
                        <div className="w-12 h-12 rounded-full bg-accent-yellow/40 flex items-center justify-center mb-4">
                          <Trophy size={22} className="text-dark-chocolate" />
                        </div>
                        <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2">
                          {item.achievement_title}
                        </h3>
                        <p className="text-dark-chocolate/70 text-sm">
                          {item.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {popMsg && (
          <div className="fixed top-4 right-4 z-60 bg-dark-chocolate text-white px-4 py-2 rounded-lg shadow-lg">
            {popMsg}
          </div>
        )}

        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAvatarModal(false)}
            ></button>

            <div className="relative w-full max-w-md rounded-2xl bg-white border border-dark-chocolate/15 shadow-2xl p-5">
              <h3 className="font-playfair text-2xl text-dark-chocolate font-bold">
                Edit Avatar
              </h3>
              <p className="text-sm text-dark-chocolate/70 mt-1">
                Upload an image and save.
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 rounded-full border border-dark-chocolate/15">
                    <img
                      src={avatarDraft || "https://placehold.co/150"}
                      alt="Avatar preview"
                    />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
                  onClick={() => setShowAvatarModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAvatar}
                  disabled={avatarSaving}
                  className="btn bg-dark-chocolate text-white border-none hover:bg-accent-orange"
                >
                  {avatarSaving ? "Saving..." : "Save Avatar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
