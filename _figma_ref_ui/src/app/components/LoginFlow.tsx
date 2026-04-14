import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, Phone, MessageSquare, ChevronDown, Search, X, AlertCircle } from "lucide-react";
import logo from "figma:asset/49f2a8d3a5f70a32868fa8c05a682eae93defa59.png";

interface LoginFlowProps {
  onComplete: () => void;
}

const countries = [
  { name: "United States", code: "+1", flag: "🇺🇸", minLength: 10, maxLength: 10 },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧", minLength: 10, maxLength: 10 },
  { name: "India", code: "+91", flag: "🇮🇳", minLength: 10, maxLength: 10 },
  { name: "Canada", code: "+1", flag: "🇨🇦", minLength: 10, maxLength: 10 },
  { name: "Australia", code: "+61", flag: "🇦🇺", minLength: 9, maxLength: 9 },
  { name: "Germany", code: "+49", flag: "🇩🇪", minLength: 10, maxLength: 11 },
  { name: "France", code: "+33", flag: "🇫🇷", minLength: 9, maxLength: 9 },
  { name: "Japan", code: "+81", flag: "🇯🇵", minLength: 10, maxLength: 10 },
  { name: "China", code: "+86", flag: "🇨🇳", minLength: 11, maxLength: 11 },
  { name: "Brazil", code: "+55", flag: "🇧🇷", minLength: 10, maxLength: 11 },
  { name: "Mexico", code: "+52", flag: "🇲🇽", minLength: 10, maxLength: 10 },
  { name: "Spain", code: "+34", flag: "🇪🇸", minLength: 9, maxLength: 9 },
  { name: "Italy", code: "+39", flag: "🇮🇹", minLength: 9, maxLength: 10 },
  { name: "South Korea", code: "+82", flag: "🇰🇷", minLength: 9, maxLength: 10 },
  { name: "Netherlands", code: "+31", flag: "🇳🇱", minLength: 9, maxLength: 9 },
  { name: "Singapore", code: "+65", flag: "🇸🇬", minLength: 8, maxLength: 8 },
  { name: "UAE", code: "+971", flag: "🇦🇪", minLength: 9, maxLength: 9 },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦", minLength: 9, maxLength: 9 },
  { name: "South Africa", code: "+27", flag: "🇿🇦", minLength: 9, maxLength: 9 },
  { name: "Russia", code: "+7", flag: "🇷🇺", minLength: 10, maxLength: 10 },
];

