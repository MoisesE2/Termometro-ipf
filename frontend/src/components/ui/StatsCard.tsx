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
    <div className="bg-gray-50/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:bg-white border border-gray-100">
      {/* Ícone */}
      <div className="text-teal-500 mb-4 transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      
      {/* Título */}
      <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
        {title}
      </h3>
      
      {/* Valor principal */}
      <div className={`text-2xl font-bold text-gray-800 mb-1 ${animated ? 'transition-all duration-500' : ''}`}>
        {value}
      </div>
      
      {/* Subtítulo opcional */}
      {subtitle && (
        <p className="text-xs text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}; 