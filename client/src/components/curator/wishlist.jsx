import React from "react";

export default function Wishlist({ items , handleRemove }) {
  return (
    <ul className="list bg-old-paper text-dark-chocolate font-dmsans rounded-box shadow-xl max-h-96 overflow-y-auto">
      {/* Header */}
      <li className="p-4 pb-2 text-sm font-playfair text-accent-orange font-bold tracking-wide uppercase sticky top-0 bg-old-paper z-10 border-b border-brown/20">
        Your Favourite Artifacts
      </li>

      {!items || items.length === 0 ? (
        <li className="p-6 text-center text-sm font-bold text-brown">
          Your wishlist is empty.
        </li>
      ) : (
        items.map((item, index) => (
          <li key={index} className="list-row hover:bg-brown/10 border-brown/20 transition-colors">
            <div>
              <img
                className="size-10 rounded-box object-cover bg-stone-200"
                src={item.picture_url || "https://placehold.co/100x100?text=No+Image"} 
                alt={item.artifact_name}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-playfair font-bold text-lg truncate">{item.artifact_name}</div>
              <div className="text-xs uppercase font-bold text-brown truncate">
                {item.creator || "Unknown Creator"}
              </div>
            </div>
            
            {/* Trash Button */}
            <button className="btn btn-square btn-ghost text-dark-chocolate hover:bg-red-100 hover:text-red-500" onClick={() => handleRemove(item.artifact_id)}>
              <svg
                className="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </button>
          </li>
        ))
      )}
    </ul>
  );
}