import { ArrowLeft, Phone, Video, MoreVertical, X } from "lucide-react";
import { Link, useParams } from "react-router";
import { mockConversations, mockMessages } from "../data/mockData";
import { ChatBubble } from "./ChatBubble";
import { MessageInput } from "./MessageInput";
import { useState } from "react";
import { Message } from "../types/chat";

export function ChatDetail() {
  const { id } = useParams();
  const conversation = mockConversations.find((c) => c.id === id);
  const initialMessages = mockMessages[id || "1"] || [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Conversation not found</p>
      </div>
    );
  }

  const handleSendMessage = (text: string, media?: { type: "image" | "video"; url: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "me",
      timestamp: new Date(),
      status: "sent",
      media,
    };
    setMessages([...messages, newMessage]);

    // Simulate typing indicator and response
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: media ? (media.type === "image" ? "Great photo! 📸" : "Nice video! 🎥") : "Thanks for your message! 👍",
        sender: "other",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 3000);
  };

  // Group messages by same sender in sequence
  const groupedMessages = messages.reduce((acc, msg, idx) => {
    const prev = messages[idx - 1];
    const isGroupStart = !prev || prev.sender !== msg.sender;
    const next = messages[idx + 1];
    const isGroupEnd = !next || next.sender !== msg.sender;
    
    acc.push({ ...msg, isGroupStart, isGroupEnd });
    return acc;
  }, [] as (Message & { isGroupStart: boolean; isGroupEnd: boolean })[]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <Link
          to="/"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </Link>

        {/* Avatar and Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setShowProfilePhoto(true)}
            className="relative flex-shrink-0"
          >
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            {conversation.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50 truncate text-sm">
              {conversation.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {conversation.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Voice call"
          >
            <Phone className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Video call"
          >
            <Video className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfilePhoto(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  View contact
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Media, links, and docs
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Mute notifications
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Disappearing messages
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Wallpaper
                </button>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Clear chat
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Export chat
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                >
                  Add shortcut
                </button>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-red-500"
                >
                  Block
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-red-500"
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {groupedMessages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            showAvatar={message.sender === "other" && message.isGroupStart}
            avatar={conversation.avatar}
            isGroupStart={message.isGroupStart}
            isGroupEnd={message.isGroupEnd}
          />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <MessageInput onSend={handleSendMessage} />

      {/* Profile Photo Viewer */}
      {showProfilePhoto && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfilePhoto(false)}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div>
                <h2 className="text-white font-medium">{conversation.name}</h2>
                <p className="text-white/70 text-sm">Wave Chat</p>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}