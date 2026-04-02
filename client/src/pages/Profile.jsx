import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GripVertical,
  Plus,
  X,
  Trash2,
  Trophy,
  Medal,
  Star,
  Heart,
  Folder,
  User,
  MapPin,
} from "lucide-react";
import { API_URL } from "../config";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

const toTwelve = (time24) => {
  const [hRaw, mRaw] = String(time24 || "00:00:00").split(":");
  let h = Number(hRaw || 0);
  const m = Number(mRaw || 0);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatDate = (isoDate) => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dummyAchievements = [
  {
    id: 1,
    icon: Trophy,
    title: "Crowd Favorite",
    description: "Got 100 total likes across mini museums.",
  },
  {
    id: 2,
    icon: Medal,
    title: "Explorer",
    description: "Searched 50 artifacts in the archive.",
  },
  {
    id: 3,
    icon: Star,
    title: "Curator in Motion",
    description: "Created 5 mini museums.",
  },
];

const parseSectionItems = (sections = []) => {
  return sections.map((sec) => ({
    ...sec,
    items: typeof sec.items === "string" ? JSON.parse(sec.items) : sec.items || [],
  }));
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [tourTickets, setTourTickets] = useState([]);
  const [sectionsByMuseum, setSectionsByMuseum] = useState({});

  const [draggingId, setDraggingId] = useState(null);
  const [manageArtifact, setManageArtifact] = useState(null);
  const [popMsg, setPopMsg] = useState(null);

  useEffect(() => {
    if (!popMsg) return;
    const t = setTimeout(() => setPopMsg(null), 2500);
    return () => clearTimeout(t);
  }, [popMsg]);

  const fetchMuseumSections = async (museumId, token) => {
    const response = await fetch(`${API_URL}/view/sections?mini_museum_id=${museumId}`, {
      method: "GET",
      headers: { token },
    });
    const data = await response.json();
    return parseSectionItems(data || []);
  };

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

      const authRes = await fetch(`${API_URL}/search/authorize`, {
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

      const [wishlistRes, museumsRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/view/wishlist`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/my-museums`, {
          method: "GET",
          headers: { token },
        }),
        fetch(`${API_URL}/tour/my-bookings`, {
          method: "GET",
          headers: { token },
        }),
      ]);

      const wishlistData = await wishlistRes.json();
      const museumsData = await museumsRes.json();
      const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];

      if (Array.isArray(ticketsData)) {
        setTourTickets(ticketsData);
      } else {
        setTourTickets([]);
      }

      const favRows = Array.isArray(wishlistData) ? wishlistData : [];
      setFavorites(
        favRows.map((item) => ({
          ...item,
          museum_name: item.museum_name || "Museum details coming soon",
          location: item.origin || "Unknown",
        }))
      );

      const myMuseums = museumsData?.museums || [];
      setMuseums(myMuseums);

      const sectionPairs = await Promise.all(
        myMuseums.map(async (museum) => {
          const sections = await fetchMuseumSections(museum.mini_museum_id, token);
          return [museum.mini_museum_id, sections];
        })
      );

      setSectionsByMuseum(Object.fromEntries(sectionPairs));
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

  const museumStats = useMemo(() => {
    const detailRows = museums.map((museum) => {
      const sections = sectionsByMuseum[museum.mini_museum_id] || [];
      const artifactCount = sections.reduce((sum, sec) => sum + (sec.items?.length || 0), 0);

      return {
        ...museum,
        artifactCount,
      };
    });

    const totalLikes = detailRows.reduce((sum, row) => sum + (row.likes_count || 0), 0);
    const totalArtifacts = detailRows.reduce((sum, row) => sum + row.artifactCount, 0);

    return {
      detailRows,
      totalLikes,
      totalArtifacts,
    };
  }, [museums, sectionsByMuseum]);

  const reorderFavorites = (startId, dropId) => {
    if (!startId || !dropId || startId === dropId) return;

    const startIndex = favorites.findIndex((item) => item.artifact_id === startId);
    const endIndex = favorites.findIndex((item) => item.artifact_id === dropId);

    if (startIndex === -1 || endIndex === -1) return;

    const cloned = [...favorites];
    const [moved] = cloned.splice(startIndex, 1);
    cloned.splice(endIndex, 0, moved);
    setFavorites(cloned);
  };

  const handleRemoveFavorite = async (artifactId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/search/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ artifact_id: artifactId }),
      });

      if (!response.ok) throw new Error("Failed to remove favorite");

      setFavorites((prev) => prev.filter((item) => item.artifact_id !== artifactId));
      setPopMsg("Removed from favorites");
    } catch (error) {
      console.error(error.message);
      setPopMsg("Could not remove favorite");
    }
  };

  const isArtifactInMuseum = (artifactId, museumId) => {
    const sections = sectionsByMuseum[museumId] || [];
    return sections.some((sec) => (sec.items || []).some((item) => item.artifact_id === artifactId));
  };

  const getSectionContainingArtifact = (artifactId, museumId) => {
    const sections = sectionsByMuseum[museumId] || [];
    return sections.find((sec) => (sec.items || []).some((item) => item.artifact_id === artifactId));
  };

  const ensureSectionForMuseum = async (museumId, token) => {
    let sections = sectionsByMuseum[museumId] || [];

    if (sections.length === 0) {
      const createRes = await fetch(`${API_URL}/view/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({
          mini_museum_id: museumId,
          section_name: "Favorites",
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create section");
      sections = await fetchMuseumSections(museumId, token);
      setSectionsByMuseum((prev) => ({ ...prev, [museumId]: sections }));
    }

    return sections[0];
  };

  const refreshMuseumSections = async (museumId, token) => {
    const sections = await fetchMuseumSections(museumId, token);
    setSectionsByMuseum((prev) => ({ ...prev, [museumId]: sections }));
  };

  const toggleArtifactInMuseum = async (artifact, museum) => {
    try {
      const token = localStorage.getItem("token");
      const museumId = museum.mini_museum_id;
      const artifactId = artifact.artifact_id;

      const existingSection = getSectionContainingArtifact(artifactId, museumId);

      if (existingSection) {
        const position = existingSection.id.split("-")[1];

        const removeRes = await fetch(
          `${API_URL}/view/artifact?mini_museum_id=${museumId}&position=${position}&artifact_id=${artifactId}`,
          {
            method: "DELETE",
            headers: { token },
          }
        );

        if (!removeRes.ok) throw new Error("Failed to remove artifact from mini museum");
        await refreshMuseumSections(museumId, token);
        setPopMsg("Removed from mini museum");
        return;
      }

      const targetSection = await ensureSectionForMuseum(museumId, token);
      const sectionPosition = targetSection.id.split("-")[1];

      const addRes = await fetch(`${API_URL}/view/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({
          artifact_id: artifactId,
          mini_museum_id: museumId,
          section_position: sectionPosition,
          section_name: targetSection.name,
        }),
      });

      if (!addRes.ok) throw new Error("Failed to add artifact to mini museum");

      await refreshMuseumSections(museumId, token);
      setPopMsg("Added to mini museum");
    } catch (error) {
      console.error(error.message);
      setPopMsg("Could not update mini museum");
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

        .hover-3d > div:nth-child(2):hover ~ .card { transform: perspective(850px) rotateX(8deg) rotateY(-10deg) translateY(-4px); }
        .hover-3d > div:nth-child(3):hover ~ .card { transform: perspective(850px) rotateX(8deg) rotateY(0deg) translateY(-4px); }
        .hover-3d > div:nth-child(4):hover ~ .card { transform: perspective(850px) rotateX(8deg) rotateY(10deg) translateY(-4px); }
        .hover-3d > div:nth-child(5):hover ~ .card { transform: perspective(850px) rotateX(0deg) rotateY(-10deg) translateY(-4px); }
        .hover-3d > div:nth-child(6):hover ~ .card { transform: perspective(850px) rotateX(0deg) rotateY(10deg) translateY(-4px); }
        .hover-3d > div:nth-child(7):hover ~ .card { transform: perspective(850px) rotateX(-8deg) rotateY(-10deg) translateY(-4px); }
        .hover-3d > div:nth-child(8):hover ~ .card { transform: perspective(850px) rotateX(-8deg) rotateY(0deg) translateY(-4px); }
        .hover-3d > div:nth-child(9):hover ~ .card { transform: perspective(850px) rotateX(-8deg) rotateY(10deg) translateY(-4px); }
      `}</style>

      <div className="min-h-screen bg-old-paper font-dmsans selection:bg-accent-orange/30 selection:text-dark-chocolate relative">
      <div className="fixed inset-0 bg-noise opacity-40 pointer-events-none mix-blend-multiply z-0"></div>

      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            <li>
              <Link to="/my-museums" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                My Museums
              </Link>
            </li>
            <li>
              <Link to="/explore" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Explore
              </Link>
            </li>
            <li>
              <Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Search
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-accent-yellow bg-white/10 rounded-lg">
                Profile
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">{user.username}</span>
          </div>
          <UserAvatarMenu user={user} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-14">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Your Collection</p>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">Favorites</h2>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white rounded-xl border border-dark-chocolate/10 p-10 text-center text-dark-chocolate/60">
              No favorites yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((artifact) => (
                <div
                  key={artifact.artifact_id}
                  draggable
                  onDragStart={() => setDraggingId(artifact.artifact_id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    reorderFavorites(draggingId, artifact.artifact_id);
                    setDraggingId(null);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={`bg-white rounded-xl overflow-hidden border border-dark-chocolate/10 shadow-md transition-all ${draggingId === artifact.artifact_id ? "opacity-60 scale-[0.98]" : ""}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={artifact.picture_url || "https://placehold.co/600x400"}
                      alt={artifact.artifact_name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3 left-3 bg-white/95 rounded-full p-1.5 border border-dark-chocolate/10 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} className="text-dark-chocolate/70" />
                    </div>

                    <button
                      onClick={() => setManageArtifact(artifact)}
                      className="absolute top-3 right-3 bg-white/95 rounded-full p-1.5 border border-dark-chocolate/10 hover:bg-accent-yellow/80 transition-colors"
                      title="Add to mini museum"
                    >
                      <Plus size={16} className="text-dark-chocolate" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2 leading-tight line-clamp-2">
                      {artifact.artifact_name}
                    </h3>
                    <p className="text-sm text-dark-chocolate/70 line-clamp-2 mb-3">{artifact.description}</p>

                    <div className="space-y-1 mb-4 text-xs text-dark-chocolate/80">
                      <p className="flex items-center gap-1.5">
                        <User size={12} /> {artifact.creator || "Unknown Creator"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Folder size={12} /> {artifact.museum_name}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin size={12} /> {artifact.location}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorite(artifact.artifact_id)}
                      className="btn btn-sm w-full bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Just for Fun</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">Achievements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dummyAchievements.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="bg-white rounded-xl border border-dark-chocolate/10 p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-accent-yellow/40 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-dark-chocolate" />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2">{item.title}</h3>
                  <p className="text-dark-chocolate/70 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Your Bookings</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">Tour Tickets</h2>
          </div>

          {tourTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-dark-chocolate/10 p-10 text-center text-dark-chocolate/60">
              No booked tour tickets yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {tourTickets.map((ticket) => (
                <Link
                  key={ticket.booking_id}
                  to={`/tour/${ticket.museum?.id}/payment-success/${ticket.booking_id}`}
                  className="hover-3d my-2 mx-2 cursor-pointer"
                >
                  <div className="card w-96 bg-dark-chocolate text-white shadow-xl bg-[radial-gradient(circle_at_bottom_left,#ffffff04_35%,transparent_36%),radial-gradient(circle_at_top_right,#ffffff04_35%,transparent_36%)] [background-size:4.95em_4.95em] border border-white/10">
                    <div className="card-body">
                      <div className="flex justify-between mb-10">
                        <div className="font-bold uppercase tracking-wide line-clamp-1">{ticket.museum?.name || "Museum"}</div>
                        <div className="text-5xl opacity-10">❁</div>
                      </div>
                      <div className="text-lg mb-4 opacity-50 font-mono break-all">{ticket.ticket_code}</div>
                      <div className="flex justify-between gap-3">
                        <div>
                          <div className="text-xs opacity-40 uppercase tracking-wide">Owner</div>
                          <div className="font-semibold line-clamp-1">{user?.username || "Curator"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-40 uppercase tracking-wide">Tour Date</div>
                          <div className="font-semibold">{formatDate(ticket.tour_date)}</div>
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
              ))}
            </div>
          )}
        </section>

        <section className="pb-12">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Your Mini Museums</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">Museum Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-dark-chocolate/10 rounded-xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">Total Mini Museums</p>
              <p className="font-playfair text-4xl font-bold text-dark-chocolate mt-2">{museums.length}</p>
            </div>
            <div className="bg-white border border-dark-chocolate/10 rounded-xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">Total Likes</p>
              <p className="font-playfair text-4xl font-bold text-dark-chocolate mt-2">{museumStats.totalLikes}</p>
            </div>
            <div className="bg-white border border-dark-chocolate/10 rounded-xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">Total Artifacts</p>
              <p className="font-playfair text-4xl font-bold text-dark-chocolate mt-2">{museumStats.totalArtifacts}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {museumStats.detailRows.map((museum) => (
              <Link
                to={`/view-museum/${museum.mini_museum_id}`}
                key={museum.mini_museum_id}
                className="group bg-white rounded-xl border border-dark-chocolate/10 overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={museum.picture_url || "https://placehold.co/600x400"}
                    alt={museum.mini_museum_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2 line-clamp-1">
                    {museum.mini_museum_name}
                  </h3>
                  <p className="text-sm text-dark-chocolate/70 line-clamp-2 mb-4">{museum.description}</p>
                  <div className="flex items-center justify-between text-sm font-bold text-dark-chocolate">
                    <span className="flex items-center gap-1"><Heart size={14} className="text-red-500 fill-red-500" /> {museum.likes_count}</span>
                    <span>{museum.artifactCount} artifacts</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {manageArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setManageArtifact(null)}></div>

          <div className="relative w-full max-w-xl bg-old-paper rounded-2xl border border-dark-chocolate/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-chocolate/10">
              <h3 className="font-playfair text-2xl font-bold text-dark-chocolate">Add to Museum</h3>
              <button onClick={() => setManageArtifact(null)} className="btn btn-ghost btn-circle">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
              {museums.length === 0 ? (
                <p className="text-dark-chocolate/60 text-sm">Create a mini museum first from My Museums.</p>
              ) : (
                museums.map((museum) => {
                  const isIn = isArtifactInMuseum(manageArtifact.artifact_id, museum.mini_museum_id);
                  return (
                    <button
                      key={museum.mini_museum_id}
                      onClick={() => toggleArtifactInMuseum(manageArtifact, museum)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isIn
                          ? "bg-dark-chocolate text-white border-dark-chocolate"
                          : "bg-white text-dark-chocolate border-dark-chocolate/15 hover:border-accent-orange"
                      }`}
                    >
                      <span className="text-left">
                        <span className="font-bold block">{museum.mini_museum_name}</span>
                        <span className={`text-xs ${isIn ? "text-white/70" : "text-dark-chocolate/60"}`}>
                          {isIn ? "Already added - click to remove" : "Click to add"}
                        </span>
                      </span>
                      <span className="text-xs font-bold">{isIn ? "Added" : "Add"}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {popMsg && (
        <div className="fixed top-4 right-4 z-60 bg-dark-chocolate text-white px-4 py-2 rounded-lg shadow-lg">
          {popMsg}
        </div>
      )}
      </div>
    </>
  );
}
