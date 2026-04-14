import { Search, Moon, Sun } from "lucide-react";
import { Link } from "react-router";
import { mockConversations } from "../data/mockData";
import { useTheme } from "next-themes";
import { formatTimestamp } from "../utils/formatTime";
import { BottomNavigation } from "./BottomNavigation";
import logo from "figma:asset/49f2a8d3a5f70a32868fa8c05a682eae93defa59.png";

export function ConversationList() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-black pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Wave Chat" className="w-10 h-10 object-contain drop-shadow-lg" />
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Wave Chat</h1>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-red-500" />
          ) : (
            <Moon className="w-5 h-5 text-zinc-600" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
        {mockConversations.map((conversation) => (
          <Link
            key={conversation.id}
            to={`/chat/${conversation.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-900"
          >
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {conversation.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                  {conversation.name}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  {formatTimestamp(conversation.timestamp)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate flex-1">
                  {conversation.typing ? (
                    <span className="italic text-red-500">typing...</span>
                  ) : (
                    conversation.lastMessage
                  )}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}