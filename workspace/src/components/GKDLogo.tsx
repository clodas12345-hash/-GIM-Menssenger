import React from 'react';

interface GKDLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'badge';
  size?: 'sm' | 'md' | 'lg';
}

export const GKDLogo: React.FC<GKDLogoProps> = ({ className = '', variant = 'compact', size = 'md' }) => {
  if (variant === 'compact') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0F1115] to-[#1A1D23] rounded-xl p-1.5 shadow-md border border-[#A88B4B]/30 shrink-0 ${className}`}>
        <svg viewBox="0 0 120 100" className="w-full h-8 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="compactBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0052cc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="compactDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#A88B4B" />
            </linearGradient>
          </defs>

          {/* G */}
          <text x="0" y="74" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="72" fill="url(#compactDarkGrad)" letterSpacing="-3">G</text>
          
          {/* K */}
          <text x="42" y="74" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="72" fill="url(#compactDarkGrad)" letterSpacing="-3">K</text>

          {/* D */}
          <text x="84" y="74" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="72" fill="url(#compactDarkGrad)" letterSpacing="-3">D</text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-b from-[#15181E] to-[#0F1115] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#A88B4B]/30 text-white flex flex-col items-center text-center select-none ${className}`}>
      {/* Brand Header with G, K, D */}
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 320 110" className="w-full max-w-[280px] sm:max-w-[320px] h-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fullBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0052cc" />
              <stop offset="60%" stopColor="#0066ff" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="fullDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#A88B4B" />
            </linearGradient>
          </defs>

          {/* G */}
          <text x="8" y="82" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="90" fill="url(#fullDarkGrad)" letterSpacing="-4">G</text>
          
          {/* K */}
          <text x="110" y="82" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="90" fill="url(#fullDarkGrad)" letterSpacing="-4">K</text>

          {/* D */}
          <text x="210" y="82" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="90" fill="url(#fullDarkGrad)" letterSpacing="-4">D</text>
        </svg>
      </div>

      {/* Subtitle with side lines */}
      <div className="flex items-center gap-3 w-full my-3">
        <div className="h-[1px] bg-[#1F2229] flex-1"></div>
        <span className="text-xs sm:text-sm font-bold tracking-[0.35em] text-[#A88B4B] uppercase">
          M O B I L I T Y
        </span>
        <div className="h-[1px] bg-[#1F2229] flex-1"></div>
      </div>

      {/* Taglines */}
      <p className="text-sm sm:text-base font-bold text-white tracking-wide mt-1">
        Dirija seu futuro.
      </p>
      <p className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide mt-1.5">
        Compromisso com o seu crescimento.
      </p>
    </div>
  );
};

export const GkbLogo = GKDLogo;
