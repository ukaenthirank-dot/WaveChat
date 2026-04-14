import { Check, CheckCheck, Play } from "lucide-react";
import { Message } from "../types/chat";
import { formatMessageTime } from "../utils/formatTime";
import { useState } from "react";

interface ChatBubbleProps {
  message: Message & { isGroupStart: boolean; isGroupEnd: boolean };
  showAvatar?: boolean;
  avatar?: string;
  isGroupStart: boolean;
  isGroupEnd: boolean;
}

export function ChatBubble({ message, showAvatar, avatar, isGroupStart, isGroupEnd }: ChatBubbleProps) {
  const isSent = message.sender === "me";
  const [showVideoControls, setShowVideoControls] = useState(false);

  return (
    <div className={`flex gap-2 ${isSent ? "justify-end" : "justify-start"} ${!isGroupStart ? "mt-0.5" : "mt-3"}`}>
      {/* Avatar for received messages */}
      {!isSent && (
        <div className="w-6 flex-shrink-0">
          {showAvatar && avatar && (
            <img
              src={avatar}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[75%]`}>
        <div
          className={`shadow-sm overflow-hidden ${
            isSent
              ? "bg-red-600 text-white rounded-2xl rounded-tr-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-2xl rounded-tl-sm"
          } ${!isGroupStart && isSent ? "rounded-tr-2xl" : ""} ${!isGroupStart && !isSent ? "rounded-tl-2xl" : ""} ${!isGroupEnd && isSent ? "rounded-br-sm" : ""} ${!isGroupEnd && !isSent ? "rounded-bl-sm" : ""}`}
        >
          {/* Media Content */}
          {message.media && (
            <div className="relative">
              {message.media.type === "image" ? (
                <img
                  src={message.media.url}
                  alt="Shared image"
                  className="max-w-full h-auto max-h-64 object-cover cursor-pointer"
                  onClick={() => window.open(message.media!.url, "_blank")}
                />
              ) : (
                <div
                  className="relative cursor-pointer group"
                  onMouseEnter={() => setShowVideoControls(true)}
                  onMouseLeave={() => setShowVideoControls(false)}
                >
                  <video
                    src={message.media.url}
                    controls={showVideoControls}
                    className="max-w-full h-auto max-h-64 object-cover"
                    preload="metadata"
                  />
                  {!showVideoControls && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-zinc-900 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <div className="px-3 py-2">
              <p className="text-sm leading-relaxed break-words">{message.text}</p>
            </div>
          )}
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 px-3 pb-2 -mt-1">
              {message.reactions.map((reaction, idx) => (
                <span key={idx} className="text-xs">
                  {reaction}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Status - only show on group end */}
        {isGroupEnd && (
          <div className="flex items-center gap-1 mt-0.5 px-1">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {formatMessageTime(message.timestamp)}
            </span>
            {isSent && message.status && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {message.status === "read" ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : message.status === "delivered" ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}