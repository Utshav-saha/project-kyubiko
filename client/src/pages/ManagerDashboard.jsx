import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL, CLOUD_NAME, UPLOAD_PRESET } from "../config";
import {
  Search,
  User,
  MapPin,
  Pencil,
  Trash2,
  X,
  Plus,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

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

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [museum, setMuseum] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locationsList, setLocationsList] = useState({
    cities: [],
    countries: [],
  });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [order, setOrder] = useState("");

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isAddingNewArtifact, setIsAddingNewArtifact] = useState(false);
  const [formState, setFormState] = useState({});
  const [editFields, setEditFields] = useState({});

  const [showMuseumModal, setShowMuseumModal] = useState(false);
  const [museumForm, setMuseumForm] = useState({});

  const [pageError, setPageError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchArtifacts = useCallback(
    async (token, opts = {}) => {
      const params = new URLSearchParams();
      if (opts.letters !== undefined ? opts.letters : searchTerm)
        params.append(
          "letters",
          opts.letters !== undefined ? opts.letters : searchTerm,
        );
      if (opts.category !== undefined ? opts.category : categoryFilter)
        params.append(
          "category",
          opts.category !== undefined ? opts.category : categoryFilter,
        );
      if (opts.order !== undefined ? opts.order : order)
        params.append("order", opts.order !== undefined ? opts.order : order);

      const response = await fetch(
        `${API_URL}/manager/artifacts?${params.toString()}`,
        { headers: { token } },
      );
      if (!response.ok) return;
      const data = await response.json();
      setArtifacts(data.artifacts || []);
    },
    [searchTerm, categoryFilter, order],
  );

  const fetchData = useCallback(async () => {
    try {
      setPageError("");
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const [authRes, museumRes, categoriesRes, locRes] = await Promise.all([
        fetch(`${API_URL}/manager/authorize`, { headers: { token } }),
        fetch(`${API_URL}/manager/museum`, { headers: { token } }),
        fetch(`${API_URL}/manager/categories`, { headers: { token } }),
        fetch(`${API_URL}/manager/locations-data`, { headers: { token } }),
      ]);

      if (!authRes.ok) return navigate("/login");

      const authData = await authRes.json();
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
      const locationsData = locRes.ok
        ? await locRes.json()
        : { cities: [], countries: [] };

      setUser(authData.user);
      setCategories(categoriesData);
      setLocationsList(locationsData);

      if (!museumRes.ok) {
        setMuseum(null);
      } else {
        const museumData = await museumRes.json();
        setMuseum(museumData);
        await fetchArtifacts(token, { letters: "", category: "", order: "" });
      }
    } catch (error) {
      setPageError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchArtifacts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (museum) fetchArtifacts(localStorage.getItem("token"));
  }, [searchTerm, categoryFilter, order, museum, fetchArtifacts]);

  const handleOpenMuseumModal = (isEdit = false) => {
    setMuseumForm(
      isEdit && museum
        ? {
            museum_name: museum.museum_name || museum.name || "",
            description: museum.description || "",
            category: museum.category || "",
            open_days: museum.open_days || "",
            picture_url: museum.picture_url || museum.image || "",
            city: museum.city || "",
            country: museum.country || "",
            latitude:
              museum.latitude !== null && museum.latitude !== undefined
                ? String(museum.latitude)
                : "",
            longitude:
              museum.longitude !== null && museum.longitude !== undefined
                ? String(museum.longitude)
                : "",
          }
        : {
            museum_name: "",
            description: "",
            category: "",
            open_days: "",
            picture_url: "",
            city: "",
            country: "",
            latitude: "",
            longitude: "",
          },
    );
    setShowMuseumModal(true);
  };

  const handleSaveMuseum = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = museum
        ? `${API_URL}/manager/edit`
        : `${API_URL}/manager/create`;
      const method = museum ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(museumForm),
      });

      if (!response.ok) throw new Error("Failed to save museum");
      setShowMuseumModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenArtifactModal = (artifact = null) => {
    if (artifact) {
      setIsAddingNewArtifact(false);
      setSelectedArtifact(artifact);
      setFormState({ ...artifact });
      setEditFields({});
    } else {
      setIsAddingNewArtifact(true);
      setSelectedArtifact({ artifact_id: "new" });
      setFormState({
        artifact_name: "",
        description: "",
        creator: "",
        time_period: "",
        origin: "",
        picture_url: "",
        category_name: "",
      });
      const allEditable = detailRows.reduce(
        (acc, row) => ({ ...acc, [row.key]: true }),
        {},
      );
      setEditFields(allEditable);
    }
  };

  const handleSaveArtifact = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = isAddingNewArtifact
        ? `${API_URL}/manager/add`
        : `${API_URL}/manager/artifact/${selectedArtifact.artifact_id}`;
      const method = isAddingNewArtifact ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(formState),
      });

      if (!response.ok) throw new Error("Could not save artifact");

      setSelectedArtifact(null);
      await fetchArtifacts(token);
    } catch (error) {
      alert(error.message);
    }
  };

  const removeArtifact = async (artifactId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/manager/artifact/${artifactId}`,
        { method: "DELETE", headers: { token } },
      );
      if (!response.ok) throw new Error("Could not remove artifact");
      await fetchArtifacts(token);
      if (selectedArtifact?.artifact_id === artifactId)
        setSelectedArtifact(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleImageChange = async (e, setFormFunc) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const url = await uploadImage(file);
    if (url) {
      setFormFunc((prev) => ({ ...prev, picture_url: url }));
    }
    setUploadingImage(false);
  };

  const detailRows = useMemo(
    () => [
      { key: "artifact_name", label: "Name" },
      { key: "description", label: "Description", isTextArea: true },
      { key: "creator", label: "Creator" },
      { key: "time_period", label: "Time Period" },
      { key: "origin", label: "Origin" },
      { key: "category_name", label: "Category", isSelect: true },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-playfair text-2xl">
        {pageError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative pb-20">
      <datalist id="cities-list">
        {locationsList.cities.map((city, idx) => (
          <option key={idx} value={city} />
        ))}
      </datalist>
      <datalist id="countries-list">
        {locationsList.countries.map((country, idx) => (
          <option key={idx} value={country} />
        ))}
      </datalist>

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
                to="/manager-dashboard"
                className="text-accent-yellow bg-white/10 rounded-lg"
              >
                Museum
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
                to="/tours"
                className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Tours
              </Link>
            </li>
            <li>
              <Link
                to="/manager-quiz/new"
                className="hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Quiz
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">
              {user?.username}
            </span>
          </div>
          <UserAvatarMenu user={user} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {!museum ? (
          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-10 text-center flex flex-col items-center justify-center min-h-100">
            <h2 className="font-playfair text-4xl font-bold mb-4">
              You don't have a museum yet
            </h2>
            <p className="text-dark-chocolate/70 mb-8 max-w-md">
              Start your curator journey by establishing your digital museum
              identity, location, and operating hours.
            </p>
            <button
              onClick={() => handleOpenMuseumModal(false)}
              className="btn bg-accent-orange text-white border-none hover:bg-orange-600 px-8"
            >
              Create Museum
            </button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
              <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-7 flex flex-col relative">
                <button
                  onClick={() => handleOpenMuseumModal(true)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-dark-chocolate"
                >
                  <Pencil size={18} />
                </button>
                <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">
                  Museum Details
                </p>
                <h1 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate mb-3 pr-10">
                  {museum.name}
                </h1>
                <p className="text-dark-chocolate/70 leading-relaxed mb-5">
                  {museum.description}
                </p>

                <div className="space-y-2 text-sm text-dark-chocolate/80 mb-7">
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-accent-orange" />{" "}
                    {museum.city}, {museum.country}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-accent-orange" />{" "}
                    {museum.open_days}
                  </p>
                  <p className="flex items-center gap-2">
                    <User size={16} className="text-accent-orange" /> Created
                    by: {museum.creator}
                  </p>
                  <p className="mt-2">
                    <span className="font-bold">Category:</span>{" "}
                    {museum.category}
                  </p>
                  <p>
                    <span className="font-bold">Latitude:</span>{" "}
                    {museum.latitude ?? "-"}
                  </p>
                  <p>
                    <span className="font-bold">Longitude:</span>{" "}
                    {museum.longitude ?? "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md overflow-hidden min-h-75 max-h-125 lg:max-h-none relative">
                {" "}
                {museum.image ? (
                  <img
                    src={museum.image}
                    alt={museum.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-200">
                    No Image provided
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-6">
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="font-playfair text-3xl font-bold text-dark-chocolate">
                  Artifacts
                </h2>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                  <div className="relative w-full md:w-64">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-chocolate/40"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="input input-bordered input-sm w-full pl-9 bg-white text-stone-800 border-stone-800"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="select select-bordered select-sm bg-white text-stone-800 border-stone-800"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.category_name} value={c.category_name}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="select select-bordered select-sm bg-white text-stone-800 border-stone-800"
                  >
                    <option value="">Default Sorting</option>
                    <option value="newest added">Newest Added</option>
                    <option value="oldest artefact">Oldest Artefact</option>
                  </select>
                  <button
                    onClick={() => handleOpenArtifactModal(null)}
                    className="btn btn-sm bg-dark-chocolate text-white border-none hover:bg-accent-orange whitespace-nowrap"
                  >
                    <Plus size={16} /> Add Artifact
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.artifact_id}
                    className="group bg-old-paper/60 border border-dark-chocolate/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 relative"
                  >
                    <div className="w-full md:w-56 h-40 overflow-hidden rounded-lg bg-stone-200">
                      {artifact.picture_url ? (
                        <img
                          src={artifact.picture_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-16">
                      <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-1">
                        {artifact.artifact_name}
                      </h3>
                      <p className="text-sm text-dark-chocolate/70 line-clamp-2 mb-2">
                        {artifact.description}
                      </p>
                      <div className="text-xs text-dark-chocolate/80 space-y-1 grid grid-cols-2">
                        <p>
                          <span className="font-bold">Creator:</span>{" "}
                          {artifact.creator}
                        </p>
                        <p>
                          <span className="font-bold">Origin:</span>{" "}
                          {artifact.origin}
                        </p>
                        <p>
                          <span className="font-bold">Period:</span>{" "}
                          {artifact.time_period}
                        </p>
                        <p>
                          <span className="font-bold">Category:</span>{" "}
                          {artifact.category_name}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenArtifactModal(artifact)}
                        className="p-2 rounded-full bg-dark-chocolate text-white hover:bg-accent-orange"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => removeArtifact(artifact.artifact_id)}
                        className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {artifacts.length === 0 && (
                  <div className="text-center py-10 text-dark-chocolate/60">
                    No artifacts found.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {selectedArtifact && (
        <dialog className="modal modal-open z-50 bg-black/60">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-stone-100 rounded-xl flex flex-col md:flex-row relative">
            <button
              onClick={() => setSelectedArtifact(null)}
              className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 z-20 bg-white/80"
            >
              <X size={16} />
            </button>

            <div className="md:w-1/2 h-64 md:h-auto relative bg-stone-200 flex flex-col items-center justify-center">
              {formState.picture_url ? (
                <img
                  src={formState.picture_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={48} className="text-stone-400" />
              )}
              <label className="absolute bottom-4 right-4 btn btn-sm bg-white/90 text-black border-none cursor-pointer">
                {uploadingImage ? "Uploading..." : "Change Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, setFormState)}
                />
              </label>
            </div>

            <div className="p-7 md:w-1/2 space-y-4">
              <h3 className="font-playfair text-2xl font-bold mb-4">
                {isAddingNewArtifact ? "Add New Artifact" : "Edit Artifact"}
              </h3>
              {detailRows.map((row) => (
                <div key={row.key}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs uppercase text-stone-500 font-bold">
                      {row.label}
                    </p>
                    {!isAddingNewArtifact && (
                      <button
                        onClick={() =>
                          setEditFields((prev) => ({
                            ...prev,
                            [row.key]: !prev[row.key],
                          }))
                        }
                        className="text-stone-500 hover:text-black"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                  {editFields[row.key] ? (
                    row.isTextArea ? (
                      <textarea
                        value={formState[row.key] || ""}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [row.key]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="textarea textarea-bordered w-full border-2 border-stone-800 bg-white text-stone-800"
                      />
                    ) : row.isSelect ? (
                      <select
                        value={formState[row.key] || ""}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [row.key]: e.target.value,
                          }))
                        }
                        className="select select-bordered w-full border-2 border-stone-800 bg-white text-stone-800"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option
                            key={cat.category_name}
                            value={cat.category_name}
                          >
                            {cat.category_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formState[row.key] || ""}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [row.key]: e.target.value,
                          }))
                        }
                        className="input input-bordered w-full border-2 border-stone-800 bg-white text-stone-800"
                      />
                    )
                  ) : (
                    <p className="text-sm text-stone-800 border-b border-stone-300 py-2">
                      {formState[row.key] || "-"}
                    </p>
                  )}
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleSaveArtifact}
                  disabled={uploadingImage}
                  className="btn bg-dark-chocolate text-white hover:bg-accent-orange flex-1"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {showMuseumModal && (
        <dialog className="modal modal-open z-50 bg-black/60">
          <div className="modal-box max-w-2xl bg-white p-6 rounded-xl relative">
            <button
              onClick={() => setShowMuseumModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
            >
              <X size={16} />
            </button>
            <h3 className="font-playfair text-3xl font-bold mb-6 text-stone-800">
              {museum ? "Edit Museum Infos" : "Create Your Museum"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Museum Name
                  </label>
                  <input
                    type="text"
                    value={museumForm.museum_name || ""}
                    onChange={(e) =>
                      setMuseumForm({
                        ...museumForm,
                        museum_name: e.target.value,
                      })
                    }
                    className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    value={museumForm.category || ""}
                    onChange={(e) =>
                      setMuseumForm({ ...museumForm, category: e.target.value })
                    }
                    className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Country
                  </label>
                  <input
                    list="countries-list"
                    type="text"
                    value={museumForm.country || ""}
                    onChange={(e) =>
                      setMuseumForm({ ...museumForm, country: e.target.value })
                    }
                    className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    City
                  </label>
                  <input
                    list="cities-list"
                    type="text"
                    value={museumForm.city || ""}
                    onChange={(e) =>
                      setMuseumForm({ ...museumForm, city: e.target.value })
                    }
                    className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={museumForm.latitude || ""}
                    onChange={(e) =>
                      setMuseumForm({ ...museumForm, latitude: e.target.value })
                    }
                    className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={museumForm.longitude || ""}
                    onChange={(e) =>
                      setMuseumForm({
                        ...museumForm,
                        longitude: e.target.value,
                      })
                    }
                    className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={museumForm.description || ""}
                  onChange={(e) =>
                    setMuseumForm({
                      ...museumForm,
                      description: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered w-full border-2 border-black bg-white text-stone-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">
                  Open Days (e.g. Mon-Fri 9AM - 5PM)
                </label>
                <input
                  type="text"
                  value={museumForm.open_days || ""}
                  onChange={(e) =>
                    setMuseumForm({ ...museumForm, open_days: e.target.value })
                  }
                  className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-2">
                  Museum Picture
                </label>
                <div className="flex items-center gap-4">
                  {museumForm.picture_url && (
                    <img
                      src={museumForm.picture_url}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-black"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setMuseumForm)}
                    className="file-input file-input-bordered w-full border-2 border-black bg-white text-stone-800"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveMuseum}
                disabled={uploadingImage}
                className="btn bg-dark-chocolate text-white hover:bg-accent-orange w-full mt-4"
              >
                {uploadingImage ? "Uploading..." : "Save Museum"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
