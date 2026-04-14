import { Search, MoreVertical, Phone as PhoneIcon, Calendar, Grid3x3, Heart, Plus } from "lucide-react";
import { Video } from "lucide-react";
import { mockCallLogs } from "../data/statusData";
import { formatCallTimestamp } from "../utils/formatTime";
import { BottomNavigation } from "./BottomNavigation";
import { useState } from "react";
import { ContactSelector } from "./ContactSelector";
import { ScheduleCall } from "./ScheduleCall";
import { Keypad } from "./Keypad";
import { Favorites } from "./Favorites";
import logo from "figma:asset/49f2a8d3a5f70a32868fa8c05a682eae93defa59.png";

export function Calls() {
  const [activeModal, setActiveModal] = useState<"contact" | "schedule" | "keypad" | "favorites" | null>(null);

  return (
    <>
      <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Wave Chat" className="w-10 h-10 object-contain drop-shadow-lg" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Calls</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Search className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <MoreVertical className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-around px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveModal("contact")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-red-600 dark:bg-red-700 rounded-full flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Call</span>
          </button>
          <button
            onClick={() => setActiveModal("schedule")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-700 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Schedule</span>
          </button>
          <button
            onClick={() => setActiveModal("keypad")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-700 rounded-full flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Keypad</span>
          </button>
          <button
            onClick={() => setActiveModal("favorites")}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-red-600 dark:bg-red-700 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Favorites</span>
          </button>
        </div>

        {/* Recent Calls */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">Recent</h2>
          </div>

          <div className="space-y-1">
            {mockCallLogs.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <img
                  src={call.avatar}
                  alt={call.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium truncate ${
                      call.type === "missed"
                        ? "text-red-500"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}>
                      {call.name}
                    </h3>
                    {call.count && call.count > 1 && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({call.count})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {call.type === "incoming" && (
                      <span className="text-green-500">↓</span>
                    )}
                    {call.type === "outgoing" && (
                      <span className="text-zinc-500">↑</span>
                    )}
                    {call.type === "missed" && (
                      <span className="text-red-500">↓</span>
                    )}
                    <span>{formatCallTimestamp(call.timestamp)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Initiate call directly
                    alert(`Calling ${call.name}...`);
                  }}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {call.callType === "video" ? (
                    <Video className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  ) : (
                    <PhoneIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setActiveModal("contact")}
          className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors max-w-md mx-auto"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        <BottomNavigation />
      </div>

      {/* Modals */}
      {activeModal === "contact" && (
        <ContactSelector onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "schedule" && (
        <ScheduleCall onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "keypad" && (
        <Keypad onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "favorites" && (
        <Favorites onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}