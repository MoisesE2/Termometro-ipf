'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  animated?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  animated = true
}) => {
  return (
    <div className="
  bg-gray-50/50 rounded-2xl p-6 flex flex-col items-center text-center
  transition-all duration-300 hover:shadow-md hover:bg-white border border-gray-100
  w-full max-w-[20rem] sm:max-w-[22rem] md:max-w-[24rem] lg:max-w-none
  mx-auto sm:mx-0
    ">
      {/* Ícone */}
      <div className="text-teal-500 mb-4 transition-transform duration-300 hover:scale-110 text-4xl sm:text-5xl">
        {icon}
      </div>

      {/* Título */}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide px-2">
        {title}
      </h3>

      {/* Valor principal */}
      <div className={`text-xl sm:text-2xl font-bold text-gray-800 mb-1 ${animated ? 'transition-all duration-500' : ''} px-2`}>
        {value}
      </div>

      {/* Subtítulo opcional */}
      {subtitle && (
        <p className="text-[10px] sm:text-xs text-gray-500 px-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
