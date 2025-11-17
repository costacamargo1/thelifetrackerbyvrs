import React from "react";

export default function LifeTrackerIconOnly() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
      style={{ display: "block" }}
    >
      <g>
        <circle cx="20" cy="20" r="18" fill="url(#grad2)" opacity="0.1" />
        <circle cx="20" cy="20" r="15" stroke="url(#grad2)" strokeWidth="2" fill="none" />

        <path
          d="M 8 24 L 14 18 L 20 14 L 26 10 L 32 6"
          stroke="url(#grad2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <circle cx="14" cy="18" r="2" fill="#10B981" />
        <circle cx="20" cy="14" r="2" fill="#10B981" />
        <circle cx="26" cy="10" r="2.5" fill="#10B981" />

        <circle cx="26" cy="10" r="6" fill="#10B981" opacity="0.25">
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}
