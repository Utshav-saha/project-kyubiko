import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Search, Filter, ChevronDown, X, MapPin, Heart, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import UserAvatarMenu from '../components/common/UserAvatarMenu';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

gsap.registerPlugin(ScrollTrigger);

// --- Actual Museums Data (manager side / world museums) ---
const dummyActualMuseums = [
  {
    id: 101,
    name: 'Industrial Revolution Gallery',
    description: 'Machinery, blueprints, and social history from 1800s London.',
    image: 'https://images.unsplash.com/photo-1555009312-3df64fb56cb2?w=800&q=80',
    lat: 51.5194,
    lng: -0.127,
    country: 'United Kingdom',
    category: 'Science',
    creator: 'British Museum Team',
  },
  {
    id: 102,
    name: 'Dynasties of the East Museum',
    description: 'Silk, ceramics, and imperial artifacts from the Ming and Qing eras.',
    image: 'https://images.unsplash.com/photo-1596726224151-50802c659e51?w=800&q=80',
    lat: 39.9042,
    lng: 116.3912,
    country: 'China',
    category: 'Cultural',
    creator: 'Beijing Heritage Board',
  },
  {
    id: 103,
    name: 'Modern Impressions Museum',
    description: 'Late 19th and early 20th century impressionist movements.',
    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80',
    lat: 48.8606,
    lng: 2.3376,
    country: 'France',
    category: 'Art',
    creator: 'Paris Arts Council',
  },
  {
    id: 104,
    name: 'Nile Civilizations Museum',
    description: 'Ancient Egyptian life, rituals, and royal architecture.',
    image: 'https://images.unsplash.com/photo-1675093162207-151b2d2136ea?w=800&q=80',
    lat: 30.0444,
    lng: 31.2357,
    country: 'Egypt',
    category: 'History',
    creator: 'Cairo National Board',
  },
  {
    id: 105,
    name: 'Renaissance Heritage Museum',
    description: 'Masterpieces and social history of renaissance Italy.',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988f1?w=800&q=80',
    lat: 43.7696,
    lng: 11.2558,
    country: 'Italy',
    category: 'Art',
    creator: 'Florence Museum Authority',
  },
  {
    id: 106,
    name: 'Samurai Legacy Museum',
    description: 'Armor, scrolls, and feudal era military culture.',
    image: 'https://images.unsplash.com/photo-1521292270410-a8c4d716d518?w=800&q=80',
    lat: 35.6762,
    lng: 139.6503,
    country: 'Japan',
    category: 'History',
    creator: 'Tokyo Historical Society',
  },
  {
    id: 107,
    name: 'Andean Cultural Museum',
    description: 'Textiles, tools, and spiritual life of early Andean communities.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    lat: -12.0464,
    lng: -77.0428,
    country: 'Peru',
    category: 'Cultural',
    creator: 'Lima Cultural Office',
  },
  {
    id: 108,
    name: 'Nordic Seafaring Museum',
    description: 'Maritime exploration, navigation tools, and shipbuilding history.',
    image: 'https://images.unsplash.com/photo-1491156855053-9cdff72c7f85?w=800&q=80',
    lat: 59.3293,
    lng: 18.0686,
    country: 'Sweden',
    category: 'Science',
    creator: 'Stockholm Maritime Group',
  },
];

// --- Community Museums Data (mini museums) ---
const dummyCommunityMuseums = [
  {
    id: 1,
    name: 'Industrial Revolution Mini Museum',
    description: 'A curated corner on machine culture and city transition.',
    image: 'https://images.unsplash.com/photo-1555009312-3df64fb56cb2?w=800&q=80',
    country: 'United Kingdom',
    category: 'Science',
    likes: 128,
    creator: 'Utshav',
    createdAt: '2026-01-14',
  },
  {
    id: 2,
    name: 'Dynasties of the East Mini Museum',
    description: 'Silk works and ceremonial objects from imperial courts.',
    image: 'https://images.unsplash.com/photo-1596726224151-50802c659e51?w=800&q=80',
    country: 'China',
    category: 'Cultural',
    likes: 890,
    creator: 'Ahnaf',
    createdAt: '2026-02-10',
  },
  {
    id: 3,
    name: 'Modern Impressions Mini Museum',
    description: 'Brushwork, color palettes, and notes from modernist circles.',
    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80',
    country: 'France',
    category: 'Art',
    likes: 275,
    creator: 'Utshav',
    createdAt: '2026-01-30',
  },
  {
    id: 4,
    name: 'City of Pharaohs Mini Museum',
    description: 'A visual timeline of dynasties, tombs, and symbols.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    country: 'Egypt',
    category: 'History',
    likes: 143,
    creator: 'Maliha',
    createdAt: '2026-03-01',
  },
  {
    id: 5,
    name: 'Roman Roads Mini Museum',
    description: 'Engineering marvels and life around road networks.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    country: 'Italy',
    category: 'History',
    likes: 432,
    creator: 'Nayeem',
    createdAt: '2026-03-06',
  },
  {
    id: 6,
    name: 'Museum of Living Nature Mini Museum',
    description: 'Natural artifacts and ecosystem stories from Africa.',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988f1?w=800&q=80',
    country: 'Kenya',
    category: 'Science',
    likes: 205,
    creator: 'Rafa',
    createdAt: '2026-02-22',
  },
];

