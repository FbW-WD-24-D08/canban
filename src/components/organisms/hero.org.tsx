import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ParticlesComponent } from "../atoms/particles.comp";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  return (
    <section className="relative flex items-center justify-center h-screen w-screen text-white overflow-hidden">
      <ParticlesComponent />
      <div className="absolute inset-0 bg-black/60 -z-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 break-words">
          Welcome to Canban
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-8 py-8">
          <b>Yes, we CAN!</b> - ban.
          <br />
          Kanban reloaded.
        </p>
        <Link
          to="/signup"
          className="bg-white text-teal-600 px-6 py-3 text-base rounded-lg font-semibold hover:bg-gray-100 transition-colors sm:px-8 sm:py-4 sm:text-lg"
        >
          Get Started
        </Link>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-8 h-8 animate-bounce text-white/70" />
      </div>
    </section>
  );
}
