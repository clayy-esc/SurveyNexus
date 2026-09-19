import React, { useState } from 'react';

export interface SurveyNexusLogoProps {
  /** Logo mark size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  /** Whether to render the 'SurveyNexus' wordmark alongside the mark */
  showText?: boolean;
  /** Subtitle to show below brand name (e.g. 'Cosmic Intelligence') */
  subtitle?: string;
  /** Whether to enable continuous ambient rotation and pulse */
  animated?: boolean;
  /** Whether hover triggers interactive speed-up and cosmic radiance */
  interactive?: boolean;
  /** Custom class for root container */
  className?: string;
  /** Custom class for the SVG element */
  svgClassName?: string;
  /** Custom class for the brand text */
  textClassName?: string;
  /** Click handler */
  onClick?: () => void;
}

const sizeMap = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
  '2xl': 84,
};

export const SurveyNexusLogo: React.FC<SurveyNexusLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  animated = true,
  interactive = true,
  className = '',
  svgClassName = '',
  textClassName = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const pxSize = typeof size === 'number' ? size : sizeMap[size] || 36;
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="SurveyNexus Logo"
    >
      {/* Galactic Icon Container */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-500 ease-out"
        style={{
          width: pxSize,
          height: pxSize,
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {/* Interactive Atmospheric Glow Nebula on Hover */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none blur-md"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(139, 92, 246, 0.35) 50%, transparent 75%)',
            opacity: isHovered ? 0.9 : animated ? 0.25 : 0,
            transform: isHovered ? 'scale(1.4)' : 'scale(1)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Master Milky Way Vector Mark */}
        <svg
          viewBox="0 0 200 200"
          width={pxSize}
          height={pxSize}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 ${svgClassName}`}
          style={{
            filter: isHovered
              ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.55)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.35))'
              : 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.25))',
            transition: 'filter 0.5s ease',
          }}
        >
          <defs>
            {/* Gradients with unique scoped IDs to avoid DOM collisions */}
            <linearGradient id={`snArm1-${uniqueId}`} x1="15%" y1="15%" x2="85%" y2="85%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="30%" stopColor="#6366f1" />
              <stop offset="65%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            <linearGradient id={`snArm2-${uniqueId}`} x1="85%" y1="85%" x2="15%" y2="15%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="35%" stopColor="#a855f7" />
              <stop offset="70%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id={`snOrbit-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.85" />
            </linearGradient>

            <radialGradient id={`snSingularity-${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#cffafe" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>

            <radialGradient id={`snNebula-${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="75%" stopColor="#ec4899" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>

            <filter id={`snGlow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id={`snStarGlow-${uniqueId}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Transparent Nebula Aura */}
          <circle cx="100" cy="100" r="82" fill={`url(#snNebula-${uniqueId})`} />

          {/* Rotating Galaxy Disc Group */}
          <g
            style={{
              transformOrigin: '100px 100px',
              animation: animated
                ? `celestialOrbitSpin ${isHovered ? '8s' : '40s'} linear infinite`
                : undefined,
              transition: 'animation-duration 0.8s ease',
            }}
          >
            {/* Orbital Survey Trajectory Ellipse */}
            <ellipse
              cx="100"
              cy="100"
              rx="68"
              ry="28"
              transform="rotate(-30 100 100)"
              stroke={`url(#snOrbit-${uniqueId})`}
              strokeWidth="2.2"
              strokeDasharray="3 6 12 6"
              fill="none"
              opacity={isHovered ? 0.95 : 0.75}
            />

            {/* Milky Way Barred Spiral Arm Alpha (North-West) */}
            <path
              d="M 32 64 C 42 34, 76 18, 114 22 C 150 26, 178 54, 180 92 C 182 124, 160 156, 130 166 C 104 174, 76 164, 62 144 C 52 130, 52 110, 64 96 C 76 82, 94 80, 108 88 C 118 94, 122 106, 118 116 C 114 122, 106 124, 100 122 C 94 120, 92 114, 94 108 C 96 102, 104 100, 108 102 C 102 98, 88 104, 86 114 C 84 128, 100 138, 116 134 C 136 128, 148 108, 144 88 C 140 64, 118 46, 92 46 C 62 46, 40 68, 38 98 C 36 120, 48 142, 66 156"
              stroke={`url(#snArm1-${uniqueId})`}
              strokeWidth={isHovered ? '8' : '7.5'}
              strokeLinecap="round"
              fill="none"
              filter={`url(#snGlow-${uniqueId})`}
            />

            {/* Milky Way Barred Spiral Arm Beta (South-East, S-N Nexus Flow) */}
            <path
              d="M 168 136 C 158 166, 124 182, 86 178 C 50 174, 22 146, 20 108 C 18 76, 40 44, 70 34 C 96 26, 124 36, 138 56 C 148 70, 148 90, 136 104 C 124 118, 106 120, 92 112 C 82 106, 78 94, 82 84 C 86 78, 94 76, 100 78 C 106 80, 108 86, 106 92 C 104 98, 96 100, 92 98 C 98 102, 112 96, 114 86 C 116 72, 100 62, 84 66 C 64 72, 52 92, 56 112 C 60 136, 82 154, 108 154 C 138 154, 160 132, 162 102 C 164 80, 152 58, 134 44"
              stroke={`url(#snArm2-${uniqueId})`}
              strokeWidth={isHovered ? '8' : '7.5'}
              strokeLinecap="round"
              fill="none"
              filter={`url(#snGlow-${uniqueId})`}
            />

            {/* Survey Constellation Nodes */}
            {/* Input Apex Node (North) */}
            <circle cx="32" cy="64" r="5.5" fill="#38bdf8" filter={`url(#snStarGlow-${uniqueId})`} />
            <circle cx="32" cy="64" r="2.8" fill="#ffffff" />

            {/* Insight Apex Node (South) */}
            <circle cx="168" cy="136" r="5.5" fill="#f43f5e" filter={`url(#snStarGlow-${uniqueId})`} />
            <circle cx="168" cy="136" r="2.8" fill="#ffffff" />

            {/* Orbit Node: Question/Enquiry (East) */}
            <circle cx="148" cy="62" r="4.2" fill="#a855f7" filter={`url(#snStarGlow-${uniqueId})`} />
            <circle cx="148" cy="62" r="2" fill="#ffffff" />

            {/* Orbit Node: Response/Metric (West) */}
            <circle cx="52" cy="138" r="4.2" fill="#38bdf8" filter={`url(#snStarGlow-${uniqueId})`} />
            <circle cx="52" cy="138" r="2" fill="#ffffff" />

            {/* Stardust Points */}
            <circle cx="86" cy="38" r="1.6" fill="#e0e7ff" opacity="0.9" />
            <circle cx="164" cy="92" r="1.6" fill="#fbcfe8" opacity="0.85" />
            <circle cx="114" cy="162" r="1.6" fill="#cffafe" opacity="0.9" />
            <circle cx="36" cy="108" r="1.6" fill="#fed7aa" opacity="0.85" />
          </g>

          {/* Central Singularity & Pulsar Diamond (Stationary Celestial Core) */}
          <g
            style={{
              transformOrigin: '100px 100px',
              animation: animated ? 'pulsarBreathe 3s ease-in-out infinite' : undefined,
            }}
          >
            <circle cx="100" cy="100" r={isHovered ? '26' : '23'} fill={`url(#snSingularity-${uniqueId})`} />
            <circle cx="100" cy="100" r="9" fill="#ffffff" filter={`url(#snStarGlow-${uniqueId})`} />

            {/* 4-Point Celestial Compass / Pulsar Star */}
            <path
              d="M 100 80 Q 100 100 80 100 Q 100 100 100 120 Q 100 100 120 100 Q 100 100 100 80 Z"
              fill="#ffffff"
            />
            <path
              d="M 100 87 Q 100 100 87 100 Q 100 100 100 113 Q 100 100 113 100 Q 100 100 100 87 Z"
              fill="#cffafe"
            />
            <circle cx="100" cy="100" r="3.2" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Brand Typography Lockup */}
      {showText && (
        <div className={`flex flex-col leading-tight ${textClassName}`}>
          <div className="flex items-baseline tracking-tight font-extrabold text-foreground transition-all duration-300">
            <span className="text-current">Survey</span>
            <span
              className="ml-0.5 bg-clip-text text-transparent transition-all duration-300"
              style={{
                backgroundImage: isHovered
                  ? 'linear-gradient(135deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)'
                  : 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%)',
              }}
            >
              Nexus
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Global CSS Keyframes injected once */}
      <style>{`
        @keyframes celestialOrbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulsarBreathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
