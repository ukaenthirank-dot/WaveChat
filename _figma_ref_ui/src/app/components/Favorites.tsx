import { ArrowLeft, Phone, Video, Star, Plus } from "lucide-react";
import { mockConversations } from "../data/mockData";
import { useState } from "react";

interface FavoritesProps {
  onClose: () => void;
}

export function Favorites({ onClose }: FavoritesProps) {
  const [favorites, setFavorites] = useState(mockConversations.slice(0, 8));
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleQuickCall = (contact: any, type: "voice" | "video") => {
    alert(`${type === "video" ? "Video" : "Voice"} calling ${contact.name}...`);
  };

  const handleAddToFavorites = (contact: any) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === contact.id);
      if (!exists && prev.length < 12) {
        return [...prev, contact];
      }
      return prev;
    });
    setShowAddMenu(false);
  };

  const handleRemoveFromFavorites = (contactId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== contactId));
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-100" />
        </button>
        <h1 className="flex-1 text-xl font-semibold text-zinc-100">Favorites</h1>
        <button
          onClick={() => setShowAddMenu(true)}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-6 h-6 text-zinc-100" />
        </button>
      </div>

      {/* Add Menu */}
      {showAddMenu && (
        <div className="absolute inset-0 bg-zinc-950 z-10 flex flex-col">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
            <button
              onClick={() => setShowAddMenu(false)}
              className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-100" />
            </button>
            <h2 className="text-lg font-semibold text-zinc-100">Add to Favorites</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((contact) => {
              const isFavorite = favorites.find(f => f.id === contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => !isFavorite && handleAddToFavorites(contact)}
                  disabled={!!isFavorite}
                  className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${
                    isFavorite
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-zinc-900"
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="text-zinc-100 font-medium">{contact.name}</h3>
                    {isFavorite && (
                      <p className="text-sm text-zinc-500">Already in favorites</p>
                    )}
                  </div>
                  {isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorites Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {favorites.map((contact) => (
            <div
              key={contact.id}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <button
                  onClick={() => handleRemoveFromFavorites(contact.id)}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-950 hover:bg-zinc-700"
                >
                  <span className="text-zinc-100 text-xs">×</span>
                </button>
              </div>
              <span className="text-zinc-100 text-sm font-medium text-center truncate w-full">
                {contact.name.split(" ")[0]}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickCall(contact, "voice")}
                  className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-4 h-4 text-zinc-100" />
                </button>
                <button
                  onClick={() => handleQuickCall(contact, "video")}
                  className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Video className="w-4 h-4 text-zinc-100" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more button */}
          {favorites.length < 12 && (
            <button
              onClick={() => setShowAddMenu(true)}
              className="flex flex-col items-center gap-2 justify-center"
            >
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Plus className="w-8 h-8 text-zinc-400" />
              </div>
              <span className="text-zinc-400 text-sm">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Text */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-zinc-500 text-sm text-center">
          Tap icons to quickly call your favorite contacts
        </p>
      </div>
    </div>
  );
}
