import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Search, Filter, ChevronDown, X, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from '../components/common/Card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

gsap.registerPlugin(ScrollTrigger);

// Mock museum locations with coordinates
const museumLocations = [
  { id: 1, name: "The Louvre", lat: 48.8606, lng: 2.3376, country: "France", category: "Art" },
  { id: 2, name: "British Museum", lat: 51.5194, lng: -0.1270, country: "United Kingdom", category: "History" },
  { id: 3, name: "Egyptian Museum", lat: 30.0478, lng: 31.2336, country: "Egypt", category: "History" },
  { id: 4, name: "Metropolitan Museum", lat: 40.7794, lng: -73.9632, country: "United States", category: "Art" },
  { id: 5, name: "National Museum of India", lat: 28.6117, lng: 77.2195, country: "India", category: "Cultural" },
  { id: 6, name: "Acropolis Museum", lat: 37.9685, lng: 23.7292, country: "Greece", category: "History" },
  { id: 7, name: "Vatican Museums", lat: 41.9065, lng: 12.4536, country: "Italy", category: "Art" },
  { id: 8, name: "National Museum of China", lat: 39.9042, lng: 116.3912, country: "China", category: "Cultural" },
];

// Filter options
const museumCategories = ["All", "Art", "History", "Science", "Cultural"];
const countries = ["All", "France", "United Kingdom", "Egypt", "United States", "India", "Greece", "Italy", "China", "Japan", "Germany"];
const artifactCategories = ["All", "Sculpture", "Painting", "Coin", "Textile", "Weapon", "Pottery", "Jewelry", "Manuscript"];
const artifactRegions = ["All", "Europe", "Middle East", "Asia", "Africa", "Americas", "Oceania"];

// Component to handle map center changes
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 5, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// MOVED OUTSIDE: FilterPanel is now a standalone component receiving props
const FilterPanel = ({ 
  isMobile = false, 
  resetFilters, 
  museumCategory, setMuseumCategory,
  country, setCountry,
  artifactCategory, setArtifactCategory,
  artifactRegion, setArtifactRegion,
  dateRange, setDateRange,
  scrollToResults,
  setIsMobileFilterOpen
}) => (
  <div className={`${isMobile ? 'p-4' : 'p-5'}`}>
    <div className="flex justify-between items-center mb-5">
      <h3 className="font-playfair text-lg font-bold text-dark-chocolate flex items-center gap-2">
        <Filter size={18} className="text-accent-orange" />
        Filters
      </h3>
      <button 
        onClick={resetFilters}
        className="text-xs text-accent-orange hover:underline font-medium transition-colors"
      >
        Reset All
      </button>
    </div>

    {/* Museum Filters */}
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold mb-3">Museum Filters</p>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-dark-chocolate mb-1 block">Category</label>
          <select 
            value={museumCategory}
            onChange={(e) => setMuseumCategory(e.target.value)}
            className="select select-sm w-full bg-white border border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
          >
            {museumCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-dark-chocolate mb-1 block">Country/State</label>
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="select select-sm w-full bg-white border border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-dark-chocolate/10 my-4"></div>

    {/* Artifact Filters */}
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold mb-3">Artifact Filters</p>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-dark-chocolate mb-1 block">Category</label>
          <select 
            value={artifactCategory}
            onChange={(e) => setArtifactCategory(e.target.value)}
            className="select select-sm w-full bg-white border border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
          >
            {artifactCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-dark-chocolate mb-1 block">Region</label>
          <select 
            value={artifactRegion}
            onChange={(e) => setArtifactRegion(e.target.value)}
            className="select select-sm w-full bg-white border border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
          >
            {artifactRegions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Date Range Slider */}
        <div>
          <label className="text-sm font-medium text-dark-chocolate mb-2 block">
            Date Period: {dateRange.start < 0 ? `${Math.abs(dateRange.start)} BC` : `${dateRange.start} AD`} - {dateRange.end} AD
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="-3000"
              max="2024"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: parseInt(e.target.value) }))}
              className="range range-xs range-warning w-full"
            />
            <input
              type="range"
              min="-3000"
              max="2024"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: parseInt(e.target.value) }))}
              className="range range-xs range-warning w-full"
            />
          </div>
        </div>
      </div>
    </div>

    {/* View Results Button */}
    <button 
      onClick={() => {
        scrollToResults();
        if (isMobile && setIsMobileFilterOpen) setIsMobileFilterOpen(false);
      }}
      className="btn w-full bg-accent-yellow hover:bg-accent-orange text-dark-chocolate font-bold border-none shadow-md hover:shadow-lg transition-all duration-300"
    >
      View Results
      <ChevronDown size={18} />
    </button>
  </div>
);

