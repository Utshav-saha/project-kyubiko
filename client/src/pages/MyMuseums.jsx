import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowUpRight,
  MapPin,
  Search,
  X,
  Image as ImageIcon,
  Upload,
  Heart,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL, CLOUD_NAME, UPLOAD_PRESET } from "../config";

export default function MyMuseums () {
  const navigate = useNavigate();
  const [isForm, setIsForm] = useState(false);

  const [museums, setMuseums] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    mini_museum_name: "",
    description: "",
    image: null,
    imagePreview: null,
  });

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

        const response = await fetch(`${API_URL}/my-museums`, {
          method: "GET",
          headers: { token: token },
        });

        const parseRes = await response.json();

        if (response.ok) {
          setUser(parseRes.user);
          setMuseums(parseRes.museums);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalImageUrl =
        "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80"; // Default

      if (formData.image) {
        const uploadedUrl = await uploadImage(formData.image);

        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          alert("Image upload failed. Using default cover.");
        }
      }

      const token = localStorage.getItem("token");

      const body = {
        mini_museum_name: formData.mini_museum_name,
        description: formData.description,
        picture_url: finalImageUrl,
      };

      const response = await fetch(`${API_URL}/my-museums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify(body),
      });

      const newMuseum = await response.json();

      setMuseums([...museums, newMuseum]);
      setFormData({
        mini_museum_name: "",
        description: "",
        image: null,
        imagePreview: null,
      });
      setIsForm(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: previewUrl,
      }));
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
    <div className="min-h-screen bg-old-paper font-dmsans selection:bg-accent-orange/30 selection:text-dark-chocolate relative">
      <div className="fixed inset-0 bg-noise opacity-40 pointer-events-none mix-blend-multiply z-0"></div>

      {/* --- Hero Section --- */}
      <div className="relative bg-dark-chocolate text-old-paper pb-32 overflow-hidden z-10">
        {/* Navbar */}
        <div className="navbar shadow-sm bg-transparent z-20 border-b border-white/5">
          <div className="navbar shadow-sm bg-transparent z-20">
            <div className="navbar-start">
              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-dash lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
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
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-white"
                >
                  <li>
                    <a>Home</a>
                  </li>
                  <li>
                    <a>Explore</a>
                  </li>
                  <li>
                    <a>Search</a>
                  </li>
                </ul>
              </div>
              <a className="btn btn-ghost text-xl text-white ml-5">Logo</a>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 text-white">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/explore">Explore</Link>
                </li>
                <li>
                  <Link to="/search">Search</Link>
                </li>
              </ul>
            </div>

            <div className="navbar-end gap-3">
              <div className="ml-4 bg-white/10 text-dark-chocolate px-4 py-2 rounded-full shadow-md">
                <span className="text-sm font-medium text-white">
                  {user.username}
                </span>
              </div>
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
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative">
          <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="max-w-3xl">
              <h1 className="font-playfair text-6xl md:text-8xl font-medium tracking-tight leading-[0.9] mb-8">
                My <br />
                <span className="italic opacity-80 text-accent-yellow">
                  Collection
                </span>
              </h1>
            </div>
            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 min-w-35">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                  Museums
                </p>
                <p className="font-playfair text-4xl font-bold text-white">
                  {museums.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Grid Section --- */}
      <div className="max-w-7xl mx-auto px-6 mt-15 relative z-20 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Button */}
          <button
            onClick={() => setIsForm(true)}
            className="group relative h-full min-h-105 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-dark-chocolate/20 hover:border-accent-orange hover:bg-white/40 transition-all duration-300 gap-6 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-accent-orange to-accent-yellow flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
              <Plus className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-playfair text-3xl font-bold text-dark-chocolate mb-2">
                Create New
              </h3>
            </div>
          </button>

          {/* Museum Cards */}
          {museums.map((museum) => (

            <Link
              to={`/view-museum/${museum.mini_museum_id}`}
              key={museum.mini_museum_id} 
              className="group h-112.5 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col border border-dark-chocolate/10"
            >
            
              <div className="relative h-[65%] overflow-hidden">
                {/* Updated Image Column */}
                <img
                  src={museum.picture_url || "https://placehold.co/600x400"}
                  alt={museum.mini_museum_name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-dark-chocolate/5">
                  <MapPin size={12} className="text-accent-orange" />
                  <span className="text-xs font-bold tracking-widest uppercase text-dark-chocolate">
                    Virtual
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6 relative bg-white">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Updated Name Column */}
                    <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2 leading-none group-hover:text-accent-orange transition-colors">
                      {museum.mini_museum_name}
                    </h3>
                    <p className="text-dark-chocolate/60 text-sm leading-relaxed line-clamp-2">
                      {museum.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-dark-chocolate/10 pt-4 mt-2">
                    <span className="text-xs font-mono text-dark-chocolate/50 uppercase">
                      ID: 0{museum.mini_museum_id}
                    </span>
                    {/* New Likes Column */}
                    <span className="text-xs font-bold text-dark-chocolate flex items-center gap-1">
                      <Heart size={14} className="text-red-500 fill-red-500" />
                      {museum.likes_count} LIKES
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {isForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-dark-chocolate/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsForm(false)}
          ></div>

          <div className="relative w-full max-w-4xl bg-old-paper rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row h-auto md:h-125">
            <button
              onClick={() => setIsForm(false)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/50 hover:bg-white text-dark-chocolate transition-colors backdrop-blur-md"
            >
              <X size={20} />
            </button>

            {/* Image Preview Area */}
            <div className="relative w-full md:w-5/12 bg-dark-chocolate/5 h-64 md:h-full">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon />
                </div>
              )}
            </div>

            {/* Actual Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 p-8 md:p-12 flex flex-col justify-center relative bg-white/30 backdrop-blur-sm"
            >
              <div className="mb-8">
                <h2 className="font-playfair text-4xl font-bold text-dark-chocolate mb-2">
                  New Mini Museum
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark-chocolate/60">
                    Mini Museum Name
                  </label>
                  <input
                    type="text"
                    name="mini_museum_name"
                    value={formData.mini_museum_name}
                    onChange={handleInputChange}
                    placeholder="E.g. The Renaissance Era"
                    required
                    className="w-full bg-transparent border-b-2 border-dark-chocolate/10 px-0 py-3 text-dark-chocolate font-playfair font-medium text-xl focus:outline-none focus:border-accent-orange transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark-chocolate/60">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full bg-white/40 border border-dark-chocolate/10 rounded-lg px-4 py-3 text-black"
                  ></textarea>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-dark-chocolate text-old-paper font-medium hover:bg-accent-orange hover:text-white transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={18} /> Create Museum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