export function LoginFlow({ onComplete }: LoginFlowProps) {
  const [step, setStep] = useState<
    | "welcome"
    | "phone"
    | "verification"
    | "name"
    | "profile-photo"
    | "notifications"
    | "success"
  >("welcome");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.includes(countrySearch)
  );

  // Validate phone number based on selected country
  useEffect(() => {
    const numericPhone = phoneNumber.replace(/\D/g, "");
    const isValid =
      numericPhone.length >= selectedCountry.minLength &&
      numericPhone.length <= selectedCountry.maxLength;
    setIsPhoneValid(isValid);
    setShowValidation(numericPhone.length > 0);
  }, [phoneNumber, selectedCountry]);

  const handleVerificationInput = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleNextFromWelcome = () => {
    setStep("phone");
  };

  const handleNextFromPhone = () => {
    if (isPhoneValid) {
      setStep("verification");
    }
  };

  const handleNextFromVerification = () => {
    if (verificationCode.every((digit) => digit !== "")) {
      setStep("name");
    }
  };

  const handleNextFromName = () => {
    if (name.trim()) {
      setStep("profile-photo");
    }
  };

  const handleSkipPhoto = () => {
    setStep("notifications");
  };

  const handleEnableNotifications = () => {
    setStep("success");
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleSkipNotifications = () => {
    setStep("success");
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-100 via-neutral-100 to-stone-100 dark:from-black dark:via-zinc-950 dark:to-neutral-950 flex flex-col items-center justify-center">
      {/* Welcome Screen */}
      {step === "welcome" && (
        <div className="flex flex-col items-center justify-between h-full w-full px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src={logo} alt="Wave Chat" className="w-40 h-40 mb-8 drop-shadow-2xl" />
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Welcome to Wave Chat
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 max-w-xs">
              Connect with friends and family with secure, fast messaging
            </p>
            
            <div className="space-y-4 mb-8 w-full max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Fast & Secure</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">End-to-end encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Rich Messaging</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Photos, videos & more</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Voice & Video Calls</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Crystal clear quality</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleNextFromWelcome}
            className="w-full max-w-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-red-500/50 dark:shadow-red-500/30 flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Phone Number Screen */}
      {step === "phone" && (
        <div className="flex flex-col items-center justify-between h-full w-full px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40 flex items-center justify-center mb-6">
              <Phone className="w-10 h-10 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Enter your phone number
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
              We'll send you a verification code to confirm your number
            </p>

            <div className="w-full max-w-xs space-y-3">
              {/* Country Selector Button */}
              <button
                type="button"
                onClick={() => setShowCountryPicker(true)}
                className="w-full px-4 py-4 bg-white/80 dark:bg-zinc-900/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm flex items-center justify-between group hover:border-red-500 dark:hover:border-red-500 transition-all"
              >
                <span className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCountry.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-sm">
                      {selectedCountry.name}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {selectedCountry.code}
                    </span>
                  </div>
                </span>
                <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>

              {/* Phone Number Input */}
              <div
                className={`relative bg-white/80 dark:bg-zinc-900/50 border-2 rounded-2xl backdrop-blur-sm flex items-center px-4 py-4 transition-all ${
                  showValidation
                    ? isPhoneValid
                      ? "border-green-500 ring-2 ring-green-500/20"
                      : "border-red-500 ring-2 ring-red-500/20"
                    : "border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 border-r border-zinc-300 dark:border-zinc-700 pr-3 mr-3">
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">
                    {selectedCountry.code}
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d\s-()]/g, "");
                    setPhoneNumber(value);
                  }}
                  className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none text-lg font-medium"
                />
                {showValidation && (
                  <div className="ml-2">
                    {isPhoneValid ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Validation Message */}
              {showValidation && !isPhoneValid && (
                <div className="flex items-start gap-2 px-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Please enter a valid {selectedCountry.name} phone number (
                    {selectedCountry.minLength}
                    {selectedCountry.minLength !== selectedCountry.maxLength
                      ? `-${selectedCountry.maxLength}`
                      : ""}{" "}
                    digits)
                  </p>
                </div>
              )}

              {/* Success Message */}
              {showValidation && isPhoneValid && (
                <div className="flex items-start gap-2 px-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Valid {selectedCountry.name} phone number
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleNextFromPhone}
            disabled={!isPhoneValid}
            className="w-full max-w-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-red-500/50 dark:shadow-red-500/30 disabled:shadow-none"
          >
            Continue
          </button>
        </div>
      )}

      {/* Verification Code Screen */}
      {step === "verification" && (
        <div className="flex flex-col items-center justify-between h-full w-full px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-zinc-700 dark:text-zinc-300" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Enter verification code
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
              We sent a code to {selectedCountry.code} {phoneNumber}
            </p>

            <div className="flex gap-3 mb-6">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerificationInput(index, e.target.value)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/80 dark:bg-zinc-900/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
                />
              ))}
            </div>

            <button className="text-red-600 dark:text-red-500 font-medium hover:text-red-700 dark:hover:text-red-400 transition-colors">
              Resend code
            </button>
          </div>

          <button
            onClick={handleNextFromVerification}
            disabled={!verificationCode.every((digit) => digit !== "")}
            className="w-full max-w-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-red-500/50 dark:shadow-red-500/30"
          >
            Verify
          </button>
        </div>
      )}

      {/* Name Input Screen */}
      {step === "name" && (
        <div className="flex flex-col items-center justify-between h-full w-full px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40 flex items-center justify-center mb-6 text-3xl">
              👤
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              What's your name?
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
              This is how you'll appear to your contacts
            </p>

            <div className="w-full max-w-xs">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-white/80 dark:bg-zinc-900/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg backdrop-blur-sm"
              />
            </div>
          </div>

          <button
            onClick={handleNextFromName}
            disabled={!name.trim()}
            className="w-full max-w-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-red-500/50 dark:shadow-red-500/30"
          >
            Continue
          </button>
        </div>
      )}

      {/* Profile Photo Screen */}
      {step === "profile-photo" && (
        <div className="flex flex-col items-center justify-between h-full w-full px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900/30 dark:to-zinc-800/40 flex items-center justify-center mb-6 text-6xl border-4 border-dashed border-zinc-300 dark:border-zinc-700">
              📷
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Add a profile photo
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
              Help your friends recognize you
            </p>

            <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium px-8 py-3 rounded-full transition-all shadow-lg shadow-red-500/50 dark:shadow-red-500/30 mb-4">
              Choose Photo
            </button>
          </div>

          <button
            onClick={handleSkipPhoto}
            className="w-full max-w-xs text-zinc-600 dark:text-zinc-400 font-medium py-3 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Notifications Permission Screen */}
      {step === "notifications" && (
        <div className="flex flex-col items-center justify-between h-full w-full px-6 py-12">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/40 flex items-center justify-center mb-6 text-4xl">
              🔔
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Enable notifications
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
              Stay updated with new messages and calls
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleEnableNotifications}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-red-500/50 dark:shadow-red-500/30"
            >
              Enable Notifications
            </button>
            <button
              onClick={handleSkipNotifications}
              className="w-full text-zinc-600 dark:text-zinc-400 font-medium py-3 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {step === "success" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 animate-in fade-in duration-700">
            You're all set!
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 animate-in fade-in duration-700">
            Welcome to Wave Chat, {name}
          </p>
        </div>
      )}

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-zinc-900 rounded-t-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Select Country
              </h3>
              <button
                onClick={() => {
                  setShowCountryPicker(false);
                  setCountrySearch("");
                }}
                className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="flex-1 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code + country.name}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                        setCountrySearch("");
                      }}
                      className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left ${
                        selectedCountry.code === country.code &&
                        selectedCountry.name === country.name
                          ? "bg-red-50 dark:bg-red-900/20"
                          : ""
                      }`}
                    >
                      <span className="text-4xl">{country.flag}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {country.name}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          {country.code}
                        </div>
                      </div>
                      {selectedCountry.code === country.code &&
                        selectedCountry.name === country.name && (
                          <CheckCircle2 className="w-6 h-6 text-red-600 dark:text-red-500" />
                        )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl mb-4">🌍</div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    No countries found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}