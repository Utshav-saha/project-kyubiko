import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function GoToMuseum() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-old-paper font-dmsans text-dark-chocolate">
      <div className="navbar shadow-sm z-20 bg-dark-chocolate relative">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">
            Kyubiko
          </Link>
        </div>
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            <li><Link to="/my-museums" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">My Museums</Link></li>
            <li><Link to="/explore" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Explore</Link></li>
            <li><Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Search</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full mt-18 px-4">
      <div className="w-full bg-white border border-dark-chocolate/10 rounded-2xl shadow-xl p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Placeholder</p>
        <h1 className="font-playfair text-4xl font-bold mb-4">Go To Museum</h1>
        <p className="text-dark-chocolate/70 mb-6">
          Museum page for ID <span className="font-bold text-dark-chocolate">{id}</span> is not created yet.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/explore"
            className="btn bg-dark-chocolate text-white hover:bg-accent-orange border-none"
          >
            Back to Explore
          </Link>
          <Link
            to="/my-museums"
            className="btn bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
          >
            Go to My Museums
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
