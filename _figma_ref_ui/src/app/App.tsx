import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./components/ThemeProvider";
import { SplashScreen } from "./components/SplashScreen";
import { LoginFlow } from "./components/LoginFlow";
import { useState } from "react";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  if (showSplash) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="w-[393px] h-[852px] overflow-hidden rounded-[3rem] shadow-2xl border-[12px] border-zinc-950 bg-black relative">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-950 rounded-b-3xl z-50" />
          <ThemeProvider>
            <SplashScreen onComplete={() => setShowSplash(false)} />
          </ThemeProvider>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="w-[393px] h-[852px] overflow-hidden rounded-[3rem] shadow-2xl border-[12px] border-zinc-950 bg-black relative">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-950 rounded-b-3xl z-50" />
          <ThemeProvider>
            <LoginFlow onComplete={() => setShowLogin(false)} />
          </ThemeProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="w-[393px] h-[852px] overflow-hidden rounded-[3rem] shadow-2xl border-[12px] border-zinc-950 bg-black relative">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-950 rounded-b-3xl z-50" />
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </div>
    </div>
  );
}