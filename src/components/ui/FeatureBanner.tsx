"use client";

import { ReactNode } from "react";

interface FeatureBannerProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export const FeatureBanner: React.FC<FeatureBannerProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="bg-[#F5FCF7] rounded-3xl p-10 flex flex-col md:flex-row items-center text-center md:text-left gap-10 transition-all duration-300 hover:shadow-xl hover:bg-white w-full h-full">
      {/* Ícone */}
      {icon && (
        <div className="text-[#0F4D2E] text-6xl md:text-7xl mb-6 md:mb-0 transition-transform duration-300 hover:scale-110">
          {icon}
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-[#0F4D2E] mb-4">{title}</h2>
        <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Botão */}
      <button
        onClick={onButtonClick}
        className="bg-[#0F4D2E] text-white px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:bg-[#1F5830] transition-all duration-300 cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  );
};
