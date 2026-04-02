import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function UserAvatarMenu({ user, logoutOnly = false }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "curator";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar_url");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="avatar avatar-online cursor-pointer">
        <div className="w-12 rounded-full border border-white/20">
          <img src={user?.avatar_url || "https://placehold.co/150"} alt="User Avatar" />
        </div>
      </div>

      <div
        tabIndex={0}
        className="dropdown-content mt-3 w-72 rounded-xl bg-white shadow-xl border border-dark-chocolate/10 p-4 z-1000"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-dark-chocolate/10">
          <div className="w-11 h-11 rounded-full bg-dark-chocolate/10 flex items-center justify-center">
            <User size={18} className="text-dark-chocolate" />
          </div>
          <div>
            <p className="font-bold text-dark-chocolate text-sm">{user?.username || "Curator"}</p>
            <p className="text-xs uppercase tracking-wider text-dark-chocolate/60">{role}</p>
          </div>
        </div>

        <div className="pt-3 space-y-2">
          {!logoutOnly && (
            <>
              <Link
                to="/profile"
                className="btn btn-sm w-full bg-dark-chocolate text-white hover:bg-accent-orange border-none"
              >
                Go to Profile
              </Link>
              <Link
                to="/my-museums"
                className="btn btn-sm w-full bg-white text-dark-chocolate border border-dark-chocolate/20 hover:bg-old-paper"
              >
                My Museums
              </Link>
            </>
          )}

          <button
            onClick={handleLogout}
            className="btn btn-sm w-full bg-red-500 text-white hover:bg-red-600 border-none"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
