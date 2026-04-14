import { useEffect, useState } from "react";
import logo from "figma:asset/49f2a8d3a5f70a32868fa8c05a682eae93defa59.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<"logo" | "title" | "loading">("logo");

  useEffect(() => {
    // Stage 1: Show logo for 1 second
    const timer1 = setTimeout(() => {
      setStage("title");
    }, 1000);

    // Stage 2: Show title for 1 second
    const timer2 = setTimeout(() => {
      setStage("loading");
    }, 2000);

    // Stage 3: Show loading for 1.5 seconds then complete
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-100 via-neutral-100 to-stone-100 dark:from-black dark:via-zinc-950 dark:to-neutral-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative Background Blobs - Black & Red themed */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-red-200 dark:bg-red-900/30 rounded-full blur-3xl opacity-60 -translate-x-8 -translate-y-8" />
      <div className="absolute top-20 right-0 w-40 h-40 bg-red-300 dark:bg-red-800/30 rounded-full blur-3xl opacity-50 translate-x-16" />
      <div className="absolute top-52 left-12 w-20 h-20 bg-zinc-200 dark:bg-zinc-900/50 rounded-full blur-2xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400 dark:bg-red-700/40 rounded-full blur-3xl opacity-60 -translate-x-32 translate-y-32" />
      <div className="absolute bottom-40 right-8 w-24 h-24 bg-red-300 dark:bg-red-800/30 rounded-full blur-2xl opacity-50" />
      <div className="absolute bottom-64 right-16 w-16 h-16 bg-zinc-200 dark:bg-zinc-900/50 rounded-full blur-xl opacity-40" />
      
      {/* Floating particles effect */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400/40 dark:bg-red-500/40 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-red-400/30 dark:bg-red-500/30 rounded-full animate-pulse delay-300" />
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-400/40 dark:bg-red-500/40 rounded-full animate-pulse delay-700" />

      {/* Content Container */}
      <div
        className={`flex flex-col items-center transition-all duration-700 ${
          stage === "logo"
            ? "justify-center"
            : stage === "title"
            ? "justify-center -translate-y-8"
            : "justify-start pt-32"
        }`}
      >
        {/* Logo */}
        <div
          className={`relative transition-all duration-700 ${
            stage === "logo"
              ? "w-48 h-48"
              : stage === "title"
              ? "w-40 h-40"
              : "w-32 h-32"
          }`}
        >
          <img
            src={logo}
            alt="Wave Chat Logo"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Loading Section - Appears in stage 3 */}
        {stage === "loading" && (
          <div className="flex flex-col items-center mt-32 animate-in fade-in duration-500">
            {/* Loading Spinner */}
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-4 border-red-200 dark:border-red-900/50 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-red-500 dark:border-t-red-600 rounded-full animate-spin" />
            </div>

            {/* Loading Text */}
            <p className="text-red-600 dark:text-red-500 font-medium text-lg">
              Loading...
            </p>
          </div>
        )}
      </div>

      {/* From Text - Only visible in loading stage */}
      {stage === "loading" && (
        <div className="absolute bottom-12 text-zinc-400 dark:text-zinc-600 text-sm animate-in fade-in duration-500">
          from
        </div>
      )}
    </div>
  );
}