import React from "react";
import { Link, useParams } from "react-router-dom";

export default function Leaderboard() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate">
      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full mt-18 px-4">
        <div className="w-full bg-white border border-dark-chocolate/10 rounded-2xl shadow-xl p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Placeholder</p>
          <h1 className="font-playfair text-4xl font-bold mb-4">Museum Leaderboard</h1>
          <p className="text-dark-chocolate/70 mb-6">
            Leaderboard for museum ID <span className="font-bold text-dark-chocolate">{id}</span> is not created yet.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to={`/go-to-museum/${id}`}
              className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
            >
              Back to Museum
            </Link>
            <Link
              to="/explore"
              className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
            >
              Go to Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
