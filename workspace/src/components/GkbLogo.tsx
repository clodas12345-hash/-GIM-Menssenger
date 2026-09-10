import React from 'react';

interface GkbLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'badge';
}

export const GkbLogo: React.FC<GkbLogoProps> = ({ className = '', variant = 'compact' }) => {
  if (variant === 'compact') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-white to-slate-50 rounded-xl p-1.5 shadow-md border border-slate-200/80 shrink-0 ${className}`}>
        <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="compactBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0052cc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="compactDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e3a8a" />
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
    <div className={`bg-gradient-to-b from-white to-slate-50/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 text-slate-900 flex flex-col items-center text-center select-none ${className}`}>
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
              <stop offset="0%" stopColor="#0c2340" />
              <stop offset="100%" stopColor="#1e293b" />
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
        <div className="h-[1px] bg-slate-300 flex-1"></div>
        <span className="text-xs sm:text-sm font-bold tracking-[0.35em] text-blue-600 uppercase">
          M O B I L I T Y
        </span>
        <div className="h-[1px] bg-slate-300 flex-1"></div>
      </div>

      {/* Taglines */}
      <p className="text-sm sm:text-base font-bold text-[#0c2340] tracking-wide mt-1">
        Dirija seu futuro.
      </p>
      <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide mt-1.5">
        Compromisso com o seu crescimento.
      </p>
    </div>
  );
};
