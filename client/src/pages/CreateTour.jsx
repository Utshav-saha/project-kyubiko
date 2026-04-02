import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { ArrowLeft, Calendar, Plus, X } from "lucide-react";
import UserAvatarMenu from "../components/common/UserAvatarMenu";

const TOUR_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
];

const toDdMmYyyy = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

const toIsoDate = (ddmmyyyy) => {
  const text = String(ddmmyyyy || "").trim();
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

const to24Hour = (hh, mm, ampm) => {
  let h = Number(hh || 0);
  const m = Number(mm || 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  if (h < 1 || h > 12 || m < 0 || m > 59) return "";

  if (ampm === "AM") {
    if (h === 12) h = 0;
  } else if (ampm === "PM") {
    if (h !== 12) h += 12;
  } else {
    return "";
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

const formatTime12 = (time24) => {
  const [hRaw, mRaw] = String(time24 || "00:00:00").split(":");
  let h = Number(hRaw || 0);
  const m = Number(mRaw || 0);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return {
    hh: String(h).padStart(2, "0"),
    mm: String(m).padStart(2, "0"),
    ampm,
  };
};

const formatDisplayDate = (isoDate) => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayTimeRange = (start, end) => {
  const s = formatTime12(start);
  const e = formatTime12(end);
  return `${s.hh}:${s.mm} ${s.ampm} - ${e.hh}:${e.mm} ${e.ampm}`;
};

const parseOpenDays = (openDaysRaw) => {
  const text = String(openDaysRaw || "").toLowerCase();
  const map = {
    sun: "Sun",
    sunday: "Sun",
    mon: "Mon",
    monday: "Mon",
    tue: "Tue",
    tues: "Tue",
    tuesday: "Tue",
    wed: "Wed",
    wednesday: "Wed",
    thu: "Thu",
    thur: "Thu",
    thurs: "Thu",
    thursday: "Thu",
    fri: "Fri",
    friday: "Fri",
    sat: "Sat",
    saturday: "Sat",
  };

  const matches =
    text.match(/sun(day)?|mon(day)?|tue(s|sday)?|wed(nesday)?|thu(r|rs|rsday)?|fri(day)?|sat(urday)?/g) || [];

  return new Set(matches.map((m) => map[m] || map[m.replace(/day$/, "")]).filter(Boolean));
};

export default function CreateTour() {
  const navigate = useNavigate();
  const hiddenDateRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [museum, setMuseum] = useState(null);
  const [totalCreated, setTotalCreated] = useState(0);
  const [ongoingTour, setOngoingTour] = useState(null);
  const [activeTours, setActiveTours] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [tourTitle, setTourTitle] = useState("");
  const [priceWhole, setPriceWhole] = useState("5");
  const [priceCents, setPriceCents] = useState("99");
  const [tourDateText, setTourDateText] = useState("");
  const [capacity, setCapacity] = useState("20");
  const [startHh, setStartHh] = useState("10");
  const [startMm, setStartMm] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endHh, setEndHh] = useState("12");
  const [endMm, setEndMm] = useState("00");
  const [endAmPm, setEndAmPm] = useState("PM");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [revenueBySlot, setRevenueBySlot] = useState({});

  const loadOverview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("role");
      navigate("/login");
      return;
    }

    const [authRes, overviewRes] = await Promise.all([
      fetch(`${API_URL}/tour/authorize`, { headers: { token } }),
      fetch(`${API_URL}/tour/overview`, { headers: { token } }),
    ]);

    if (!authRes.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      return;
    }

    const authData = await authRes.json();
    setUser(authData.user || null);

    if (!overviewRes.ok) {
      const err = await overviewRes.json().catch(() => ({}));
      setErrorMessage(err.error || "Could not load tours");
      setMuseum(null);
      setTotalCreated(0);
      setOngoingTour(null);
      setActiveTours([]);
      return;
    }

    const data = await overviewRes.json();
    setMuseum(data.museum || null);
    setTotalCreated(Number(data.total_created_tours || 0));
    setOngoingTour(data.ongoing_tour || null);
    setActiveTours(data.active_tours || []);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await loadOverview();
      } catch (error) {
        setErrorMessage("Failed to load tour page");
      } finally {
        setLoading(false);
      }
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!museum?.id) return;
    const t = setInterval(() => {
      loadOverview().catch(() => {});
    }, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [museum?.id]);

  const resetForm = () => {
    setEditingSlotId(null);
    setTourTitle("");
    setPriceWhole("5");
    setPriceCents("99");
    setTourDateText("");
    setCapacity("20");
    setStartHh("10");
    setStartMm("00");
    setStartAmPm("AM");
    setEndHh("12");
    setEndMm("00");
    setEndAmPm("PM");
    setSelectedColorIndex(0);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (slot) => {
    if (slot.status === "ongoing") return;

    setEditingSlotId(slot.time_slot_id);
    setTourTitle(slot.tour_title || "");

    const [whole, cents] = String(Number(slot.price || 0).toFixed(2)).split(".");
    setPriceWhole(whole || "0");
    setPriceCents(cents || "00");
    setTourDateText(toDdMmYyyy(String(slot.tour_date).slice(0, 10)));
    setCapacity(String(slot.capacity || ""));

    const start = formatTime12(slot.start_time);
    const end = formatTime12(slot.end_time);
    setStartHh(start.hh);
    setStartMm(start.mm);
    setStartAmPm(start.ampm);
    setEndHh(end.hh);
    setEndMm(end.mm);
    setEndAmPm(end.ampm);

    const slotColor = Number(slot.slot_color);
    setSelectedColorIndex(Number.isInteger(slotColor) && slotColor >= 0 && slotColor <= 11 ? slotColor : 0);
    setShowForm(true);
  };

  const handleDatePickerChange = (e) => {
    const iso = e.target.value;
    if (!iso) return;
    setTourDateText(toDdMmYyyy(iso));
  };

  const validateOpenDay = (isoDate) => {
    const open = parseOpenDays(museum?.open_days);
    if (open.size === 0) return true;
    const day = new Date(isoDate).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    return open.has(day);
  };

  const handleConfirm = async () => {
    setErrorMessage("");

    const isoDate = toIsoDate(tourDateText);
    const start24 = to24Hour(startHh, startMm, startAmPm);
    const end24 = to24Hour(endHh, endMm, endAmPm);

    if (!tourTitle.trim()) {
      setErrorMessage("Tour title is required");
      return;
    }
    if (!isoDate) {
      setErrorMessage("Tour date must be DD/MM/YYYY");
      return;
    }
    if (!validateOpenDay(isoDate)) {
      setErrorMessage(`Chosen day is outside museum open days: ${museum?.open_days || "not set"}`);
      return;
    }
    if (!start24 || !end24) {
      setErrorMessage("Please provide valid start and end times");
      return;
    }
    if (start24 >= end24) {
      setErrorMessage("End time must be after start time");
      return;
    }
    if (!capacity || Number(capacity) <= 0) {
      setErrorMessage("Capacity must be positive");
      return;
    }

    const price = Number(`${priceWhole || "0"}.${(priceCents || "0").padStart(2, "0")}`);
    if (!Number.isFinite(price)) {
      setErrorMessage("Invalid price");
      return;
    }

    const payload = {
      tour_title: tourTitle.trim(),
      price,
      tour_date: isoDate,
      capacity: Number(capacity),
      start_time: start24,
      end_time: end24,
      slot_color: selectedColorIndex,
    };

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const endpoint = editingSlotId
        ? `${API_URL}/tour/time-slot/${editingSlotId}`
        : `${API_URL}/tour/time-slot`;
      const method = editingSlotId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Could not save tour");
        return;
      }

      setShowForm(false);
      resetForm();
      await loadOverview();
    } catch (error) {
      setErrorMessage("Failed to save tour");
    } finally {
      setSubmitting(false);
    }
  };

  const showRevenue = async (timeSlotId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/tour/revenue/${timeSlotId}`, {
        headers: { token },
      });
      const data = await response.json();
      if (!response.ok) return;

      setRevenueBySlot((prev) => ({
        ...prev,
        [timeSlotId]: `$${Number(data.revenue || 0).toFixed(2)}`,
      }));

      setTimeout(() => {
        setRevenueBySlot((prev) => {
          const next = { ...prev };
          delete next[timeSlotId];
          return next;
        });
      }, 8000);
    } catch (error) {
      // keep silent in UI
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative pb-20">
      <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>

      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            <li>
              <Link to="/manager-dashboard" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Museum
              </Link>
            </li>
            <li>
              <Link to="/tours" className="text-accent-yellow bg-white/10 rounded-lg">
                Tours
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">{user?.username}</span>
          </div>
          <UserAvatarMenu user={user} logoutOnly={true} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
          <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Link
                to="/manager-dashboard"
                className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
              >
                <ArrowLeft size={16} />
                Back To Dashboard
              </Link>
              <div className="badge badge-warning text-dark-chocolate font-bold">Created Tours: {totalCreated}</div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Museum</p>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">{museum?.name || "Museum"}</h1>
              <p className="text-dark-chocolate/70 mt-2">Open Days: {museum?.open_days || "Not set"}</p>
            </div>

            <div className="bg-white border border-dark-chocolate/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Ongoing Tour</p>
              {ongoingTour ? (
                <div className="rounded-xl overflow-hidden border border-dark-chocolate/10">
                  <div
                    className="h-16"
                    style={{ background: TOUR_COLORS[Number(ongoingTour.slot_color) % TOUR_COLORS.length] || TOUR_COLORS[2] }}
                  ></div>
                  <div className="p-3">
                    <p className="font-playfair text-lg font-bold text-dark-chocolate">{ongoingTour.tour_title}</p>
                    <p className="text-xs text-dark-chocolate/70">{formatDisplayTimeRange(ongoingTour.start_time, ongoingTour.end_time)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-dark-chocolate/70">No ongoing tour at the moment</p>
              )}
            </div>

            <div className="flex items-center pt-1">
              <button
                onClick={openCreateForm}
                className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
              >
                <Plus size={18} />
                Create Tour
              </button>
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

        {errorMessage && (
          <div className="alert alert-error mb-6">
            <span>{errorMessage}</span>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair text-4xl font-bold">Active Tours</h3>
            <span className="text-sm text-dark-chocolate/60">Expired tours are hidden automatically after end time.</span>
          </div>

          {activeTours.length === 0 ? (
            <div className="bg-white border border-dark-chocolate/10 rounded-2xl p-10 text-center text-dark-chocolate/70">
              No active tours yet. Create your first time-slot.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeTours.map((slot, idx) => {
                const slotColorIndex = Number(slot.slot_color);
                const color = Number.isInteger(slotColorIndex) && slotColorIndex >= 0 && slotColorIndex <= 11
                  ? TOUR_COLORS[slotColorIndex]
                  : TOUR_COLORS[idx % TOUR_COLORS.length];
                const editDisabled = slot.status === "ongoing";
                return (
                  <div key={slot.time_slot_id} className="bg-white border border-dark-chocolate/10 rounded-xl overflow-hidden shadow-md">
                    <div className="h-28 relative" style={{ background: color }}>
                      <div className="absolute top-3 right-3 flex flex-col items-end text-right gap-1">
                        <span className="badge badge-sm bg-white text-dark-chocolate border-none font-medium uppercase">
                          Status: {slot.status}
                        </span>
                        <span className="badge badge-sm bg-white text-dark-chocolate border-none font-medium uppercase">
                          Capacity: {slot.capacity_status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-playfair text-2xl font-bold">{slot.tour_title}</h4>
                      <p className="text-sm text-dark-chocolate/70">Date: {formatDisplayDate(slot.tour_date)}</p>
                      <p className="text-sm text-dark-chocolate/70">Time: {formatDisplayTimeRange(slot.start_time, slot.end_time)}</p>
                      <p className="text-sm text-dark-chocolate/70">Price: ${Number(slot.price || 0).toFixed(2)}</p>
                      <p className="text-sm text-dark-chocolate/70">
                        Booked: {slot.total_bookings}/{slot.capacity} ({slot.seats_remaining} seats remaining)
                      </p>

                      <div className="flex items-center justify-between pt-3">
                        <button
                          onClick={() => showRevenue(slot.time_slot_id)}
                          className="btn btn-sm bg-dark-chocolate text-white hover:bg-accent-orange border-none"
                        >
                          Show total revenue
                        </button>
                        <button
                          onClick={() => openEditForm(slot)}
                          disabled={editDisabled}
                          title={editDisabled ? "Ongoing tours cannot be modified" : "Edit tour"}
                          className={`btn btn-sm border-none ${editDisabled ? "bg-stone-300 text-stone-600 cursor-not-allowed" : "bg-stone-700 text-white hover:bg-stone-900"}`}
                        >
                          Edit
                        </button>
                      </div>

                      {revenueBySlot[slot.time_slot_id] && (
                        <p className="text-sm font-bold text-emerald-700">Revenue: {revenueBySlot[slot.time_slot_id]}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <dialog className="modal modal-open z-50 bg-black/60">
          <div className="modal-box max-w-2xl bg-white p-6 rounded-xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
            >
              <X size={16} />
            </button>
            <h3 className="font-playfair text-3xl font-bold mb-6 text-stone-800">
              {editingSlotId ? "Edit Tour Time-Slot" : "Create Tour Time-Slot"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">Tour Title</label>
                <input
                  type="text"
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-2">Tour Price</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-dark-chocolate">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceWhole}
                    onChange={(e) => setPriceWhole(e.target.value.replace(/\D/g, ""))}
                    className="input input-bordered w-24 border-2 border-black bg-white text-stone-800"
                  />
                  <span className="text-2xl font-black text-dark-chocolate">.</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceCents}
                    maxLength={2}
                    onChange={(e) => setPriceCents(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="input input-bordered w-20 border-2 border-black bg-white text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase block mb-2">Tour Date</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={tourDateText}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d/]/g, "").slice(0, 10);
                      setTourDateText(raw);
                    }}
                    className="input input-bordered flex-1 border-2 border-black bg-white text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => hiddenDateRef.current?.showPicker?.() || hiddenDateRef.current?.click()}
                    className="btn bg-dark-chocolate text-white border-none hover:bg-accent-orange"
                  >
                    <Calendar size={18} />
                  </button>
                  <input
                    ref={hiddenDateRef}
                    type="date"
                    className="hidden"
                    onChange={handleDatePickerChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">Capacity</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
                  className="input input-bordered w-full border-2 border-black bg-white text-stone-800"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Select Start time</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={startHh}
                    onChange={(e) => setStartHh(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="input input-bordered w-16 border-2 border-black bg-white text-stone-800"
                  />
                  <span className="font-black text-lg">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={startMm}
                    onChange={(e) => setStartMm(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="input input-bordered w-16 border-2 border-black bg-white text-stone-800"
                  />
                  <select
                    value={startAmPm}
                    onChange={(e) => setStartAmPm(e.target.value)}
                    className="select select-bordered border-2 border-black bg-white text-stone-800"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Select End time</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={endHh}
                    onChange={(e) => setEndHh(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="input input-bordered w-16 border-2 border-black bg-white text-stone-800"
                  />
                  <span className="font-black text-lg">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={endMm}
                    onChange={(e) => setEndMm(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="input input-bordered w-16 border-2 border-black bg-white text-stone-800"
                  />
                  <select
                    value={endAmPm}
                    onChange={(e) => setEndAmPm(e.target.value)}
                    className="select select-bordered border-2 border-black bg-white text-stone-800"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Select Tour Color</p>
                <div className="flex flex-wrap gap-2">
                  {TOUR_COLORS.map((color, idx) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`w-7 h-7 rounded-full border-2 ${selectedColorIndex === idx ? "border-dark-chocolate scale-110" : "border-transparent"}`}
                      style={{ background: color }}
                    ></button>
                  ))}
                </div>
              </div>

              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="btn bg-dark-chocolate text-white hover:bg-accent-orange w-full mt-4"
              >
                {submitting ? "Saving..." : "Confirm Tour Creation"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
