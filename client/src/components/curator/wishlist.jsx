import React from "react";
import { Trash2 } from "lucide-react";

export default function Wishlist({ items, handleRemove, actionRenderer }) {
  return (
    <ul className="list bg-old-paper text-dark-chocolate font-dmsans rounded-box shadow-xl max-h-[60vh] overflow-y-auto w-96 border border-brown/30">
      <li className="p-4 pb-2 text-sm font-playfair text-accent-orange font-bold tracking-wide uppercase sticky top-0 bg-old-paper z-10 border-b border-brown/20">
        Your Favourite Artifacts
      </li>

      {!items || items.length === 0 ? (
        <li className="p-6 text-center text-sm font-bold text-brown">
          Your wishlist is empty.
        </li>
      ) : (
        items.map((item, index) => (
          <li key={index} className="list-row hover:bg-brown/10 border-brown/20 transition-colors bg-old-paper">
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
            
            <div className="flex items-center gap-2 z-10">
              {actionRenderer ? (
                actionRenderer(item)
              ) : (
                <button 
                  className="btn btn-square btn-ghost text-dark-chocolate hover:bg-red-100 hover:text-red-500" 
                  onClick={() => handleRemove && handleRemove(item.artifact_id)}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </li>
        ))
      )}
    </ul>
  );
}