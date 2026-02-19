import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  manualHeight?: string; // e.g., "h-20", "h-[100px]", "h-14"
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', manualHeight }) => {
  // Map our size props to heights if manualHeight isn't provided
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
  };

  const finalHeightClass = manualHeight || sizeClasses[size];

  return (
    <div className={`inline-flex items-center justify-center bg-[#FFF8EE] rounded-2xl p-1 shadow-sm transition-transform hover:scale-105 ${className}`}>
      <img 
        src="https://i.postimg.cc/5tJ5zDKr/Whats-App-Image-2026-02-12-at-18-59-03-(2).jpg" 
        alt="Amie's Homemade Logo" 
        className={`w-auto object-contain mix-blend-multiply ${finalHeightClass}`}
        loading="eager"
      />
    </div>
  );
};

export default Logo;