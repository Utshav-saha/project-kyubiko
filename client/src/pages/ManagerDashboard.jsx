import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { Search, User, MapPin, Pencil, Trash2, X } from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [museum, setMuseum] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [order, setOrder] = useState("");

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [formState, setFormState] = useState({});
  const [editFields, setEditFields] = useState({});
  const [pageError, setPageError] = useState("");

  const fetchArtifacts = async (token, opts = {}) => {
    const params = new URLSearchParams();
    if (opts.letters !== undefined ? opts.letters : searchTerm) {
      params.append("letters", opts.letters !== undefined ? opts.letters : searchTerm);
    }
    if (opts.category !== undefined ? opts.category : categoryFilter) {
      params.append("category", opts.category !== undefined ? opts.category : categoryFilter);
    }
    if (opts.order !== undefined ? opts.order : order) {
      params.append("order", opts.order !== undefined ? opts.order : order);
    }

    const response = await fetch(`${API_URL}/manager/artifacts?${params.toString()}`, {
      method: "GET",
      headers: { token },
    });

    if (!response.ok) throw new Error("Failed to fetch manager artifacts");
    const data = await response.json();
    setArtifacts(data.artifacts || []);
  };

  const fetchData = async () => {
    try {
      setPageError("");
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "manager") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("avatar_url");
        navigate("/login");
        return;
      }

      const [authRes, museumRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/manager/authorize`, { method: "GET", headers: { token } }),
        fetch(`${API_URL}/manager/museum`, { method: "GET", headers: { token } }),
        fetch(`${API_URL}/manager/categories`, { method: "GET", headers: { token } }),
      ]);

      if (!authRes.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("avatar_url");
        navigate("/login");
        return;
      }

      const authData = await authRes.json();
      if (!museumRes.ok) {
        const errData = await museumRes.json().catch(() => ({}));
        throw new Error(errData.error || "No museum mapped to this manager account.");
      }
      const museumData = await museumRes.json();
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];

      setUser(authData.user);
      setMuseum(museumData);
      setCategories(categoriesData);

      await fetchArtifacts(token, {
        letters: "",
        category: "",
        order: "",
      });
    } catch (error) {
      console.error(error.message);
      setPageError(error.message || "Failed to load manager dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) return;
        await fetchArtifacts(token);
      } catch (error) {
        console.error(error.message);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, order]);

  const openArtifactOverlay = (artifact) => {
    setSelectedArtifact(artifact);
    setFormState({
      artifact_name: artifact.artifact_name || "",
      description: artifact.description || "",
      creator: artifact.creator || "",
      time_period: artifact.time_period || "",
      origin: artifact.origin || "",
      picture_url: artifact.picture_url || "",
      category_name: artifact.category_name || "",
    });
    setEditFields({});
  };

  const toggleFieldEdit = (field) => {
    setEditFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const saveArtifact = async () => {
    if (!selectedArtifact) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/manager/artifact/${selectedArtifact.artifact_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) throw new Error("Could not update artifact");

      await fetchArtifacts(token);
      setSelectedArtifact((prev) => (prev ? { ...prev, ...formState } : null));
      setEditFields({});
    } catch (error) {
      console.error(error.message);
    }
  };

  const removeArtifact = async (artifactId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/manager/artifact/${artifactId}`, {
        method: "DELETE",
        headers: { token },
      });

      if (!response.ok) throw new Error("Could not remove artifact");

      await fetchArtifacts(token);
      if (selectedArtifact?.artifact_id === artifactId) {
        setSelectedArtifact(null);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const detailRows = useMemo(
    () => [
      { key: "artifact_name", label: "Name" },
      { key: "description", label: "Description", isTextArea: true },
      { key: "creator", label: "Creator" },
      { key: "time_period", label: "Time Period" },
      { key: "origin", label: "Origin" },
      { key: "category_name", label: "Category", isSelect: true },
      { key: "picture_url", label: "Image URL" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (!user) return null;

  if (pageError) {
    return (
      <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative">
        <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-playfair text-4xl font-bold mb-4">Manager Dashboard</h1>
          <p className="text-dark-chocolate/80">{pageError}</p>
        </div>
      </div>
    );
  }

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
            <li><Link to="/manager-dashboard" className="text-accent-yellow bg-white/10 rounded-lg">Museum</Link></li>
            <li><Link to="/explore" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Explore</Link></li>
            <li><Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Search</Link></li>
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">{user.username}</span>
          </div>
          <UserAvatarMenu user={user} logoutOnly={true} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-7 flex flex-col">
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Museum Details</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate mb-3">{museum?.name}</h1>
            <p className="text-dark-chocolate/70 leading-relaxed mb-5">{museum?.description}</p>

            <div className="space-y-2 text-sm text-dark-chocolate/80 mb-7">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-accent-orange" /> {museum?.country}</p>
              <p className="flex items-center gap-2"><User size={14} className="text-accent-orange" /> {museum?.creator}</p>
              <p><span className="font-bold">Category:</span> {museum?.category}</p>
            </div>
          </div>

          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md overflow-hidden min-h-80">
            <img
              src={museum?.image}
              alt={museum?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <section className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="font-playfair text-3xl font-bold text-dark-chocolate">Artifacts</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-chocolate/40" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search artifacts..."
                  className="input input-bordered w-full bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none pl-9"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select select-bordered bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_name} value={c.category_name}>{c.category_name}</option>
                ))}
              </select>

              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="select select-bordered bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
              >
                <option value="">Default</option>
                <option value="newest added">Newest Added</option>
                <option value="oldest artefact">Oldest Artefact</option>
                <option value="most popular">Most Popular</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {artifacts.map((artifact) => (
              <div
                key={artifact.artifact_id}
                className="group bg-old-paper/60 border border-dark-chocolate/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 relative"
              >
                <div className="w-full md:w-56 h-40 overflow-hidden rounded-lg">
                  <img
                    src={artifact.picture_url}
                    alt={artifact.artifact_name}
                    className="w-full h-full object-cover"
                    onClick={() => openArtifactOverlay(artifact)}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-1 line-clamp-1">{artifact.artifact_name}</h3>
                  <p className="text-sm text-dark-chocolate/70 line-clamp-2 mb-2">{artifact.description}</p>
                  <div className="text-xs text-dark-chocolate/80 space-y-1">
                    <p><span className="font-bold">Creator:</span> {artifact.creator}</p>
                    <p><span className="font-bold">Period:</span> {artifact.time_period}</p>
                    <p><span className="font-bold">Category:</span> {artifact.category_name}</p>
                    <p><span className="font-bold">Origin:</span> {artifact.origin}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeArtifact(artifact.artifact_id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Artifact"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {artifacts.length === 0 && (
              <div className="text-center py-10 text-dark-chocolate/60">No artifacts found for this museum.</div>
            )}
          </div>
        </section>
      </div>

      {selectedArtifact && (
        <dialog className="modal modal-open z-60 bg-transparent">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-stone-100 text-stone-800 rounded-xl font-dmsans flex flex-col">
            <div className="flex flex-col md:flex-row relative bg-white">
              <button
                onClick={() => setSelectedArtifact(null)}
                className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 z-10 bg-white/80 hover:text-black"
              >
                <X size={16} />
              </button>

              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img
                  src={formState.picture_url}
                  alt={formState.artifact_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-7 md:w-1/2 space-y-4">
                {detailRows.map((row) => (
                  <div key={row.key}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">{row.label}</p>
                      <button onClick={() => toggleFieldEdit(row.key)} className="text-stone-500 hover:text-stone-900">
                        <Pencil size={14} />
                      </button>
                    </div>

                    {editFields[row.key] ? (
                      row.isTextArea ? (
                        <textarea
                          value={formState[row.key] || ""}
                          onChange={(e) => setFormState((prev) => ({ ...prev, [row.key]: e.target.value }))}
                          rows={3}
                          className="textarea textarea-bordered w-full bg-white border-stone-300"
                        />
                      ) : row.isSelect ? (
                        <select
                          value={formState[row.key] || ""}
                          onChange={(e) => setFormState((prev) => ({ ...prev, [row.key]: e.target.value }))}
                          className="select select-bordered w-full bg-white border-stone-300"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.category_name} value={cat.category_name}>{cat.category_name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formState[row.key] || ""}
                          onChange={(e) => setFormState((prev) => ({ ...prev, [row.key]: e.target.value }))}
                          className="input input-bordered w-full bg-white border-stone-300"
                        />
                      )
                    ) : (
                      <p className="text-sm text-stone-800">{formState[row.key] || "-"}</p>
                    )}
                  </div>
                ))}

                <div className="pt-3 flex gap-3">
                  <button
                    onClick={saveArtifact}
                    className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => removeArtifact(selectedArtifact.artifact_id)}
                    className="btn bg-red-500 text-white hover:bg-red-600 border-none"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop" onClick={() => setSelectedArtifact(null)}>
            <button className="cursor-default">close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
