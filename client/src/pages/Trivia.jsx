import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";

const FALLBACK_MUSEUM_IMAGE = "https://images.metmuseum.org/CRDImages/ad/original/DP346475.jpg";

const resolveMuseumImageUrl = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return FALLBACK_MUSEUM_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("www.")) return `https://${value}`;

  if (value.startsWith("/")) {
    try {
      const origin = new URL(API_URL).origin;
      return `${origin}${value}`;
    } catch {
      return FALLBACK_MUSEUM_IMAGE;
    }
  }

  return FALLBACK_MUSEUM_IMAGE;
};

export default function Trivia() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const quizIdFromState = location.state?.quizId || null;
  const [museumName, setMuseumName] = useState("Museum");
  const [museumImage, setMuseumImage] = useState(FALLBACK_MUSEUM_IMAGE);
  const [quizTitle, setQuizTitle] = useState("Museum Quiz");
  const [quizId, setQuizId] = useState(null);

  const [previousAttempts, setPreviousAttempts] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchTriviaMeta = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const endpoint = quizIdFromState
          ? `${API_URL}/quiz/${quizIdFromState}/meta`
          : `${API_URL}/quiz/museum/${id}/meta`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers: { token },
        });
        if (res.ok) {
          const data = await res.json();
          setQuizId(Number(data.quiz_id) || null);
          setQuizTitle(data.quiz_title || "Museum Quiz");
          setMuseumName(data.museum_name || "Museum");
          setMuseumImage(resolveMuseumImageUrl(data.museum_image));
          setPreviousAttempts(Number(data.total_attempts ?? data.previous_attempts ?? 0));
          setTotalQuestions(Number(data.total_points ?? 0));
        } else {
          const err = await res.json().catch(() => ({}));
          console.error(err.error || "Failed to load trivia metadata");

          if (token) {
            const museumRes = await fetch(`${API_URL}/museum/info/${id}`, {
              method: "GET",
              headers: { token },
            });

            if (museumRes.ok) {
              const museumData = await museumRes.json();
              setMuseumName(museumData.name || "Museum");
              setMuseumImage(resolveMuseumImageUrl(museumData.image));
            }
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchTriviaMeta();
  }, [id, navigate, quizIdFromState]);

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={museumImage}
          alt={museumName}
          className="w-full h-full object-cover blur-xl scale-110"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_MUSEUM_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-dark-chocolate/35"></div>
      </div>
      <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>

      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
            Previous Attempts: {previousAttempts}
          </p>
          <Link
            to={`/go-to-museum/${id}`}
            className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
          >
            Back to Museum
          </Link>
        </div>

        <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">{quizTitle}</p>
          <h1 className="font-imperial text-5xl md:text-6xl text-accent-orange mb-3">Are you ready?</h1>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-dark-chocolate mb-8">{museumName}</h2>

          <div className="max-w-md mx-auto rounded-xl p-5 mb-8 bg-linear-to-r from-accent-yellow/90 to-accent-orange/85 border border-accent-orange/50 shadow-lg">
            <p className="text-xs text-dark-chocolate/80 uppercase tracking-[0.2em] font-dmsans font-black">Total Questions</p>
            <p className="font-playfair text-5xl font-black text-dark-chocolate mt-1">{totalQuestions}</p>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate(`/trivia/${id}/question`, { state: { quizId } })}
              className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none px-8"
            >
              Start Trivia!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
