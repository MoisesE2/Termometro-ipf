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
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animated]);

  const clampedPercentage = Math.max(0, Math.min(100, displayPercentage));

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <style>{`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .float-animation {
          animation: floatUpDown 3s ease-in-out infinite;
        }
      `}</style>

      {/* Termômetro Principal */}
      <div className="relative">
        <div className="relative w-8 h-96 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
          {/* Preenchimento animado com float */}
          <div
            className="absolute bottom-0 left-0 w-full bg-[#1F5830] rounded-full transition-all duration-1000 ease-out float-animation"
            style={{
              height: `${clampedPercentage}%`,
              minHeight: clampedPercentage > 0 ? "16px" : "0px",
            }}
          />
        </div>
      </div>

      {/* Indicador de percentual */}
      <div className="w-20 h-20 bg-[#1F5830] rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">
          {formatPercentage(clampedPercentage)}%
        </span>
      </div>
    </div>
  );
};
