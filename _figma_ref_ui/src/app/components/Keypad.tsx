import { ArrowLeft, UserPlus, MessageSquare, Delete, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { mockConversations } from "../data/mockData";
import { useNavigate } from "react-router";

interface KeypadProps {
  onClose: () => void;
}

export function Keypad({ onClose }: KeypadProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [matchedContact, setMatchedContact] = useState<any>(null);
  const navigate = useNavigate();

  const keys = [
    { digit: "1", letters: "" },
    { digit: "2", letters: "ABC" },
    { digit: "3", letters: "DEF" },
    { digit: "4", letters: "GHI" },
    { digit: "5", letters: "JKL" },
    { digit: "6", letters: "MNO" },
    { digit: "7", letters: "PQRS" },
    { digit: "8", letters: "TUV" },
    { digit: "9", letters: "WXYZ" },
    { digit: "*", letters: "" },
    { digit: "0", letters: "+" },
    { digit: "#", letters: "" },
  ];

  useEffect(() => {
    // Search for contacts when phone number changes
    if (phoneNumber.length >= 3) {
      const contact = mockConversations.find(c =>
        c.name.toLowerCase().includes(phoneNumber.toLowerCase()) ||
        phoneNumber.includes("99629")
      );
      setMatchedContact(contact);
    } else {
      setMatchedContact(null);
    }
  }, [phoneNumber]);

  const handleKeyPress = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (matchedContact) {
      alert(`Calling ${matchedContact.name}...`);
    } else if (phoneNumber) {
      alert(`Calling ${phoneNumber}...`);
    }
  };

  const handleChat = () => {
    if (matchedContact) {
      navigate(`/chat/${matchedContact.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-100" />
        </button>
        <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
          <UserPlus className="w-6 h-6 text-zinc-100" />
        </button>
      </div>

      {/* Number Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-8">
        <div className="text-4xl font-light text-zinc-100 mb-2 tracking-wider min-h-[3rem]">
          {phoneNumber || ""}
        </div>

        {matchedContact && (
          <div className="flex flex-col items-center gap-2 mb-8">
            <img
              src={matchedContact.avatar}
              alt={matchedContact.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <span className="text-zinc-200 font-medium text-lg">{matchedContact.name}</span>
            <button
              onClick={handleChat}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-zinc-100" />
              <span className="text-zinc-100 text-sm">Open Chat</span>
            </button>
          </div>
        )}

        {!matchedContact && phoneNumber && (
          <div className="text-zinc-500 text-sm mb-8">
            Enter number to call
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {keys.map((key) => (
            <button
              key={key.digit}
              onClick={() => handleKeyPress(key.digit)}
              className="aspect-square bg-zinc-800 rounded-full flex flex-col items-center justify-center hover:bg-zinc-700 transition-colors active:scale-95"
            >
              <span className="text-3xl font-light text-zinc-100">{key.digit}</span>
              {key.letters && (
                <span className="text-xs text-zinc-400 mt-0.5">{key.letters}</span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-8 mb-4">
          {matchedContact ? (
            <button
              onClick={handleChat}
              className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-zinc-100" />
            </button>
          ) : (
            <div className="w-14 h-14" />
          )}

          <button
            onClick={handleCall}
            disabled={!phoneNumber}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              phoneNumber
                ? "bg-green-600 hover:bg-green-700"
                : "bg-zinc-700 cursor-not-allowed"
            }`}
          >
            <Phone className="w-7 h-7 text-white" />
          </button>

          {phoneNumber ? (
            <button
              onClick={handleDelete}
              className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <Delete className="w-6 h-6 text-zinc-100" />
            </button>
          ) : (
            <div className="w-14 h-14" />
          )}
        </div>
      </div>
    </div>
  );
}
