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
      {/* Termômetro Principal */}
      <div className="relative">
        {/* Container do termômetro */}
        <div className="relative w-8 h-96 bg-gray-200 rounded-full overflow-hidden">
          {/* Preenchimento animado */}
          <div
            className="absolute bottom-0 left-0 w-full bg-[#1F5830] rounded-full transition-all duration-1000 ease-out"
            style={{
              height: `${clampedPercentage}%`,
              minHeight: clampedPercentage > 0 ? "16px" : "0px",
            }}
          />
        </div>

        {/* Bulbo inferior */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-[#1F5830] rounded-full" />
      </div>

      {/* Indicador de percentual */}
      <div className="w-20 h-20 bg-[#1F5830] rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">
          {Math.round(clampedPercentage)}%
        </span>
      </div>
    </div>
  );
};
