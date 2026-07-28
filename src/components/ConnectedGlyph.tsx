import React from "react";
import { ConnectedRendererSettings } from "../types";
import {
  generateGlyphGeometry,
  getColorThemeClasses,
} from "../utils/glyphPathGenerator";

interface ConnectedGlyphProps {
  glyphCode: string;
  englishChar?: string;
  settings?: Partial<ConnectedRendererSettings>;
  size?: "sm" | "md" | "lg" | "xl";
  isActive?: boolean; // Highlighted during audio playback
  onClick?: () => void;
  className?: string;
}

export const ConnectedGlyph: React.FC<ConnectedGlyphProps> = ({
  glyphCode,
  englishChar,
  settings = {},
  size = "md",
  isActive = false,
  onClick,
  className = "",
}) => {
  const {
    style = "junction",
    colorTheme = "amber",
    strokeWidth = 3.5,
    glowEffect = true,
    showLabels = true,
  }: Partial<ConnectedRendererSettings> = settings || {};

  const colors = getColorThemeClasses(colorTheme);
  const geometry = generateGlyphGeometry(glyphCode, style);

  // Size sizing classes
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-36 h-36",
  };

  const containerSizeClass = sizeMap[size] || sizeMap.md;

  // Filter ID for SVG drop-shadow glow (sanitized for SVG URL reference)
  const filterId = "glow-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition duration-200 select-none ${
        onClick ? "cursor-pointer hover:bg-slate-800/60" : ""
      } ${
        isActive
          ? "scale-105 bg-amber-500/10 border-2 border-amber-400 shadow-lg shadow-amber-500/30"
          : "border border-slate-800/80 bg-slate-950/60"
      } ${className}`}
    >
      <div className={`relative ${containerSizeClass} flex items-center justify-center`}>
        <svg
          viewBox={geometry.viewBox}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {glowEffect && (
              <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Optional Badge Frame */}
          {geometry.badgePath && (
            <path
              d={geometry.badgePath}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="opacity-30"
            />
          )}

          {/* Primary Connected Structural Strokes */}
          {geometry.pathD && (
            <path
              d={geometry.pathD}
              fill="none"
              stroke={isActive ? "#fef08a" : colors.stroke}
              strokeWidth={isActive ? strokeWidth + 1.5 : strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={glowEffect ? `url(#${filterId})` : undefined}
              className="transition-all duration-150"
            />
          )}

          {/* Secondary Structural Paths / Flourishes */}
          {geometry.secondaryPathD && (
            <path
              d={geometry.secondaryPathD}
              fill="none"
              stroke={isActive ? "#fef08a" : colors.stroke}
              strokeWidth={Math.max(1.5, strokeWidth - 1)}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            />
          )}

          {/* Optional Sigil Ring for Single Tap '.' */}
          {geometry.ring && (
            <circle
              cx={geometry.ring.cx}
              cy={geometry.ring.cy}
              r={geometry.ring.r}
              fill="none"
              stroke={isActive ? "#fef08a" : colors.stroke}
              strokeWidth={2}
              strokeDasharray="4 2"
              className="opacity-70"
              filter={glowEffect ? `url(#${filterId})` : undefined}
            />
          )}

          {/* Render Dots */}
          {geometry.dots.map((dot, idx) => (
            <circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r={isActive ? dot.r + 1 : dot.r}
              fill="#020617"
              stroke={isActive ? "#fef08a" : colors.stroke}
              strokeWidth={Math.min(3, strokeWidth)}
              filter={glowEffect ? `url(#${filterId})` : undefined}
            />
          ))}

          {/* Junction Points Markers (Runic / Wireframe) */}
          {style === "wireframe" &&
            geometry.junctions.map((j, i) => (
              <polygon
                key={i}
                points={`${j.x},${j.y - 4} ${j.x + 4},${j.y} ${j.x},${j.y + 4} ${j.x - 4},${j.y}`}
                fill={isActive ? "#fef08a" : colors.stroke}
              />
            ))}
        </svg>
      </div>

      {/* Symbol / Character Label */}
      {showLabels && (
        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono leading-none">
          {englishChar && (
            <span className="font-bold text-slate-200">{englishChar}</span>
          )}
          {englishChar && glyphCode && (
            <span className="text-slate-600">:</span>
          )}
          <span className={`font-semibold ${colors.textColor}`}>{glyphCode}</span>
        </div>
      )}
    </div>
  );
};