export default function Explore() {
  const [artifacts, setArtifacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([30, 20]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // Filter states
  const [museumCategory, setMuseumCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [artifactCategory, setArtifactCategory] = useState('All');
  const [artifactRegion, setArtifactRegion] = useState('All');
  const [dateRange, setDateRange] = useState({ start: -3000, end: 2024 });
  
  const resultsRef = useRef(null);
  const cardsRef = useRef([]);

  // Load artifacts from JSON
  useEffect(() => {
    fetch('/artefacts.json')
      .then(res => res.json())
      .then(data => {
        setArtifacts(data);
      })
      .catch(err => console.error('Error loading artifacts:', err));
  }, []);

  // Filter artifacts
  const filteredArtifacts = useMemo(() => {
    let filtered = artifacts;
    
    if (searchQuery) {
      filtered = filtered.filter(artifact =>
        artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [searchQuery, artifacts, museumCategory, country, artifactCategory, artifactRegion, dateRange]);

  // GSAP Animations
  useEffect(() => {
    if (filteredArtifacts.length > 0 && cardsRef.current.length > 0) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.fromTo(
        '.results-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.results-section', start: 'top 80%', toggleActions: 'play none none reverse' },
        }
      );
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, y: 80, scale: 0.9, rotateX: 15 },
            { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8, delay: index * 0.15, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
            }
          );
        }
      });
    }
  }, [filteredArtifacts]);

  const resetFilters = () => {
    setMuseumCategory('All');
    setCountry('All');
    setArtifactCategory('All');
    setArtifactRegion('All');
    setDateRange({ start: -3000, end: 2024 });
    setSearchQuery('');
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMarkerClick = (museum) => {
    setSelectedMarker(museum);
    setMapCenter([museum.lat, museum.lng]);
  };

  // Helper props object to pass to FilterPanel
  const filterProps = {
    resetFilters,
    museumCategory, setMuseumCategory,
    country, setCountry,
    artifactCategory, setArtifactCategory,
    artifactRegion, setArtifactRegion,
    dateRange, setDateRange,
    scrollToResults,
    setIsMobileFilterOpen
  };

  return (
    <div className="min-h-screen bg-old-paper font-dmsans selection:bg-accent-orange/30 selection:text-dark-chocolate relative">
      <div className="fixed inset-0 bg-noise opacity-40 pointer-events-none mix-blend-multiply z-0"></div>

      {/* --- Navbar --- */}
      <div className="navbar shadow-sm z-50 bg-dark-chocolate relative">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-dark-chocolate rounded-box z-100 mt-3 w-52 p-2 shadow-xl text-white border border-white/10">
              <li><a className="hover:bg-white/10">Home</a></li>
              <li><a className="hover:bg-white/10 text-accent-yellow">Explore</a></li>
              <li><a className="hover:bg-white/10">Archive</a></li>
            </ul>
          </div>
          <a className="btn btn-ghost text-xl text-white ml-2 font-playfair">Kyubiko</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            <li><a className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Home</a></li>
            <li><a className="text-accent-yellow bg-white/10 rounded-lg">Explore</a></li>
            <li><a className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Archive</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <a className="btn btn-ghost border border-white/20 text-white mr-5 hover:bg-white/10 transition-colors">
            Login / Sign up
          </a>
        </div>
      </div>

      {/* --- Map Section (Hero) --- */}
      <section className="relative h-[80vh] md:h-[85vh] z-10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[90%] md:w-[60%] lg:w-[50%]">
          <div className="join w-full shadow-2xl rounded-full overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-chocolate/40" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for artifacts, museums, exhibitions..."
                className="input join-item w-full bg-white/95 backdrop-blur-md h-14 text-base focus:outline-none border-none pl-12 pr-4 text-dark-chocolate placeholder:text-dark-chocolate/40"
              />
            </div>
            <button className="btn join-item h-14 px-6 md:px-8 bg-accent-yellow hover:bg-accent-orange border-none text-dark-chocolate font-bold transition-colors duration-300">
              <Search size={20} />
              <span className="hidden md:inline ml-2">Search</span>
            </button>
          </div>
        </div>

        {/* Filter Panel - Desktop */}
        <div className={`absolute top-4 left-4 z-1000 hidden md:block transition-all duration-500 ${isFilterOpen ? 'w-72' : 'w-12'}`} style={{ maxHeight: isFilterOpen ? 'calc(100% - 5rem)' : 'auto' }}>
          <div className={`bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-dark-chocolate/10 overflow-hidden flex flex-col ${isFilterOpen ? 'h-full' : 'h-auto'}`}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between p-3 bg-dark-chocolate/5 hover:bg-dark-chocolate/10 transition-colors shrink-0"
            >
              <span className={`font-medium text-dark-chocolate ${!isFilterOpen && 'hidden'}`}>
                {isFilterOpen ? 'Hide Filters' : ''}
              </span>
              <Filter size={20} className="text-dark-chocolate" />
            </button>
            
            {isFilterOpen && (
              <div className="overflow-y-auto overflow-x-hidden flex-1">
                {/* REFACTORED USAGE: Passing props */}
                <FilterPanel {...filterProps} isMobile={false} />
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel - Mobile */}
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="md:hidden absolute bottom-6 left-4 z-1000 btn bg-white/90 backdrop-blur-md shadow-xl border-none text-dark-chocolate"
        >
          <Filter size={18} />
          Filters
        </button>

        {isMobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-2000 flex items-end">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            ></div>
            <div className="relative w-full bg-old-paper rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slide-up">
              <div className="sticky top-0 bg-old-paper p-4 border-b border-dark-chocolate/10 flex justify-between items-center">
                <h3 className="font-playfair text-xl font-bold text-dark-chocolate">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="btn btn-ghost btn-circle">
                  <X size={24} />
                </button>
              </div>
              {/* REFACTORED USAGE: Passing props */}
              <FilterPanel {...filterProps} isMobile={true} />
            </div>
          </div>
        )}

        <button 
          onClick={scrollToResults}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 flex flex-col items-center text-white animate-bounce"
        >
          <span className="text-sm font-medium bg-dark-chocolate/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            Scroll for results
          </span>
          <ChevronDown size={24} className="mt-1" />
        </button>

        <MapContainer 
          center={mapCenter} 
          zoom={2} 
          minZoom={2}
          maxBoundsViscosity={1.0}
          maxBounds={[[-85, -180], [85, 180]]}
          className="h-full w-full z-0"
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ background: '#E8E2D9' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            noWrap={false}
          />
          <ZoomControl position="topright" />
          <MapController center={selectedMarker ? [selectedMarker.lat, selectedMarker.lng] : null} />
          
          {museumLocations
            .filter(m => museumCategory === 'All' || m.category === museumCategory)
            .filter(m => country === 'All' || m.country === country)
            .map(museum => (
              <Marker 
                key={museum.id} 
                position={[museum.lat, museum.lng]}
                eventHandlers={{
                  click: () => handleMarkerClick(museum),
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-dmsans">
                    <h4 className="font-bold text-dark-chocolate text-base">{museum.name}</h4>
                    <p className="text-sm text-dark-chocolate/70 flex items-center gap-1 mt-1">
                      <MapPin size={14} className="text-accent-orange" />
                      {museum.country}
                    </p>
                    <span className="inline-block mt-2 text-xs bg-accent-yellow/30 text-dark-chocolate px-2 py-1 rounded-full">
                      {museum.category}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </section>

      {/* --- Results Section --- */}
      <section ref={resultsRef} className="results-section relative z-20 bg-old-paper py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="results-title mb-12 text-center">
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Discover Treasures</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate mb-4">
              Artifact Results
            </h2>
            <p className="text-dark-chocolate/60 max-w-2xl mx-auto">
              Here's what Kyubi found...
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xl font-bold text-dark-chocolate">
              <span className="text-accent-orange">{filteredArtifacts.length}</span> artifacts found
            </h3>
            <select className="select select-bordered bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none">
              <option disabled selected>Sort by</option>
              <option>Newest Added</option>
              <option>Oldest Artifact</option>
              <option>Most Popular</option>
              <option>A-Z</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 justify-items-center">
            {filteredArtifacts.map((artifact, index) => (
              <div 
                key={index}
                ref={el => cardsRef.current[index] = el}
                className="w-full max-w-xs transform-gpu"
                style={{ perspective: '1000px' }}
              >
                <Card
                  name={artifact.name}
                  image={artifact.image}
                  description={artifact.description}
                />
              </div>
            ))}
          </div>

          {filteredArtifacts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-dark-chocolate/10 rounded-full flex items-center justify-center">
                <Search size={40} className="text-dark-chocolate/30" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2">No artifacts found</h3>
              <p className="text-dark-chocolate/60 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={resetFilters}
                className="btn bg-accent-orange hover:bg-accent-yellow text-white hover:text-dark-chocolate border-none"
              >
                Reset Filters
              </button>
            </div>
          )}

          {filteredArtifacts.length > 0 && (
            <div className="flex justify-center mt-16">
              <div className="join shadow-lg">
                <button className="join-item btn bg-white hover:bg-accent-yellow text-dark-chocolate border-dark-chocolate/10">«</button>
                <button className="join-item btn bg-accent-yellow text-dark-chocolate border-dark-chocolate/10">1</button>
                <button className="join-item btn bg-white hover:bg-accent-yellow text-dark-chocolate border-dark-chocolate/10">2</button>
                <button className="join-item btn bg-white hover:bg-accent-yellow text-dark-chocolate border-dark-chocolate/10">3</button>
                <button className="join-item btn bg-white hover:bg-accent-yellow text-dark-chocolate border-dark-chocolate/10">»</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-dark-chocolate text-white/60 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h4 className="font-playfair text-2xl text-white mb-4">Kyubiko</h4>
          <p className="text-sm">Preserving history, one artifact at a time.</p>
          <div className="border-t border-white/10 mt-8 pt-8">
            <p className="text-xs">© 2026 Kyubiko. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .leaflet-container {
          font-family: 'DM Sans', sans-serif;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .leaflet-popup-content {
          margin: 12px 16px;
        }
      `}</style>
    </div>
  );
}