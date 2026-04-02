import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";

export default function Result() {
  const { id } = useParams();
  const location = useLocation();

  const score = location.state?.score ?? 0;
  const total = location.state?.total ?? 10;
  const museumName = location.state?.museumName ?? "Museum";
  const elapsedSeconds = location.state?.elapsedSeconds ?? 0;

  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate relative">
      <div className="fixed inset-0 bg-noise opacity-35 pointer-events-none mix-blend-multiply z-0"></div>

      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white border border-dark-chocolate/10 rounded-2xl shadow-xl p-8 md:p-10 text-center">
          <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Trivia Result</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2">{museumName}</h1>
          <p className="text-dark-chocolate/70 mb-8">You finished in {minutes}m {seconds}s</p>

          <div className="max-w-xs mx-auto rounded-xl p-5 bg-gradient-to-r from-accent-yellow/90 to-accent-orange/85 border border-accent-orange/50 shadow-lg mb-8">
            <p className="text-xs text-dark-chocolate/80 uppercase tracking-[0.2em] font-black">Points</p>
            <p className="font-playfair text-5xl font-black text-dark-chocolate mt-1">{score}</p>
            <p className="text-sm text-dark-chocolate/75 mt-1">out of {total}</p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to={`/leaderboard/${id}`}
              className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
            >
              Go To Leaderboard
            </Link>
            <Link
              to={`/trivia/${id}`}
              className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
            >
              Retry Trivia
            </Link>
            <Link
              to={`/go-to-museum/${id}`}
              className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
            >
              Back to Museum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
