import { X, Calendar as CalendarIcon, Video, Bell, ChevronRight, Phone, Check } from "lucide-react";
import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { mockConversations } from "../data/mockData";

interface ScheduleCallProps {
  onClose: () => void;
}

export function ScheduleCall({ onClose }: ScheduleCallProps) {
  const [title, setTitle] = useState("Ukaenthiran's call");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("5:30 PM");
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState("6:00 PM");
  const [hasEndTime, setHasEndTime] = useState(true);
  const [callType, setCallType] = useState<"voice" | "video">("video");
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showCallTypePicker, setShowCallTypePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

  const timeOptions = [
    "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM",
    "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM",
    "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
    "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
  ];

  const reminderOptions = [
    { label: "At time of event", value: 0 },
    { label: "5 minutes before", value: 5 },
    { label: "15 minutes before", value: 15 },
    { label: "30 minutes before", value: 30 },
    { label: "1 hour before", value: 60 },
    { label: "1 day before", value: 1440 },
  ];

  const handleScheduleCall = () => {
    const notification = {
      title,
      description,
      startDate: format(startDate, "PPP"),
      startTime,
      endDate: hasEndTime ? format(endDate, "PPP") : null,
      endTime: hasEndTime ? endTime : null,
      callType,
      reminderMinutes,
      contacts: selectedContacts,
    };
    alert(`Call scheduled! Notification will be sent to ${selectedContacts.length} contact(s)\n\n${JSON.stringify(notification, null, 2)}`);
    onClose();
  };

  const toggleContactSelection = (contact: any) => {
    setSelectedContacts(prev => {
      const exists = prev.find(c => c.id === contact.id);
      if (exists) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col overflow-y-auto">
      {/* Date Picker Overlays */}
      {showStartDatePicker && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-4 max-w-sm w-full">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  setShowStartDatePicker(false);
                }
              }}
              className="rounded-md border-0"
            />
            <button
              onClick={() => setShowStartDatePicker(false)}
              className="w-full mt-4 py-2 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showEndDatePicker && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-4 max-w-sm w-full">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  setEndDate(date);
                  setShowEndDatePicker(false);
                }
              }}
              className="rounded-md border-0"
            />
            <button
              onClick={() => setShowEndDatePicker(false)}
              className="w-full mt-4 py-2 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Picker Overlay */}
      {showStartTimePicker && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-4 max-w-sm w-full max-h-96 overflow-y-auto">
            <h3 className="text-zinc-100 text-lg font-semibold mb-4">Select Start Time</h3>
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setStartTime(time);
                  setShowStartTimePicker(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 ${
                  startTime === time ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-100"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {showEndTimePicker && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-4 max-w-sm w-full max-h-96 overflow-y-auto">
            <h3 className="text-zinc-100 text-lg font-semibold mb-4">Select End Time</h3>
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setEndTime(time);
                  setShowEndTimePicker(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 ${
                  endTime === time ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-100"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Call Type Picker */}
      {showCallTypePicker && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-4 max-w-sm w-full">
            <h3 className="text-zinc-100 text-lg font-semibold mb-4">Select Call Type</h3>
            <button
              onClick={() => {
                setCallType("voice");
                setShowCallTypePicker(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-2 ${
                callType === "voice" ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-100"
              }`}
            >
              <Phone className="w-5 h-5" />
              <span>Voice Call</span>
            </button>
            <button
              onClick={() => {
                setCallType("video");
                setShowCallTypePicker(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg ${
                callType === "video" ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-100"
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Video Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Reminder Picker */}
      {showReminderPicker && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-4 max-w-sm w-full">
            <h3 className="text-zinc-100 text-lg font-semibold mb-4">Select Reminder</h3>
            {reminderOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setReminderMinutes(option.value);
                  setShowReminderPicker(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 ${
                  reminderMinutes === option.value ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Selector */}
      {showContactSelector && (
        <div className="absolute inset-0 bg-zinc-950 z-10 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Select Contacts</h2>
            <button
              onClick={() => setShowContactSelector(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              Done ({selectedContacts.length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((contact) => {
              const isSelected = selectedContacts.find(c => c.id === contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => toggleContactSelection(contact)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-900 transition-colors"
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="text-zinc-100 font-medium">{contact.name}</h3>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "bg-red-600 border-red-600" : "border-zinc-600"
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-6 h-6 text-zinc-100" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-100">Schedule call</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-xl font-medium text-zinc-100 bg-transparent focus:outline-none"
            />
            <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (Optional)"
            className="w-full text-sm text-zinc-400 bg-transparent focus:outline-none placeholder:text-zinc-600"
          />
        </div>

        {/* Start Time */}
        <div className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors border-b border-zinc-800">
          <button
            onClick={() => setShowStartDatePicker(true)}
            className="flex items-center gap-4 flex-1"
          >
            <CalendarIcon className="w-5 h-5 text-zinc-400" />
            <span className="text-zinc-100">{format(startDate, "dd-MMM-yyyy")}</span>
          </button>
          <button
            onClick={() => setShowStartTimePicker(true)}
            className="text-zinc-100 hover:text-red-500 px-2"
          >
            {startTime}
          </button>
        </div>

        {/* End Time */}
        {hasEndTime && (
          <div className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors border-b border-zinc-800">
            <button
              onClick={() => setShowEndDatePicker(true)}
              className="flex items-center gap-4 flex-1"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-0.5 h-8 bg-zinc-700" />
              </div>
              <span className="text-zinc-100">{format(endDate, "dd-MMM-yyyy")}</span>
            </button>
            <button
              onClick={() => setShowEndTimePicker(true)}
              className="text-zinc-100 hover:text-green-500 px-2"
            >
              {endTime}
            </button>
          </div>
        )}

        {/* Remove End Time */}
        <button
          onClick={() => setHasEndTime(!hasEndTime)}
          className="w-full px-4 py-3 text-left hover:bg-zinc-900 transition-colors border-b border-zinc-800"
        >
          <span className="text-zinc-100 ml-9">
            {hasEndTime ? "Remove end time" : "Add end time"}
          </span>
        </button>

        {/* Call Type */}
        <button
          onClick={() => setShowCallTypePicker(true)}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors border-b border-zinc-800"
        >
          {callType === "video" ? (
            <Video className="w-5 h-5 text-zinc-400" />
          ) : (
            <Phone className="w-5 h-5 text-zinc-400" />
          )}
          <div className="flex-1">
            <p className="text-zinc-100">Call type</p>
            <p className="text-sm text-zinc-400">{callType === "video" ? "Video" : "Voice"}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Reminder */}
        <button
          onClick={() => setShowReminderPicker(true)}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors border-b border-zinc-800"
        >
          <Bell className="w-5 h-5 text-zinc-400" />
          <div className="flex-1">
            <p className="text-zinc-100">Reminder</p>
            <p className="text-sm text-zinc-400">
              {reminderOptions.find(o => o.value === reminderMinutes)?.label}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Select Contacts */}
        <button
          onClick={() => setShowContactSelector(true)}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-900 transition-colors"
        >
          <div className="flex-1">
            <p className="text-zinc-100">Participants</p>
            <p className="text-sm text-zinc-400">
              {selectedContacts.length === 0
                ? "Tap to add participants"
                : `${selectedContacts.length} selected`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Submit Button */}
      <div className="p-4">
        <button
          onClick={handleScheduleCall}
          className="w-14 h-14 ml-auto bg-red-600 rounded-2xl flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
        >
          <Check className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}