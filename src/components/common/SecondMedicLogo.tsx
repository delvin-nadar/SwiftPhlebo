import React from 'react';

interface SecondMedicLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'white';
  height?: number | string;
  showTagline?: boolean;
  cityBadge?: boolean;
  iconOnly?: boolean;
}

export const SecondMedicLogo: React.FC<SecondMedicLogoProps> = ({
  className = '',
  variant = 'light',
  height = 42,
  showTagline = false,
  cityBadge = false,
  iconOnly = false
}) => {
  // Color configuration matching the official SecondMedic brand identity
  // "Second" in medical turquoise green (#16a6a0 / #059669), "Medic" in healthcare cyan blue (#087ea4 / #0284c7)
  const isDarkCanvas = variant === 'dark' || variant === 'white';
  const secondColor = isDarkCanvas && variant === 'white' ? '#ffffff' : '#14b8a6'; // teal/emerald
  const medicColor = isDarkCanvas && variant === 'white' ? '#38bdf8' : '#087ea4'; // cyan/blue
  const subtextColor = isDarkCanvas ? '#94a3b8' : '#64748b';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem Icon */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: height, width: 'auto', flexShrink: 0 }}
        className="drop-shadow-xs"
      >
        <defs>
          <linearGradient id="smPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d293" />
            <stop offset="50%" stopColor="#16a6a0" />
            <stop offset="100%" stopColor="#087ea4" />
          </linearGradient>
          <linearGradient id="smPulseGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00d293" />
            <stop offset="45%" stopColor="#087ea4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#087ea4" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Circular / Location-pin badge */}
        <path
          d="M 50 10 
             C 27.9 10 10 27.9 10 50 
             C 10 65.5 18.8 78.9 31.8 85.5 
             C 38 88.6 44 92 48 97 
             C 49.5 98.8 51.5 98.5 53 96.5 
             C 57 91.5 62.5 88.5 68.2 85.5 
             C 81.2 78.9 90 65.5 90 50 
             C 90 27.9 72.1 10 50 10 Z"
          fill={isDarkCanvas && variant === 'dark' ? '#0f172a' : '#ffffff'}
          stroke="url(#smPinGrad)"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Inner Crosshair / Stethoscope Ring Accent */}
        <circle
          cx="50"
          cy="48"
          r="26"
          fill="none"
          stroke={isDarkCanvas ? 'rgba(56,189,248,0.15)' : 'rgba(8,126,164,0.1)'}
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />

        {/* Vital ECG Heartbeat Wave through center */}
        <path
          d="M 2 48 
             H 28 
             L 36 48 
             L 41 30 
             L 47 66 
             L 54 22 
             L 60 58 
             L 65 44 
             L 70 48 
             H 98"
          stroke="url(#smPulseGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Central pulse origin node */}
        <circle cx="54" cy="22" r="3" fill="#0284c7" />
      </svg>

      {/* Wordmark Typography */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center space-x-1">
            <span
              className="font-extrabold tracking-tight"
              style={{
                fontSize: typeof height === 'number' ? Math.max(18, height * 0.58) : '24px',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              <span style={{ color: secondColor }}>Second</span>
              <span style={{ color: medicColor }}>Medic</span>
              <span style={{ color: medicColor, fontSize: '0.65em', verticalAlign: 'super', marginLeft: '2px', fontWeight: 900 }}>+</span>
            </span>

            {cityBadge && (
              <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ml-1.5 ${
                isDarkCanvas 
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800' 
                  : 'bg-[#e8f7fa] text-[#087ea4] border border-[#bcd8e2]'
              }`}>
                VIZAG
              </span>
            )}
          </div>

          {showTagline && (
            <span
              className="font-semibold tracking-normal mt-0.5"
              style={{
                fontSize: typeof height === 'number' ? Math.max(10, height * 0.24) : '11px',
                color: subtextColor
              }}
            >
              On-Demand Phlebotomy for Labs
            </span>
          )}
        </div>
      )}
    </div>
  );
};
