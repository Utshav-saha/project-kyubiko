import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, X, ListPlus, Trash2, ArrowRightCircle } from "lucide-react";
import { API_URL } from "../config";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

import Card from "../components/common/Card";
import Wishlist from "../components/curator/wishlist";

export default function ViewMuseum() {
  const { id } = useParams(); // url theke museum id
  const token = localStorage.getItem("token");

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const [selectedTargets, setSelectedTargets] = useState({});
  const [popMsg, setPopMsg] = useState(null);

  const [museumInfo, setMuseumInfo] = useState(null);

  const [sections, setSections] = useState([]);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // fetch museum info
    const fetch_info = async () => {
      try {
        const res = await fetch(`${API_URL}/view/authorize?id=${id}`, {
          method: "GET",
          headers: {
            token: token,
          },
        });
        const data = await res.json();
        setIsOwner(data.isOwner);
        setRole(data.user.role);

        // sections
        const section_data = await fetch(
          `${API_URL}/view/sections?mini_museum_id=${id}`,
        ).then((res) => res.json());

        // wishlist
        const wishlist_data = await fetch(`${API_URL}/view/wishlist`, {
          method: "GET",
          headers: {
            token: token,
          },
        }).then((res) => res.json());
        setWishlistItems(wishlist_data);

        if (data.miniMuseum) {
          setMuseumInfo({
            mini_museum_name: data.miniMuseum.mini_museum_name,
            description: data.miniMuseum.description,
            picture_url: data.miniMuseum.picture_url,
            user: data.user,
          });
        }

        // error check if string, else array
        const parsedSections = section_data.map((sec) => ({
          ...sec,
          items:
            typeof sec.items === "string" ? JSON.parse(sec.items) : sec.items,
        }));

        setSections(parsedSections);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetch_info();
  }, [id, token]);

  useEffect(() => {
    if (popMsg) {
      const timer = setTimeout(() => setPopMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popMsg]);

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/view/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          mini_museum_id: id,
          section_name: newSectionName.trim(),
        }),
      });

      if (res.ok) {
        const new_section = await fetch(
          `${API_URL}/view/sections?mini_museum_id=${id}`,
        ).then((res) => res.json());
        setSections(new_section);
        setPopMsg({ type: "success", text: "Section added successfully!" });
      }
    } catch (error) {
      console.error(error.message);
    }
    setNewSectionName("");
    setIsAddSectionModalOpen(false);
  };

  const handleDeleteSection = async (section_id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? All artifacts inside will be removed from this view.",
      )
    ) {
      const targetSection = sections.find((s) => s.id === section_id);
      if (!targetSection) return;
      const position = targetSection.id.split("-")[1];

      try {
        const response = await fetch(
          `${API_URL}/view/section?mini_museum_id=${id}&position=${position}`,
          {
            method: "DELETE",
            headers: {
              token: token,
            },
          },
        );

        if (response.ok) {
          setSections(sections.filter((s) => s.id !== section_id));
        } else {
          console.error("Failed");
        }
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const handleRemoveArtifact = async (section_id, artifact_id) => {
    const targetSection = sections.find((s) => s.id === section_id);
    if (!targetSection) return;
    const position = targetSection.id.split("-")[1];

    try {
      const res = await fetch(
        `${API_URL}/view/artifact?mini_museum_id=${id}&position=${position}&artifact_id=${artifact_id}`,
        {
          method: "DELETE",
          headers: {
            token: token,
          },
        },
      );

      if (res.ok) {
        // Refresh sections
        const sectionsRes = await fetch(
          `${API_URL}/view/sections?mini_museum_id=${id}`,
        );
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData);
      } else {
        console.error("Failed");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAddFromWishlist = async (artifact) => {
    const section_id = selectedTargets[artifact.artifact_id];

    if (!section_id) {
      alert("Please select a section first!");
      return;
    }
    const targetSection = sections.find((s) => s.id === section_id);
    const position = targetSection.id.split("-")[1];

    try {
      const response = await fetch(`${API_URL}/view/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          artifact_id: artifact.artifact_id,
          mini_museum_id: id,
          section_position: position,
          section_name: targetSection.name,
        }),
      });

      if (response.ok) {
        // Refresh sections
        const sectionsRes = await fetch(
          `${API_URL}/view/sections?mini_museum_id=${id}`,
        );
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData);

        // Remove from wishlist  , not fetching again but also deleted in backend
        setWishlistItems(
          wishlistItems.filter(
            (item) => item.artifact_id !== artifact.artifact_id,
          ),
        );
        setPopMsg({ type: "success", text: "Artifact added to section!" });
      } else {
        setPopMsg({
          type: "error",
          text: response.message || "Failed to add artifact",
        });
      }
    } catch (err) {
      setPopMsg({ type: "error", text: err.message });
    }
  };

  if (!museumInfo) {
  return (
    <div className="min-h-screen bg-old-paper p-12">
      <div className="skeleton h-[60vh] w-full mb-8"></div>
      <div className="space-y-4">
        <div className="skeleton h-12 w-1/2"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-old-paper font-dmsans selection:bg-accent-orange/30 selection:text-dark-chocolate relative pb-32">
      <div className="fixed inset-0 bg-noise opacity-40 pointer-events-none mix-blend-multiply z-0"></div>

      {/* --- Hero Section --- */}
      <div className="relative bg-dark-chocolate text-old-paper pb-24 overflow-hidden z-10">
        <div className="absolute inset-0 z-0">
          <img
            src={
              museumInfo.picture_url ||
              "https://placehold.co/100x100?text=No+Image"
            }
            alt="Museum Cover"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-t from-dark-chocolate via-dark-chocolate/80 to-transparent"></div>
        </div>

        {/* Navbar */}
        <div className="navbar shadow-sm bg-transparent z-20 relative border-b border-white/5">
          <div className="navbar-start">
            <a className="btn btn-ghost text-xl text-white ml-5">Kyubiku</a>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 text-white">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/my-museums">My Museums</Link>
              </li>
              <li>
                <Link to="/explore">Explore</Link>
              </li>
              <li>
                <Link to="/search">Search</Link>
              </li>
            </ul>
          </div>
          <div className="navbar-end gap-3 pr-6">
            <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-white">
                {museumInfo.user?.username}
              </span>
            </div>
            <UserAvatarMenu user={museumInfo.user} />
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 pt-16 relative z-20">
          <Link
            to="/my-museums"
            className="text-white/60 hover:text-accent-yellow mb-6 inline-block font-bold text-sm tracking-widest uppercase transition-colors"
          >
            ← Back to My Collection
          </Link>
          <div className="max-w-4xl">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
              {museumInfo.mini_museum_name}
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              {museumInfo.description}
            </p>
          </div>
        </div>
      </div>
      {/* --- Main Content (Sections) --- */}
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="font-playfair text-4xl font-bold text-dark-chocolate">
            Exhibition Sections
          </h2>
          {isOwner && (
            <button
              onClick={() => setIsAddSectionModalOpen(true)}
              className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none rounded-full px-6 shadow-lg"
            >
              <Plus size={18} /> Add Section
            </button>
          )}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-dark-chocolate/20 rounded-2xl bg-white/30">
            <h3 className="font-playfair text-2xl text-dark-chocolate mb-2">
              No Sections Yet
            </h3>
            <p className="text-dark-chocolate/60">
              Create a section to start organizing your artifacts.
            </p>
          </div>
        )}

        {sections.map((section) => (
          <div
            key={section.id}
            className="collapse collapse-arrow bg-white shadow-md border border-dark-chocolate/10 rounded-2xl group"
          >
            <input type="checkbox" defaultChecked />

            <div className="collapse-title text-xl font-playfair font-bold text-dark-chocolate flex items-center justify-between pr-12">
              <span className="text-2xl">{section.name}</span>
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteSection(section.id);
                  }}
                  className="btn btn-ghost btn-sm text-red-400 hover:text-red-600 hover:bg-red-50 z-20 relative"
                >
                  <Trash2 size={16} />{" "}
                  <span className="hidden md:inline">Delete Section</span>
                </button>
              )}
            </div>

            <div className="collapse-content border-t border-dark-chocolate/5 pt-8 bg-stone-50/50">
              {section.items.length === 0 ? (
                <p className="text-center text-dark-chocolate/40 font-bold py-8">
                  This section is empty. Open your wishlist to add artifacts.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {section.items.map((artifact) => (
                    <div
                      key={artifact.artifact_id}
                      className="relative flex justify-center group/card"
                    >
                      {/* Remove from Section Button */}
                      {isOwner && (
                        <button
                          onClick={() =>
                            handleRemoveArtifact(
                              section.id,
                              artifact.artifact_id,
                            )
                          }
                          className="absolute -top-3 -right-3 z-30 p-2 bg-white text-red-500 rounded-full shadow-lg border border-red-100 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover/card:opacity-100"
                          title="Remove from Section"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                      )}

                      <Card
                        artifactId={artifact.artifact_id}
                        name={artifact.name}
                        image={artifact.image}
                        description={artifact.description}
                        creator={artifact.creator}
                        time_period={artifact.time_period}
                        acquisition_date={artifact.acquisition_date}
                        museum_name={artifact.museum_name}
                        category={artifact.category}
                        origin={artifact.origin}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* --- FAB & Wishlist Drawer --- */}
      {isOwner && role === "curator" && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          {isWishlistOpen && (
            <div className="mb-4 relative animate-in slide-in-from-bottom-5 fade-in duration-300 shadow-2xl rounded-box border border-brown/30 bg-old-paper">
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="absolute top-4 right-4 z-20 text-dark-chocolate hover:text-accent-orange"
              >
                <X size={20} />
              </button>

              <Wishlist
                items={wishlistItems}
                // custom renderer
                actionRenderer={(item) => (
                  <div className="flex items-center gap-1">
                    <select
                      className="select select-sm select-bordered bg-white text-xs border-brown/30 focus:border-accent-orange focus:outline-none w-32"
                      value={selectedTargets[item.artifact_id] || ""}
                      onChange={(e) =>
                        setSelectedTargets({
                          ...selectedTargets,
                          [item.artifact_id]: e.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select Section...
                      </option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddFromWishlist(item)}
                      className="btn btn-sm btn-square bg-accent-orange text-white hover:bg-dark-chocolate border-none"
                      title="Add to Section"
                    >
                      <ArrowRightCircle size={18} />
                    </button>
                  </div>
                )}
              />
            </div>
          )}

          <button
            onClick={() => setIsWishlistOpen(!isWishlistOpen)}
            className="w-16 h-16 bg-accent-orange hover:bg-dark-chocolate text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <ListPlus size={28} />
          </button>
        </div>
      )}
      {popMsg && (
        <div
          className={`fixed top-4 right-4 ${popMsg.type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-4 py-2 rounded shadow-lg z-50`}
        >
          {popMsg.text}
        </div>
      )}
      {/* Add Section */}
      {isAddSectionModalOpen && isOwner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark-chocolate/60 backdrop-blur-sm"
            onClick={() => setIsAddSectionModalOpen(false)}
          ></div>
          <form
            onSubmit={handleAddSection}
            className="relative w-full max-w-md bg-old-paper rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <h3 className="font-playfair text-3xl font-bold text-dark-chocolate mb-6">
              New Section
            </h3>
            <div className="space-y-2 mb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-dark-chocolate/60">
                Section Name
              </label>
              <input
                type="text"
                autoFocus
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. Sculptures"
                className="w-full bg-white/50 border-b-2 border-dark-chocolate/10 px-0 py-3 text-dark-chocolate font-playfair font-medium text-xl focus:outline-none focus:border-accent-orange transition-all"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="btn btn-ghost text-dark-chocolate"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
              >
                Create Section
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
