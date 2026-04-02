import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { ArrowLeft } from "lucide-react";
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

const formatDisplayDate = (isoDate) => {
	const d = new Date(isoDate);
	if (Number.isNaN(d.getTime())) return isoDate;
	return d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const formatHourLabel = (hour) => {
	const safeHour = Math.max(0, Math.min(23, Number(hour) || 0));
	const ampm = safeHour >= 12 ? "PM" : "AM";
	const h = safeHour % 12 === 0 ? 12 : safeHour % 12;
	return `${h} ${ampm}`;
};

const getPercent = (value, min, max) => ((value - min) / (max - min)) * 100;

const startHourOf = (timeText) => {
	const [hhRaw] = String(timeText || "00:00:00").split(":");
	return Number(hhRaw || 0);
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

export default function Tour() {
	const navigate = useNavigate();
	const { id } = useParams();

	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [user, setUser] = useState(null);
	const [museum, setMuseum] = useState(null);
	const [ongoingTour, setOngoingTour] = useState(null);
	const [allTours, setAllTours] = useState([]);

	const minHour = 0;
	const maxHour = 23;
	const [hourRange, setHourRange] = useState([minHour, maxHour]);

	const fetchPageData = async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			localStorage.removeItem("token");
			localStorage.removeItem("role");
			navigate("/login");
			return;
		}

		const [authRes, overviewRes] = await Promise.all([
			fetch(`${API_URL}/museum/authorize`, { headers: { token } }),
			fetch(`${API_URL}/tour/museum/${id}/overview`, { headers: { token } }),
		]);

		if (!authRes.ok) {
			localStorage.removeItem("token");
			localStorage.removeItem("role");
			navigate("/login");
			return;
		}

		const authData = await authRes.json();
		setUser(authData.user || null);

		const overviewData = await overviewRes.json().catch(() => ({}));
		if (!overviewRes.ok) {
			setErrorMessage(overviewData.error || "Could not load tours");
			setMuseum(null);
			setOngoingTour(null);
			setAllTours([]);
			return;
		}

		setMuseum(overviewData.museum || null);
		setOngoingTour(overviewData.ongoing_tour || null);
		setAllTours(overviewData.active_tours || []);
	};

	useEffect(() => {
		const run = async () => {
			try {
				await fetchPageData();
			} catch (error) {
				setErrorMessage("Failed to load tour page");
			} finally {
				setLoading(false);
			}
		};

		run();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, navigate]);

	const pickableTours = useMemo(() => {
		return allTours
			.filter((slot) => slot.status !== "ongoing")
			.filter((slot) => {
				const startHour = startHourOf(slot.start_time);
				return startHour >= hourRange[0] && startHour <= hourRange[1];
			});
	}, [allTours, hourRange]);

	const handleBookTour = (slot) => {
		navigate(`/tour/${id}/payment/${slot.time_slot_id}`);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
				<span className="loading loading-spinner loading-lg text-accent-orange"></span>
			</div>
		);
	}

	return (
		<>
			<style>{`
				.dual-range::-webkit-slider-thumb {
					pointer-events: auto;
					appearance: none;
					width: 16px;
					height: 16px;
					background: #f59e0b;
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
							<li><Link to="/my-museums" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">My Museums</Link></li>
							<li><Link to="/explore" className="text-accent-yellow bg-white/10 rounded-lg">Explore</Link></li>
							<li><Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Search</Link></li>
						</ul>
					</div>
					<div className="navbar-end gap-3 pr-5">
						<div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
							<span className="text-sm font-medium text-white">{user?.username}</span>
						</div>
						<UserAvatarMenu user={user} />
					</div>
				</div>

				<div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
					<section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
						<div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-md p-7 flex flex-col gap-5">
							<div className="flex items-center justify-between">
								<Link
									to={`/go-to-museum/${id}`}
									className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
								>
									<ArrowLeft size={16} />
									Back
								</Link>
							</div>

							<div>
								<p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Museum</p>
								<h1 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate">{museum?.name || "Museum"}</h1>
								<p className="text-dark-chocolate/70 mt-2 line-clamp-3">{museum?.description || "No description available."}</p>
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
											<p className="text-xs text-dark-chocolate/70">
												{formatDisplayDate(ongoingTour.tour_date)} | {toTwelve(ongoingTour.start_time)} - {toTwelve(ongoingTour.end_time)}
											</p>
											<p className="text-xs text-dark-chocolate/70 mt-1">
												Booked: {ongoingTour.total_bookings}/{ongoingTour.capacity}
											</p>
										</div>
									</div>
								) : (
									<p className="text-sm text-dark-chocolate/70">No ongoing tour at the moment.</p>
								)}
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
						<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
							<div>
								<h3 className="font-playfair text-4xl font-bold">Pick a Tour</h3>
								<span className="text-sm text-dark-chocolate/60">Only upcoming tours can be booked.</span>
							</div>

							<div className="bg-white border border-dark-chocolate/10 rounded-xl px-4 pt-3 pb-4 min-w-[280px]">
								<p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold mb-2">Filter by Start Time</p>
								<div className="relative pt-4 pb-2">
									<div className="absolute top-6 left-0 w-full h-1.5 bg-stone-200 rounded-full"></div>
									<div
										className="absolute top-6 h-1.5 bg-amber-400 rounded-full z-10"
										style={{
											left: `${getPercent(hourRange[0], minHour, maxHour)}%`,
											right: `${100 - getPercent(hourRange[1], minHour, maxHour)}%`,
										}}
									></div>
									<input
										type="range"
										min={minHour}
										max={maxHour}
										value={hourRange[0]}
										onChange={(e) =>
											setHourRange([
												Math.min(Number(e.target.value), hourRange[1] - 1),
												hourRange[1],
											])
										}
										className="dual-range absolute top-5 w-full appearance-none bg-transparent pointer-events-none z-20"
									/>
									<input
										type="range"
										min={minHour}
										max={maxHour}
										value={hourRange[1]}
										onChange={(e) =>
											setHourRange([
												hourRange[0],
												Math.max(Number(e.target.value), hourRange[0] + 1),
											])
										}
										className="dual-range absolute top-5 w-full appearance-none bg-transparent pointer-events-none z-30"
									/>
								</div>
								<div className="text-sm font-bold text-dark-chocolate bg-stone-100 px-2 py-1.5 rounded-md border border-stone-200 text-center mt-2">
									{formatHourLabel(hourRange[0])} - {formatHourLabel(hourRange[1])}
								</div>
							</div>
						</div>

						{pickableTours.length === 0 ? (
							<div className="bg-white border border-dark-chocolate/10 rounded-2xl p-10 text-center text-dark-chocolate/70">
								No available tours for this time range.
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
								{pickableTours.map((slot, idx) => {
									const slotColorIndex = Number(slot.slot_color);
									const color = Number.isInteger(slotColorIndex) && slotColorIndex >= 0 && slotColorIndex <= 11
										? TOUR_COLORS[slotColorIndex]
										: TOUR_COLORS[idx % TOUR_COLORS.length];
									const isFull = slot.capacity_status === "fully booked" || Number(slot.seats_remaining) <= 0;
									const disableBook = slot.status === "ongoing" || isFull;

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
												<p className="text-sm text-dark-chocolate/70">Time: {toTwelve(slot.start_time)} - {toTwelve(slot.end_time)}</p>
												<p className="text-base font-bold text-accent-orange">Price: ${Number(slot.price || 0).toFixed(2)}</p>
												<p className="text-sm text-dark-chocolate/70">
													Booked: {slot.total_bookings}/{slot.capacity} ({slot.seats_remaining} seats remaining)
												</p>

												<div className="pt-3">
													<button
														onClick={() => handleBookTour(slot)}
														disabled={disableBook}
														className={`btn btn-sm border-none w-full ${disableBook ? "bg-stone-300 text-stone-600 cursor-not-allowed" : "bg-dark-chocolate text-white hover:bg-accent-orange"}`}
													>
														Book Tour
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</section>
				</div>
			</div>
		</>
	);
}
