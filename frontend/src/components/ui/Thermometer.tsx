"use client";

import { useEffect, useState } from "react";

interface ThermometerProps {
  percentage: number;
  animated?: boolean;
}

export const Thermometer: React.FC<ThermometerProps> = ({
  percentage,
  animated = true,
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const formatPercentage = (value: number) => {
    if (value < 1) {
      return value.toFixed(2);
    } else if (value < 10) {
      return value.toFixed(1);
    } else {
      return Math.floor(value).toString();
    }
  };
  useEffect(() => {
    if (animated) {
      let animationFrame: number;
      let start: number | null = null;
      const duration = 10; // ms
      const initial = displayPercentage;
      const delta = percentage - initial;
      function animateFill(ts: number) {
        if (start === null) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayPercentage(initial + delta * progress);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateFill);
        } else {
          setDisplayPercentage(percentage);
        }
      }
      animationFrame = requestAnimationFrame(animateFill);
      return () => cancelAnimationFrame(animationFrame);
    } else {
      setDisplayPercentage(percentage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, animated]);

  const clampedPercentage = Math.max(0, Math.min(100, displayPercentage));

  return (
    <div className="flex flex-col items-center justify-center space-y-2 lg:space-y-3">
      <style>{`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .float-animation {
          animation: floatUpDown 3s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .float-animation {
            animation: floatUpDown 4s ease-in-out infinite;
          }
        }
      `}</style>

      {/* Termômetro Principal Compacto */}
      <div className="relative">
        <div className="relative w-4 h-40 sm:w-5 sm:h-48 md:w-6 md:h-56 lg:w-7 lg:h-64 bg-gray-200 rounded-full overflow-hidden border border-gray-300 shadow-sm">
          {/* Preenchimento animado com float */}
          <div
            className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000 ease-out float-animation shadow-md"
            style={{
              height: `${clampedPercentage}%`,
              minHeight: clampedPercentage > 0 ? "8px" : "0px",
              background: "linear-gradient(180deg, #34d399 0%, #059669 100%)",
              boxShadow: "0 2px 8px 0 rgba(52, 211, 153, 0.15)",
            }}
          />
        </div>
      </div>

      {/* Indicador de percentual compacto */}
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200"
        style={{
          background: "linear-gradient(135deg, #34d399 0%, #059669 100%)"
        }}
      >
        <span className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">
          {formatPercentage(clampedPercentage)}%
        </span>
      </div>
    </div>
  );
};
