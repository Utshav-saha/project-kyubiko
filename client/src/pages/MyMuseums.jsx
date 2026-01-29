import React, { useState } from 'react';
import { Plus, ArrowUpRight, MapPin, Search } from 'lucide-react';

const MyMuseums = () => {
  const [museums, setMuseums] = useState([
    
    {
      id: 1,
      name: "Ancient Egypt Unveiled",
      description: "Treasures from the land of pharaohs and the Nile.",
      artifactCount: 8,
      coverImage: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
      createdAt: "2025-01-10",
      location: "Cairo"
    }
    
  ]);

  const totalMuseums = museums.length;
  const totalArtifacts = museums.reduce((sum, museum) => sum + museum.artifactCount, 0);

  return (
    <div className="min-h-screen bg-old-paper font-dmsans selection:bg-accent-orange/30 selection:text-dark-chocolate relative">
      
      <div className="fixed inset-0 bg-noise opacity-40 pointer-events-none mix-blend-multiply z-0"></div>

      {/* --- Hero Section --- */}
      <div className="relative bg-dark-chocolate text-old-paper pb-32 overflow-hidden z-10">
        
        {/* Navbar */}
        <div className="navbar shadow-sm bg-transparent z-20 border-b border-white/5">
            <div className="navbar-start">
              <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                </div>
                <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-white">
                  <li><a>Home</a></li>
                  <li><a>Explore</a></li>
                  <li><a>Archive</a></li>
                </ul>
              </div>
              <a className="btn btn-ghost text-xl text-white ml-2">Kyubiko</a>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 text-white/80 font-medium">
                <li><a className="hover:text-white hover:bg-white/10">Home</a></li>
                <li><a className="hover:text-white hover:bg-white/10">Explore</a></li>
                <li><a className="hover:text-white hover:bg-white/10">Archive</a></li>
              </ul>
            </div>
            <div className="navbar-end">
              <a className="btn btn-ghost border border-white/20 text-white mr-5 hover:bg-white/10 transition-colors">
                Login / Sign up
              </a>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative">
            <div className="absolute top-0 right-0 w-125 h-125 bg-accent-orange/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-12">
                <div className="max-w-3xl">
                    <h1 className="font-playfair text-6xl md:text-8xl font-medium tracking-tight leading-[0.9] mb-8">
                        My <br/> 
                        <span className="italic opacity-80 text-accent-yellow">Collection</span>
                    </h1>
                    <p className="text-xl font-light text-white/60 max-w-lg border-l border-accent-orange/50 pl-6">
                        Curate your personal exhibitions. A digital sanctuary for the artifacts that define your story.
                    </p>
                </div>
                
                <div className="w-full md:w-auto flex flex-col gap-6">
                    
            
                    <div className="flex gap-4">
                        <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 min-w-35">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Museums</p>
                            <p className="font-playfair text-4xl font-bold text-white">{totalMuseums}</p>
                        </div>
                        <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 min-w-35">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Artifacts</p>
                            <p className="font-playfair text-4xl font-bold text-accent-yellow">{totalArtifacts}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Search archives..." 
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-accent-orange/50 focus:bg-white/10 transition-all placeholder:text-white/30"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-accent-orange text-dark-chocolate hover:bg-white transition-colors">
                            <Search size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
      </div>

      {/* --- Grid Section --- */}
      <div className="max-w-7xl mx-auto px-6 mt-15 relative z-20 pb-24">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Create New */}
          <button 
            onClick={() => console.log("Create")}
            className="group relative h-full min-h-105 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-dark-chocolate/20 hover:border-accent-orange hover:bg-white/40 transition-all duration-300 gap-6 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-accent-orange to-accent-yellow flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
              <Plus className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-playfair text-3xl font-bold text-dark-chocolate mb-2">Create New</h3>
              <p className="text-dark-chocolate/60 text-sm max-w-50 leading-relaxed">Start a new exhibition and share your discoveries.</p>
            </div>
          </button>

          {/* 2. Museum Cards */}
          {museums.map((museum) => (
            <div 
              key={museum.id}
              className="group h-112.5 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col border border-dark-chocolate/10"
            >
              <div className="relative h-[65%] overflow-hidden">
                <div className="absolute inset-0 bg-dark-chocolate/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img 
                  src={museum.coverImage} 
                  alt={museum.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-dark-chocolate/5">
                    <MapPin size={12} className="text-accent-orange" />
                    <span className="text-xs font-bold tracking-widest uppercase text-dark-chocolate">{museum.location}</span>
                </div>
              </div>

              <div className="flex-1 p-6 relative bg-white">
                <div className="absolute -top-6 right-6 w-12 h-12 bg-accent-orange text-white rounded-full flex items-center justify-center shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                    <ArrowUpRight size={24} />
                </div>

                <div className="flex flex-col h-full justify-between">
                    <div>
                        <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2 leading-none group-hover:text-accent-orange transition-colors">
                            {museum.name}
                        </h3>
                        <p className="text-dark-chocolate/60 text-sm leading-relaxed line-clamp-2">
                            {museum.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-dark-chocolate/10 pt-4 mt-2">
                        <span className="text-xs font-mono text-dark-chocolate/50 uppercase">
                            ID: 0{museum.id}
                        </span>
                        <span className="text-xs font-bold text-dark-chocolate">
                            {museum.artifactCount} ARTIFACTS
                        </span>
                    </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default MyMuseums;