const museumCategories = ['All', 'Art', 'History', 'Science', 'Cultural'];
const countries = ['All', 'France', 'United Kingdom', 'Egypt', 'Italy', 'China', 'Japan', 'Peru', 'Sweden', 'Kenya'];

const MuseumCard = ({ museum, onHeart, showHeart = false, onEnter }) => {
  return (
    <div className="group h-full w-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col border border-dark-chocolate/10">
      <div className="relative h-48 overflow-hidden">
        <img
          src={museum.image}
          alt={museum.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <MapPin size={12} className="text-accent-orange" />
            <span className="text-xs font-bold tracking-widest uppercase text-dark-chocolate">
              {museum.country}
            </span>
          </div>
        </div>
        <div className="absolute top-4 right-4 z-20 bg-dark-chocolate/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
           <span className="text-xs font-bold tracking-widest uppercase text-accent-yellow">
              {museum.category}
            </span>
        </div>
        {showHeart && (
          <button
            onClick={() => onHeart && onHeart(museum.id)}
            className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-full shadow-sm border border-dark-chocolate/10 hover:bg-white transition-colors"
            aria-label="Like mini museum"
          >
            <span className="text-xs font-bold text-dark-chocolate flex items-center gap-1">
              <Heart size={14} className="text-red-500 fill-red-500" />
              {museum.likes}
            </span>
          </button>
        )}
      </div>

      <div className="flex-1 p-6 relative bg-white flex flex-col">
        <div className="flex-1">
          <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2 leading-tight group-hover:text-accent-orange transition-colors">
            {museum.name}
          </h3>
          <p className="text-dark-chocolate/70 text-sm leading-relaxed line-clamp-3 mb-4">
            {museum.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between border-t border-dark-chocolate/10 pt-4 mt-auto">
          <div className="flex items-center gap-2 text-dark-chocolate/80">
            <div className="w-6 h-6 rounded-full bg-dark-chocolate/10 flex items-center justify-center">
              <User size={12} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{museum.creator}</span>
          </div>
          <button
            onClick={() => onEnter && onEnter(museum)}
            className="btn btn-xs bg-dark-chocolate text-white hover:bg-accent-orange border-none"
          >
            Enter Museum
          </button>
        </div>
      </div>
    </div>
  );
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 5, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

const FilterPanel = ({ 
  isMobile = false, 
  resetFilters, 
  museumCategory, setMuseumCategory,
  country, setCountry,
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

    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-dark-chocolate/60 font-bold mb-3">Museum Properties</p>
      
      <div className="space-y-4">
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
          <label className="text-sm font-medium text-dark-chocolate mb-1 block">Location Origin</label>
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

    <button 
      onClick={() => {
        scrollToResults();
        if (isMobile && setIsMobileFilterOpen) setIsMobileFilterOpen(false);
      }}
      className="btn w-full bg-accent-yellow hover:bg-accent-orange text-dark-chocolate font-bold border-none shadow-md hover:shadow-lg transition-all duration-300"
    >
      Apply Filters
      <ChevronDown size={18} />
    </button>
  </div>
);

export default function Explore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'curator');
  const [loading, setLoading] = useState(true);
  const [mapMuseums, setMapMuseums] = useState([]);
  const [archiveMuseums, setArchiveMuseums] = useState([]);
  const [communityMuseums, setCommunityMuseums] = useState([]);
  const [archiveSuggestions, setArchiveSuggestions] = useState([]);
  const [communitySuggestions, setCommunitySuggestions] = useState([]);
  const [totalArchivePages, setTotalArchivePages] = useState(1);
  const [totalCommunityPages, setTotalCommunityPages] = useState(1);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [communityTotal, setCommunityTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');

  const [archiveSearchFocus, setArchiveSearchFocus] = useState(false);
  const [communitySearchFocus, setCommunitySearchFocus] = useState(false);

  const [archivePage, setArchivePage] = useState(1);
  const [communityPage, setCommunityPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([30, 20]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const perPage = 6;
  
  // Filter states
  const [museumCategory, setMuseumCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [communityCategory, setCommunityCategory] = useState('All');
  const [communitySort, setCommunitySort] = useState('most_liked');
  
  const resultsRef = useRef(null);
  const archiveCardsRef = useRef([]);
  const communityCardsRef = useRef([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role') || 'curator';
        setUserRole(role);

        if (!token) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
          return;
        }

        let response = await fetch(`${API_URL}/explore/authorize`, {
          method: 'GET',
          headers: { token },
        });

        // Fallback to existing authorize endpoint if explore route is unavailable.
        if (!response.ok && response.status === 404) {
          response = await fetch(`${API_URL}/search/authorize`, {
            method: 'GET',
            headers: { token },
          });
        }

        if (!response.ok && (response.status === 401 || response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Explore authorize failed with status ${response.status}`);
        }

        const parseRes = await response.json();
        setUser(parseRes.user);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchMapMuseums = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '200');
        if (museumCategory !== 'All') params.append('category', museumCategory);
        if (country !== 'All') params.append('country', country);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());

        const response = await fetch(`${API_URL}/explore/archives?${params.toString()}`, {
          method: 'GET',
          headers: { token },
        });

        if (!response.ok) throw new Error('Failed to fetch map museums');

        const data = await response.json();
        setMapMuseums(data.museums || []);
      } catch (error) {
        console.error(error.message);
        setMapMuseums(dummyActualMuseums);
      }
    };

    fetchMapMuseums();
  }, [museumCategory, country, searchQuery]);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('page', archivePage.toString());
        params.append('limit', perPage.toString());
        if (museumCategory !== 'All') params.append('category', museumCategory);
        if (country !== 'All') params.append('country', country);
        if (archiveSearchQuery.trim()) params.append('search', archiveSearchQuery.trim());

        const response = await fetch(`${API_URL}/explore/archives?${params.toString()}`, {
          method: 'GET',
          headers: { token },
        });

        if (!response.ok) throw new Error('Failed to fetch archives');

        const data = await response.json();
        setArchiveMuseums(data.museums || []);
        setArchiveTotal(data.total || 0);
        setTotalArchivePages(Math.max(1, data.total_pages || 1));
      } catch (error) {
        console.error(error.message);
        const fallback = dummyActualMuseums.slice(0, perPage);
        setArchiveMuseums(fallback);
        setArchiveTotal(dummyActualMuseums.length);
        setTotalArchivePages(Math.max(1, Math.ceil(dummyActualMuseums.length / perPage)));
      }
    };

    fetchArchives();
  }, [archivePage, archiveSearchQuery, museumCategory, country]);

  useEffect(() => {
    const fetchArchiveSuggestions = async () => {
      if (!archiveSearchQuery.trim()) {
        setArchiveSuggestions([]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/explore/archives/suggest?letters=${encodeURIComponent(archiveSearchQuery)}`, {
          method: 'GET',
          headers: { token },
        });

        if (!response.ok) throw new Error('Failed to fetch archive suggestions');

        const data = await response.json();
        setArchiveSuggestions(data || []);
      } catch (error) {
        console.error(error.message);
        setArchiveSuggestions([]);
      }
    };

    fetchArchiveSuggestions();
  }, [archiveSearchQuery]);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('page', communityPage.toString());
        params.append('limit', perPage.toString());
        if (communitySearchQuery.trim()) params.append('search', communitySearchQuery.trim());
        if (communityCategory !== 'All') params.append('category', communityCategory);
        params.append('sort', communitySort);

        const response = await fetch(`${API_URL}/explore/community?${params.toString()}`, {
          method: 'GET',
          headers: { token },
        });

        if (!response.ok) throw new Error('Failed to fetch community museums');

        const data = await response.json();
        setCommunityMuseums(data.museums || []);
        setCommunityTotal(data.total || 0);
        setTotalCommunityPages(Math.max(1, data.total_pages || 1));
      } catch (error) {
        console.error(error.message);
        setCommunityMuseums([]);
        setCommunityTotal(0);
        setTotalCommunityPages(1);
      }
    };

    fetchCommunity();
  }, [communityPage, communitySearchQuery, communityCategory, communitySort]);

  useEffect(() => {
    const fetchCommunitySuggestions = async () => {
      if (!communitySearchQuery.trim()) {
        setCommunitySuggestions([]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/explore/community/suggest?letters=${encodeURIComponent(communitySearchQuery)}`, {
          method: 'GET',
          headers: { token },
        });

        if (!response.ok) throw new Error('Failed to fetch community suggestions');

        const data = await response.json();
        setCommunitySuggestions(data || []);
      } catch (error) {
        console.error(error.message);
        setCommunitySuggestions([]);
      }
    };

    fetchCommunitySuggestions();
  }, [communitySearchQuery]);

  // GSAP Animations
  useEffect(() => {
    if (archiveMuseums.length > 0 && archiveCardsRef.current.length > 0) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.fromTo(
        '.results-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.results-section', start: 'top 80%', toggleActions: 'play none none reverse' },
        }
      );
      archiveCardsRef.current.forEach((card, index) => {
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
  }, [archiveMuseums]);

  useEffect(() => {
    if (communityMuseums.length > 0 && communityCardsRef.current.length > 0) {
      communityCardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.6, delay: index * 0.1, ease: 'power3.out' }
          );
        }
      });
    }
  }, [communityMuseums]);

  const resetFilters = () => {
    setMuseumCategory('All');
    setCountry('All');
    setSearchQuery('');
    setArchiveSearchQuery('');
    setArchivePage(1);
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMarkerClick = (museum) => {
    setSelectedMarker(museum);
    setMapCenter([museum.lat, museum.lng]);
  };

  const handleEnterMuseum = (museum, source = 'archive') => {
    if (!museum?.id) return;
    navigate(`/go-to-museum/${museum.id}`, { state: { source, museum } });
  };

  const handleLikeCommunityMuseum = async (museumId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/explore/community/${museumId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
      });

      if (!response.ok) throw new Error('Failed to like museum');

      const data = await response.json();
      setCommunityMuseums(prev => prev.map(museum => (
        museum.id === museumId
          ? { ...museum, likes: data.likes }
          : museum
      )));
    } catch (error) {
      console.error(error.message);
    }
  };

  const filterProps = {
    resetFilters,
    museumCategory, setMuseumCategory,
    country, setCountry,
    scrollToResults,
    setIsMobileFilterOpen
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-chocolate">
        <span className="loading loading-spinner loading-lg text-accent-orange"></span>
      </div>
    );
  }

  if (!user) return null;

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
              {userRole === 'manager' ? (
                <>
                  <li><Link to="/manager-dashboard" className="hover:bg-white/10">Museum</Link></li>
                  <li><Link to="/explore" className="hover:bg-white/10 text-accent-yellow">Explore</Link></li>
                  <li><Link to="/tours" className="hover:bg-white/10">Tours</Link></li>
                  <li><Link to="/manager-quiz/new" className="hover:bg-white/10">Quiz</Link></li>
                  <li><Link to="/search" className="hover:bg-white/10">Search</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/my-museums" className="hover:bg-white/10">My Museums</Link></li>
                  <li><Link to="/explore" className="hover:bg-white/10 text-accent-yellow">Explore</Link></li>
                  <li><Link to="/search" className="hover:bg-white/10">Search</Link></li>
                </>
              )}
            </ul>
          </div>
          <Link to="/" className="btn btn-ghost text-xl text-white ml-2 font-playfair">Kyubiko</Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2 text-white/80 font-medium">
            {userRole === 'manager' ? (
              <>
                <li><Link to="/manager-dashboard" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Museum</Link></li>
                <li><Link to="/explore" className="text-accent-yellow bg-white/10 rounded-lg">Explore</Link></li>
                <li><Link to="/tours" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Tours</Link></li>
                <li><Link to="/manager-quiz/new" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Quiz</Link></li>
                <li><Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Search</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/my-museums" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">My Museums</Link></li>
                <li><Link to="/explore" className="text-accent-yellow bg-white/10 rounded-lg">Explore</Link></li>
                <li><Link to="/search" className="hover:text-white hover:bg-white/10 rounded-lg transition-colors">Search</Link></li>
              </>
            )}
          </ul>
        </div>
        <div className="navbar-end gap-3 pr-5">
          <div className="hidden md:block bg-white/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-white">{user.username}</span>
          </div>
          <UserAvatarMenu user={user} />
        </div>
      </div>

      {/* --- Map Section --- */}
      <section className="relative h-[80vh] md:h-[85vh] z-10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[90%] md:w-[60%] lg:w-[50%]">
          <div className="join w-full shadow-2xl rounded-full overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-chocolate/40" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search museums, topics, or creators..."
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
              <FilterPanel {...filterProps} isMobile={true} />
            </div>
          </div>
        )}

        <button 
          onClick={scrollToResults}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 flex flex-col items-center text-white animate-bounce cursor-pointer"
        >
          <span className="text-sm font-medium bg-dark-chocolate/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            Scroll for results
          </span>
          <ChevronDown size={24} className="mt-1" />
        </button>

        <MapContainer 
          center={mapCenter} 
          zoom={3} 
          minZoom={2}
          maxBoundsViscosity={1.0}
          maxBounds={[[-85, -180], [85, 180]]}
          className="h-full w-full z-0"
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ background: '#E8E2D9' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            noWrap={false}
          />
          <ZoomControl position="topright" />
          <MapController center={selectedMarker ? [selectedMarker.lat, selectedMarker.lng] : null} />
          
          {mapMuseums.map(museum => (
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
                  <p className="text-xs text-dark-chocolate/50 mt-1 flex items-center gap-1">
                    <User size={12}/> By {museum.creator}
                  </p>
                  <span className="inline-block mt-2 text-xs bg-accent-yellow/30 text-dark-chocolate px-2 py-1 rounded-full">
                    {museum.category}
                  </span>
                  <div className="mt-3">
                    <button
                      onClick={() => handleEnterMuseum(museum, 'archive')}
                      className="btn btn-xs bg-dark-chocolate text-white hover:bg-accent-orange border-none"
                    >
                      Enter Museum
                    </button>
                  </div>
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
            <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Explore the Archives</p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate mb-4">
               Museums
            </h2>
            <p className="text-dark-chocolate/60 max-w-2xl mx-auto">
              Discover museums across the globe 
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xl font-bold text-dark-chocolate">
              <span className="text-accent-orange">{archiveTotal}</span> museums found
            </h3>
            <div className="relative w-full sm:w-90">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-dark-chocolate/75"
                size={16}
                aria-hidden="true"
              />
              <input
                type="text"
                value={archiveSearchQuery}
                onChange={(e) => {
                  setArchiveSearchQuery(e.target.value);
                  setArchivePage(1);
                }}
                onFocus={() => setArchiveSearchFocus(true)}
                onBlur={() => setTimeout(() => setArchiveSearchFocus(false), 120)}
                placeholder="Search available museums..."
                className="input input-bordered w-full bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none pl-10"
              />

              {archiveSearchFocus && archiveSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-dark-chocolate/10 rounded-xl shadow-xl z-20 overflow-hidden">
                  {archiveSuggestions.map((museum) => (
                    <button
                      key={museum.id}
                      onMouseDown={() => {
                        setArchiveSearchQuery(museum.name);
                        setArchiveSearchFocus(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-old-paper/60 text-sm text-dark-chocolate"
                    >
                      {museum.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {archiveMuseums.map((museum, index) => (
              <div 
                key={museum.id}
                ref={el => archiveCardsRef.current[index] = el}
                className="w-full transform-gpu"
                style={{ perspective: '1000px' }}
              >
                <MuseumCard museum={museum} onEnter={(museumData) => handleEnterMuseum(museumData, 'archive')} />
              </div>
            ))}
          </div>

          {totalArchivePages > 1 && (
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setArchivePage(prev => Math.max(1, prev - 1))}
                className="btn btn-sm bg-white border-dark-chocolate/20 text-dark-chocolate"
                disabled={archivePage === 1}
              >
                Prev
              </button>
              <span className="text-sm font-bold text-dark-chocolate self-center">
                Page {archivePage} / {totalArchivePages}
              </span>
              <button
                onClick={() => setArchivePage(prev => Math.min(totalArchivePages, prev + 1))}
                className="btn btn-sm bg-white border-dark-chocolate/20 text-dark-chocolate"
                disabled={archivePage === totalArchivePages}
              >
                Next
              </button>
            </div>
          )}

          {archiveMuseums.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-dark-chocolate/10 rounded-full flex items-center justify-center">
                <Search size={40} className="text-dark-chocolate/30" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2">No museums found</h3>
              <p className="text-dark-chocolate/60 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={resetFilters}
                className="btn bg-accent-orange hover:bg-accent-yellow text-white hover:text-dark-chocolate border-none"
              >
                Reset Filters
              </button>
            </div>
          )}

          <div className="mt-16 md:mt-20 border-t border-dark-chocolate/10 pt-12">
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-widest text-accent-orange font-bold mb-2">Built by Curators</p>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-dark-chocolate mb-4">
                Community Museums
              </h2>
              <p className="text-dark-chocolate/60 max-w-2xl mx-auto">
                Discover mini museums created by users and support their work.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
              <div className="relative w-full lg:w-100">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-dark-chocolate/75"
                  size={16}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={communitySearchQuery}
                  onChange={(e) => {
                    setCommunitySearchQuery(e.target.value);
                    setCommunityPage(1);
                  }}
                  onFocus={() => setCommunitySearchFocus(true)}
                  onBlur={() => setTimeout(() => setCommunitySearchFocus(false), 120)}
                  placeholder="Search community museums..."
                  className="input input-bordered w-full bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none pl-10"
                />

                {communitySearchFocus && communitySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-dark-chocolate/10 rounded-xl shadow-xl z-20 overflow-hidden">
                    {communitySuggestions.map((museum) => (
                      <button
                        key={museum.id}
                        onMouseDown={() => {
                          setCommunitySearchQuery(museum.name);
                          setCommunitySearchFocus(false);
                          setCommunityPage(1);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-old-paper/60 text-sm text-dark-chocolate"
                      >
                        {museum.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <select
                  value={communityCategory}
                  onChange={(e) => {
                    setCommunityCategory(e.target.value);
                    setCommunityPage(1);
                  }}
                  className="select select-bordered bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
                >
                  {museumCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={communitySort}
                  onChange={(e) => {
                    setCommunitySort(e.target.value);
                    setCommunityPage(1);
                  }}
                  className="select select-bordered bg-white border-dark-chocolate/20 text-dark-chocolate focus:border-accent-orange focus:outline-none"
                >
                  <option value="most_liked">Most Liked</option>
                  <option value="recent">Recently Created</option>
                  <option value="a_z">A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {communityMuseums.map((museum, index) => (
                <div
                  key={museum.id}
                  ref={el => communityCardsRef.current[index] = el}
                  className="w-full"
                >
                  <MuseumCard
                    museum={museum}
                    showHeart={true}
                    onHeart={handleLikeCommunityMuseum}
                    onEnter={(museumData) => handleEnterMuseum(museumData, 'community')}
                  />
                </div>
              ))}
            </div>

            {totalCommunityPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => setCommunityPage(prev => Math.max(1, prev - 1))}
                  className="btn btn-sm bg-white border-dark-chocolate/20 text-dark-chocolate"
                  disabled={communityPage === 1}
                >
                  Prev
                </button>
                <span className="text-sm font-bold text-dark-chocolate self-center">
                  Page {communityPage} / {totalCommunityPages}
                </span>
                <button
                  onClick={() => setCommunityPage(prev => Math.min(totalCommunityPages, prev + 1))}
                  className="btn btn-sm bg-white border-dark-chocolate/20 text-dark-chocolate"
                  disabled={communityPage === totalCommunityPages}
                >
                  Next
                </button>
              </div>
            )}

            {communityTotal === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-dark-chocolate/10 rounded-full flex items-center justify-center">
                  <Search size={40} className="text-dark-chocolate/30" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-dark-chocolate mb-2">No community museums found</h3>
                <p className="text-dark-chocolate/60">Try adjusting your community search or filters</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-dark-chocolate text-white/60 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h4 className="font-playfair text-2xl text-white mb-4">Kyubiko</h4>
          <p className="text-sm">Preserving history, one collection at a time.</p>
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