import { MessageCircle, UserCircle, Camera, Phone } from "lucide-react";
import { Link, useLocation } from "react-router";

export function BottomNavigation() {
  const location = useLocation();

  const tabs = [
    { path: "/", icon: MessageCircle, label: "Chats", badge: null },
    { path: "/updates", icon: UserCircle, label: "Stories", badge: 1 },
    { path: "/camera", icon: Camera, label: "Camera", badge: null },
    { path: "/calls", icon: Phone, label: "Calls", badge: 1 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 z-40 max-w-md mx-auto">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-1 flex-1 py-1 relative"
            >
              <div className="relative">
                <div
                  className={`p-3 rounded-full transition-colors ${
                    isActive
                      ? "bg-red-600 dark:bg-red-600"
                      : "bg-transparent"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive
                        ? "text-white"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  />
                </div>
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 dark:bg-red-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}