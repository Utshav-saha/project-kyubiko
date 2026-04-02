import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { ArrowLeft, Lock, ShieldCheck, CreditCard } from "lucide-react";

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

const detectCardType = (cardNumberText) => {
	const digits = String(cardNumberText || "").replace(/\D/g, "");
	if (/^4/.test(digits)) return "visa";
	if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
	if (/^3[47]/.test(digits)) return "amex";
	if (/^6(?:011|5)/.test(digits)) return "discover";
	return "visa";
};

const formatCardInput = (value) => {
	const digits = String(value || "").replace(/\D/g, "").slice(0, 19);
	return digits.replace(/(.{4})/g, "$1 ").trim();
};

const cardLabel = {
	visa: "VISA",
	mastercard: "Mastercard",
	amex: "AmEx",
	discover: "Discover",
};

export default function Payment() {
	const navigate = useNavigate();
	const { museumId, timeSlotId } = useParams();

	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [slot, setSlot] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const [cardHolder, setCardHolder] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvc, setCvc] = useState("");
	const [email, setEmail] = useState("");

	const currentCardType = useMemo(() => detectCardType(cardNumber), [cardNumber]);

	useEffect(() => {
		const fetchSlot = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					localStorage.removeItem("token");
					localStorage.removeItem("role");
					navigate("/login");
					return;
				}

				const response = await fetch(`${API_URL}/tour/slot/${timeSlotId}`, {
					headers: { token },
				});

				const data = await response.json().catch(() => ({}));
				if (!response.ok) {
					setErrorMessage(data.error || "Could not load payment details");
					return;
				}

				if (String(data?.museum?.id) !== String(museumId)) {
					setErrorMessage("This slot does not belong to the selected museum");
					return;
				}

				setSlot(data);
			} catch (error) {
				setErrorMessage("Failed to load payment details");
			} finally {
				setLoading(false);
			}
		};

		fetchSlot();
	}, [museumId, timeSlotId, navigate]);

	const handlePay = async () => {
		setErrorMessage("");

		if (!slot?.can_book) {
			setErrorMessage("This tour cannot be booked anymore");
			return;
		}
		if (!cardHolder.trim()) {
			setErrorMessage("Card holder name is required");
			return;
		}

		const digits = cardNumber.replace(/\D/g, "");
		if (digits.length < 13) {
			setErrorMessage("Please enter a valid card number");
			return;
		}
		if (!/^\d{2}\/\d{2}$/.test(expiry)) {
			setErrorMessage("Expiry should be in MM/YY format");
			return;
		}
		if (!/^\d{3,4}$/.test(cvc)) {
			setErrorMessage("Please enter a valid CVC");
			return;
		}

		try {
			setSubmitting(true);
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_URL}/tour/book`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token,
				},
				body: JSON.stringify({ time_slot_id: Number(timeSlotId) }),
			});

			const data = await response.json().catch(() => ({}));
			if (!response.ok) {
				setErrorMessage(data.error || "Payment failed");
				return;
			}

			navigate(`/tour/${museumId}/payment-success/${data.booking.booking_id}`, {
				state: { booking: data.booking },
			});
		} catch (error) {
			setErrorMessage("Payment failed, please try again");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
				<span className="loading loading-spinner loading-lg text-accent-orange"></span>
			</div>
		);
	}

	const amount = Number(slot?.price || 0).toFixed(2);

	return (
		<div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate">
			<div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
				<div className="mb-5">
					<Link
						to={`/tour/${museumId}`}
						className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
					>
						<ArrowLeft size={16} />
						Back
					</Link>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] rounded-2xl overflow-hidden shadow-xl border border-dark-chocolate/15 bg-white min-h-[620px]">
					<aside className="bg-dark-chocolate text-white p-8 md:p-10 relative overflow-hidden">
						<div className="absolute inset-0 opacity-25 bg-noise mix-blend-multiply"></div>
						<div className="relative z-10 space-y-8">
							<div>
								<p className="text-xs uppercase tracking-widest text-accent-yellow font-bold mb-2">Powered by KyubiPay</p>
								<h2 className="font-playfair text-4xl font-bold">Secure Checkout</h2>
								<p className="text-white/70 mt-3 text-sm">
									Your payment details are protected with transport-layer encryption and processed through secure checkout standards.
								</p>
							</div>

							<div className="space-y-3 text-sm">
								<div className="flex items-center gap-2"><Lock size={16} className="text-accent-yellow" /> 256-bit SSL Encryption</div>
								<div className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent-yellow" /> PCI-DSS Aligned Checkout</div>
								<div className="flex items-center gap-2"><CreditCard size={16} className="text-accent-yellow" /> Supported: VISA, Mastercard, AmEx, Discover</div>
							</div>

							<div className="border border-white/15 rounded-xl p-4 bg-white/5">
								<p className="text-xs uppercase tracking-wider text-white/65">Tour Summary</p>
								<p className="font-playfair text-2xl mt-1">{slot?.tour_title || "Tour"}</p>
								<p className="text-sm text-white/75 mt-2">{slot?.museum?.name || "Museum"}</p>
								<p className="text-sm text-white/75">{formatDate(slot?.tour_date)} | {toTwelve(slot?.start_time)} - {toTwelve(slot?.end_time)}</p>
								<p className="text-2xl font-bold text-accent-yellow mt-3">${amount}</p>
							</div>
						</div>
					</aside>

					<main className="bg-white p-8 md:p-10">
						<h1 className="font-playfair text-4xl font-bold mb-2">Payment Details</h1>
						<p className="text-sm text-dark-chocolate/60 mb-7">Complete your booking using the details below.</p>

						{!slot?.can_book && (
							<div className="alert alert-warning mb-5">
								<span>This slot is no longer available for booking.</span>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div className="md:col-span-2">
								<label className="text-xs font-bold text-stone-500 uppercase">Card Holder</label>
								<input
									type="text"
									value={cardHolder}
									onChange={(e) => setCardHolder(e.target.value)}
									className="input input-bordered w-full border border-stone-300 bg-white text-stone-800"
									placeholder="Name on card"
								/>
							</div>

							<div className="md:col-span-2">
								<div className="flex items-center justify-between">
									<label className="text-xs font-bold text-stone-500 uppercase">Card Number</label>
									<span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 font-semibold">
										{cardLabel[currentCardType]}
									</span>
								</div>
								<input
									type="text"
									value={cardNumber}
									onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
									className="input input-bordered w-full border border-stone-300 bg-white text-stone-800"
									placeholder="1234 5678 9012 3456"
								/>
							</div>

							<div>
								<label className="text-xs font-bold text-stone-500 uppercase">Expiry</label>
								<input
									type="text"
									value={expiry}
									onChange={(e) => {
										const clean = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
										const next = clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
										setExpiry(next);
									}}
									className="input input-bordered w-full border border-stone-300 bg-white text-stone-800"
									placeholder="MM/YY"
								/>
							</div>

							<div>
								<label className="text-xs font-bold text-stone-500 uppercase">CVC</label>
								<input
									type="text"
									value={cvc}
									onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
									className="input input-bordered w-full border border-stone-300 bg-white text-stone-800"
									placeholder="123"
								/>
							</div>

							<div className="md:col-span-2">
								<label className="text-xs font-bold text-stone-500 uppercase">Email (for receipt)</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="input input-bordered w-full border border-stone-300 bg-white text-stone-800"
									placeholder="you@example.com"
								/>
							</div>
						</div>

						{errorMessage && <p className="text-sm text-red-600 mb-4">{errorMessage}</p>}

						<button
							onClick={handlePay}
							disabled={submitting || !slot?.can_book}
							className={`btn w-full border-none ${submitting || !slot?.can_book ? "bg-stone-300 text-stone-600 cursor-not-allowed" : "bg-dark-chocolate text-white hover:bg-accent-orange"}`}
						>
							{submitting ? "Processing..." : `Pay $${amount}`}
						</button>
					</main>
				</div>
			</div>
		</div>
	);
}
