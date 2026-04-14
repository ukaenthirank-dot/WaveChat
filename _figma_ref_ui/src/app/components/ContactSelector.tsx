import { ArrowLeft, Grid2x2, Link as LinkIcon, UserPlus } from "lucide-react";
import { mockConversations } from "../data/mockData";

interface ContactSelectorProps {
  onClose: () => void;
  onSelectContact?: (contact: any) => void;
}

export function ContactSelector({ onClose, onSelectContact }: ContactSelectorProps) {
  const frequentlyContacted = mockConversations.slice(0, 5);
  const allContacts = mockConversations;

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
        <input
          type="text"
          placeholder="Search name or number..."
          className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
        <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
          <Grid2x2 className="w-6 h-6 text-zinc-100" />
        </button>
      </div>

      {/* Add up to 31 people */}
      <div className="px-4 py-4 text-center border-b border-zinc-800">
        <p className="text-zinc-400 text-sm">Add up to 31 people</p>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-zinc-800">
        <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-zinc-100 text-lg">New call link</span>
        </button>
        
        <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <span className="text-zinc-100 text-lg">New contact</span>
          <Grid2x2 className="w-5 h-5 text-zinc-400 ml-auto" />
        </button>
      </div>

      {/* Frequently Contacted */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          <h3 className="text-zinc-400 text-sm">Frequently contacted</h3>
        </div>
        
        <div>
          {frequentlyContacted.map((contact) => (
            <button
              key={contact.id}
              onClick={() => {
                if (onSelectContact) {
                  onSelectContact(contact);
                } else {
                  alert(`Calling ${contact.name}...`);
                  onClose();
                }
              }}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-900 transition-colors"
            >
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <h3 className="text-zinc-100 font-medium">{contact.name}</h3>
                {contact.lastMessage && (
                  <p className="text-zinc-500 text-sm truncate">{contact.lastMessage}</p>
                )}
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-zinc-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}