import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { toJpeg, toPng } from "html-to-image";

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

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);
  const exportTicketRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (booking) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/tour/booking/${bookingId}`, {
          headers: { token },
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setErrorMessage(data.error || "Could not load booking");
          return;
        }

        setBooking(data);
      } catch (error) {
        setErrorMessage("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [booking, bookingId, navigate]);

  const downloadTicket = async () => {
    if (!exportTicketRef.current || !booking) return;

    try {
      setDownloading(true);
      setErrorMessage("");

      let dataUrl;
      try {
        dataUrl = await toPng(exportTicketRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });
      } catch (pngError) {
        dataUrl = await toJpeg(exportTicketRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.95,
          backgroundColor: "#ffffff",
        });
      }

      const extension = dataUrl.startsWith("data:image/jpeg") ? "jpg" : "png";
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `kyubiko-ticket-${booking.ticket_code || bookingId}.${extension}`;
      link.click();
    } catch (error) {
      setErrorMessage("Could not download ticket. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  const exportDate = formatDate(booking?.tour_date);
  const exportTime = `${toTwelve(booking?.start_time)} - ${toTwelve(booking?.end_time)}`;
  const exportAmount = `$${Number(booking?.price || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate">
      {booking && (
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            pointerEvents: "none",
            opacity: 0,
            zIndex: -1,
          }}
        >
          <div
            ref={exportTicketRef}
            style={{
              width: "900px",
              borderRadius: "20px",
              border: "1px solid #d6c7b8",
              background: "#ffffff",
              boxSizing: "border-box",
              overflow: "hidden",
              color: "#2f1f15",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <div
              style={{
                background: "#2f1f15",
                color: "#ffffff",
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", letterSpacing: "0.2em", color: "#f0b54a", fontWeight: 700 }}>KYUBIPAY TICKET</div>
                <div style={{ fontSize: "40px", fontWeight: 700, marginTop: "4px", lineHeight: 1.1 }}>Payment Successful</div>
                <div style={{ opacity: 0.8, marginTop: "6px", fontSize: "14px" }}>Enjoy your tour!</div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.08)",
                  fontSize: "12px",
                }}
              >
                <div style={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>Issued</div>
                <div style={{ fontWeight: 600 }}>{formatDate(booking?.booking_date || new Date())}</div>
              </div>
            </div>

            <div style={{ padding: "24px", background: "#fffdf9" }}>
              <div
                style={{
                  border: "1px dashed #9e8a79",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "#ffffff",
                }}
              >
                <div style={{ fontSize: "11px", letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase", opacity: 0.7 }}>Tour Ticket</div>
                <div style={{ fontSize: "34px", fontWeight: 700, marginTop: "8px", lineHeight: 1.15 }}>{booking?.tour_title}</div>
                <div style={{ marginTop: "6px", fontSize: "15px", opacity: 0.75 }}>{booking?.museum?.name || "Museum"}</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "18px" }}>
                  <div style={{ border: "1px solid #e4d8ca", borderRadius: "10px", padding: "10px", background: "#ffffff" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.65, fontWeight: 700 }}>Date</div>
                    <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: 600 }}>{exportDate}</div>
                  </div>
                  <div style={{ border: "1px solid #e4d8ca", borderRadius: "10px", padding: "10px", background: "#ffffff" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.65, fontWeight: 700 }}>Time</div>
                    <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: 600 }}>{exportTime}</div>
                  </div>
                  <div style={{ border: "1px solid #e4d8ca", borderRadius: "10px", padding: "10px", background: "#ffffff" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.65, fontWeight: 700 }}>Amount</div>
                    <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: 600 }}>{exportAmount}</div>
                  </div>
                </div>

                <div style={{ marginTop: "16px", border: "1px solid #f0b54a", borderRadius: "10px", textAlign: "center", padding: "10px", background: "#fffaf0" }}>
                  <div style={{ fontSize: "13px", fontWeight: 500 }}>Your Ticket code is:</div>
                  <div style={{ marginTop: "4px", fontSize: "24px", color: "#d97622", fontWeight: 700, letterSpacing: "0.04em", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {booking?.ticket_code}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {errorMessage && (
          <div className="alert alert-error mb-6">
            <span>{errorMessage}</span>
          </div>
        )}

        {!errorMessage && booking && (
          <>
            <div ref={ticketRef} className="bg-white rounded-2xl border border-dark-chocolate/15 shadow-xl overflow-hidden">
              <div className="bg-dark-chocolate text-white px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent-yellow font-bold">KyubiPay Ticket</p>
                  <h1 className="font-playfair text-4xl font-bold mt-1">Payment Successful</h1>
                  <p className="text-white/75 mt-1">Enjoy your tour!</p>
                </div>
                <div className="text-right text-xs text-white/80 bg-white/10 rounded-lg px-3 py-2 border border-white/15">
                  <p className="uppercase tracking-wider">Issued</p>
                  <p className="font-semibold">{formatDate(booking.booking_date || new Date())}</p>
                </div>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-6 items-stretch">
                <div className="border border-dashed border-dark-chocolate/25 rounded-xl p-5 bg-gradient-to-br from-old-paper/60 to-white">
                  <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold">Tour Ticket</p>
                  <h2 className="font-playfair text-3xl font-bold mt-2 leading-tight">{booking.tour_title}</h2>
                  <p className="text-sm text-dark-chocolate/70 mt-1">{booking.museum?.name || "Museum"}</p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white border border-dark-chocolate/10 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-dark-chocolate/60 font-bold">Date</p>
                      <p className="font-semibold mt-1">{formatDate(booking.tour_date)}</p>
                    </div>
                    <div className="bg-white border border-dark-chocolate/10 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-dark-chocolate/60 font-bold">Time</p>
                      <p className="font-semibold mt-1">{toTwelve(booking.start_time)} - {toTwelve(booking.end_time)}</p>
                    </div>
                    <div className="bg-white border border-dark-chocolate/10 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-dark-chocolate/60 font-bold">Amount</p>
                      <p className="font-semibold mt-1">${Number(booking.price || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-5 p-3 rounded-lg bg-white border border-accent-orange/30 text-center">
                    <p className="text-sm font-medium text-dark-chocolate">Your Ticket code is:</p>
                    <p className="font-mono text-xl font-bold text-accent-orange tracking-wide break-all">{booking.ticket_code}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-dark-chocolate text-white p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60 font-bold">Entry Notes</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/85">
                      <li>Please arrive 10 minutes early.</li>
                      <li>Keep this ticket code ready at check-in.</li>
                      <li>Tickets are valid only for this slot.</li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/15 mt-6">
                    <p className="text-xs uppercase tracking-wider text-white/60">We are excited to host you.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 mt-5">
              <button
                onClick={downloadTicket}
                disabled={downloading}
                className={`btn border-none ${downloading ? "bg-stone-300 text-stone-700" : "bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"}`}
              >
                {downloading ? "Preparing..." : "Download Ticket"}
              </button>
              <Link
                to="/profile"
                className="btn bg-accent-yellow text-dark-chocolate border-none hover:bg-accent-orange"
              >
                Back to Profile
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
