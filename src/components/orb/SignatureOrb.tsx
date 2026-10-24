import React, { useState } from 'react';

interface SignatureOrbProps {
  onActivate?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isListening?: boolean;
  isInvestigating?: boolean;
  className?: string;
}

export const SignatureOrb: React.FC<SignatureOrbProps> = ({
  onActivate,
  size = 'lg',
  isListening = false,
  isInvestigating = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Responsive dimensions based on size
  const sizeMap = {
    sm: { container: 'w-24 h-24', radius: 44, iconSize: 24 },
    md: { container: 'w-48 h-48 sm:w-56 sm:h-56', radius: 95, iconSize: 42 },
    lg: { container: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96', radius: 140, iconSize: 64 }
  };

  const currentSize = sizeMap[size];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Activate SignalTrace AI Investigation Console"
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer select-none group flex items-center justify-center transition-transform duration-500 outline-none focus-visible:ring-2 focus-visible:ring-signal-cyan/80 focus-visible:ring-offset-4 focus-visible:ring-offset-obsidian rounded-full ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${currentSize.container} ${className}`}
    >
      {/* Outer ambient blur aura */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none ${
          isInvestigating
            ? 'opacity-85 animate-pulse bg-gradient-to-tr from-signal-magenta/40 via-signal-blue/30 to-signal-cyan/40 blur-2xl'
            : isListening
            ? 'opacity-90 bg-gradient-to-r from-signal-cyan/50 via-signal-magenta/40 to-signal-blue/50 blur-3xl animate-pulse'
            : isHovered
            ? 'opacity-70 bg-gradient-to-br from-signal-cyan/35 via-signal-blue/25 to-signal-magenta/30 blur-2xl'
            : 'opacity-40 bg-gradient-to-br from-signal-cyan/20 via-signal-blue/15 to-signal-magenta/20 blur-xl'
        }`}
      />

      {/* SVG Layer: Multi-layered concentric luminous rings and orbital arcs */}
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full relative z-10 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="orbRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#39CFFF" stop-opacity="0.9" />
            <stop offset="50%" stop-color="#3478FF" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#FF2FB3" stop-opacity="0.8" />
          </linearGradient>

          <linearGradient id="orbRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FF2FB3" stop-opacity="0.8" />
            <stop offset="70%" stop-color="#39CFFF" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#3478FF" stop-opacity="0.9" />
          </linearGradient>

          <radialGradient id="orbCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#07080D" stop-opacity="0.95" />
            <stop offset="40%" stop-color="#11131E" stop-opacity="0.9" />
            <stop offset="75%" stop-color="#171A25" stop-opacity="0.8" />
            <stop offset="90%" stop-color="#3478FF" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#39CFFF" stop-opacity="0.6" />
          </radialGradient>

          <radialGradient id="innerLightingGrad" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#39CFFF" stop-opacity={isListening ? "0.6" : "0.35"} />
            <stop offset="50%" stop-color="#3478FF" stop-opacity="0.2" />
            <stop offset="85%" stop-color="#FF2FB3" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#07080D" stop-opacity="0.1" />
          </radialGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle boundary ring */}
        <circle
          cx="160"
          cy="160"
          r="152"
          fill="none"
          stroke="#23293D"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* Orbit Ring 1: Curved dashed ring spinning clockwise */}
        <g className="animate-orbit-slow origin-center">
          <circle
            cx="160"
            cy="160"
            r="142"
            fill="none"
            stroke="url(#orbRingGrad1)"
            strokeWidth="1.5"
            strokeDasharray="40 18 8 18 120 22"
            strokeOpacity={isHovered ? "0.95" : "0.75"}
            filter="url(#glowFilter)"
          />
          {/* Orbital Satellite Node */}
          <circle cx="302" cy="160" r="3" fill="#39CFFF" filter="url(#glowFilter)" />
          <circle cx="18" cy="160" r="2.5" fill="#FF2FB3" filter="url(#glowFilter)" />
        </g>

        {/* Orbit Ring 2: Counter-rotating secondary ring */}
        <g className="animate-orbit-reverse origin-center">
          <circle
            cx="160"
            cy="160"
            r="124"
            fill="none"
            stroke="url(#orbRingGrad2)"
            strokeWidth="1.2"
            strokeDasharray="18 12 60 16 35 12"
            strokeOpacity={isHovered ? "0.85" : "0.6"}
          />
          <circle cx="160" cy="36" r="2.5" fill="#3478FF" filter="url(#glowFilter)" />
          <circle cx="160" cy="284" r="3" fill="#39CFFF" filter="url(#glowFilter)" />
        </g>

        {/* Orbit Ring 3: Elliptical tilted luminous arc */}
        <g className="origin-center" style={{ transform: 'rotate(35deg)' }}>
          <ellipse
            cx="160"
            cy="160"
            rx="110"
            ry="92"
            fill="none"
            stroke="#39CFFF"
            strokeWidth="1"
            strokeDasharray="14 30 70 20"
            strokeOpacity="0.45"
          />
        </g>

        {/* Translucent Glass-like Shell */}
        <circle
          cx="160"
          cy="160"
          r="98"
          fill="url(#orbCoreGrad)"
          stroke="#3478FF"
          strokeWidth="1.5"
          strokeOpacity={isHovered ? "0.7" : "0.4"}
          className="backdrop-blur-md"
        />

        {/* Inner Lighting Glow Overlay */}
        <circle
          cx="160"
          cy="160"
          r="92"
          fill="url(#innerLightingGrad)"
          filter="url(#coreGlow)"
        />

        {/* Tiny Floating Particles in the Darker Center */}
        <g className="origin-center animate-pulse-subtle">
          <circle cx="138" cy="142" r="1.5" fill="#39CFFF" opacity="0.8" />
          <circle cx="178" cy="135" r="1.8" fill="#FF2FB3" opacity="0.75" />
          <circle cx="152" cy="182" r="1.4" fill="#3478FF" opacity="0.85" />
          <circle cx="188" cy="172" r="1.2" fill="#39CFFF" opacity="0.9" />
          <circle cx="126" cy="168" r="1.6" fill="#FF2FB3" opacity="0.7" />
          <circle cx="166" cy="120" r="1.3" fill="#FFFFFF" opacity="0.6" />
        </g>

        {/* Central SignalTrace Symbol (Precision Geometric Path) */}
        <g className="transition-transform duration-300 transform group-hover:scale-105 origin-center">
          {/* Central dark circular badge with cyan rim */}
          <circle
            cx="160"
            cy="160"
            r="38"
            fill="#07080D"
            stroke="#39CFFF"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            filter="url(#glowFilter)"
          />
          {/* Trace Vector: Detect -> Prove -> Resolve path */}
          <path
            d="M 136 174 L 150 144 L 164 162 L 184 134"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Signal Nodes on the Vector */}
          <circle cx="136" cy="174" r="3.2" fill="#39CFFF" />
          <circle cx="150" cy="144" r="2.8" fill="#3478FF" />
          <circle cx="164" cy="162" r="2.8" fill="#39CFFF" />
          <circle cx="184" cy="134" r="4" fill="#FF2FB3" filter="url(#glowFilter)" />
        </g>
      </svg>

      {/* Floating Hover Indicator Label */}
      <div
        className={`absolute -bottom-8 px-3.5 py-1 rounded-full bg-surface-dark/90 border border-surface-border text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all duration-300 pointer-events-none ${
          isHovered ? 'opacity-100 translate-y-0 text-signal-cyan border-signal-cyan/40 shadow-cyan-glow' : 'opacity-70 translate-y-1'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-signal-cyan animate-ping" />
        <span>Click or tap to investigate</span>
      </div>
    </div>
  );
};
