import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";

interface MessageInputProps {
  onSend: (message: string, media?: { type: "image" | "video"; url: string }) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: "image" | "video"; url: string; file: File } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      
      if (isVideo || isImage) {
        const url = URL.createObjectURL(file);
        setSelectedMedia({
          type: isVideo ? "video" : "image",
          url,
          file,
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedMedia) {
      onSend(
        message,
        selectedMedia ? { type: selectedMedia.type, url: selectedMedia.url } : undefined
      );
      setMessage("");
      setSelectedMedia(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeMedia = () => {
    if (selectedMedia) {
      URL.revokeObjectURL(selectedMedia.url);
      setSelectedMedia(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {/* Media Preview */}
      {selectedMedia && (
        <div className="px-4 pt-3 pb-2">
          <div className="relative inline-block">
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Preview"
                className="h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="relative h-24 w-32 bg-zinc-900 rounded-lg flex items-center justify-center">
                <VideoIcon className="w-8 h-8 text-white" />
                <video
                  src={selectedMedia.url}
                  className="absolute inset-0 h-full w-full object-cover rounded-lg opacity-50"
                />
              </div>
            )}
            <button
              onClick={removeMedia}
              className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              aria-label="Remove media"
            >
              <X className="w-4 h-4 text-white dark:text-zinc-900" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
            height={350}
            width={300}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-3 py-2 safe-area-inset-bottom">
        <div className="flex items-end gap-2">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 ${
              showEmojiPicker ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              rows={1}
              className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none max-h-32"
              style={{
                minHeight: "40px",
                height: "auto",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
            aria-label="Add attachment"
          >
            <Paperclip className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() && !selectedMedia}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}