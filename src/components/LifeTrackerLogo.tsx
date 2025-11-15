import React from "react";

type Props = {
  size?: number;
};

export default function LifeTrackerIcon({ size = 58 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fundo circular */}
      <circle cx="40" cy="40" r="36" fill="url(#gradIcon)" opacity="0.1" />
      <circle
        cx="40"
        cy="40"
        r="30"
        stroke="url(#gradIcon)"
        strokeWidth="3"
        fill="none"
      />

      {/* Gráfico */}
      <path
        d="M 16 48 L 28 36 L 40 28 L 52 20 L 64 12"
        stroke="url(#gradIcon)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Pontos */}
      <circle cx="28" cy="36" r="3.5" fill="#10B981" />
      <circle cx="40" cy="28" r="3.5" fill="#10B981" />
      <circle cx="52" cy="20" r="4.5" fill="#10B981" />

      {/* Animação do ponto principal */}
      <circle cx="52" cy="20" r="10" fill="#10B981" opacity="0.3">
        <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Gradiente */}
      <defs>
        <linearGradient id="gradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}
