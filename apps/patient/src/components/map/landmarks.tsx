/**
 * SVG Landmark illustrations for the Growth Garden module map.
 * Each landmark is a small (~80x80) SVG scene representing a therapy module.
 * Rendered in 4 status states via color props.
 */
import React from 'react';
import Svg, { Rect, Circle, Path, Ellipse, Line, G, Polygon } from 'react-native-svg';
import { Colors, FayColors } from '@/lib/constants';
import type { ModuleStatus } from '@fayth/types';

// ── Status-based color resolver ─────────────────────────────────────

interface LandmarkColors {
  wall: string;
  roof: string;
  accent: string;
  window: string;
  ground: string;
  detail: string;
}

function getStatusColors(status: ModuleStatus): LandmarkColors {
  switch (status) {
    case 'locked':
      return {
        wall: '#c8c5bf',
        roof: '#b0ada7',
        accent: '#9e9b95',
        window: '#d5d2cc',
        ground: '#d8d5cf',
        detail: '#b8b5af',
      };
    case 'assigned':
      return {
        wall: '#f5f0e8',
        roof: '#c9836a',
        accent: FayColors.glow,
        window: '#fef9e7',
        ground: '#a8d5b8',
        detail: Colors.primary,
      };
    case 'active':
      return {
        wall: '#faf5ed',
        roof: '#c9836a',
        accent: FayColors.glow,
        window: FayColors.spark,
        ground: '#7bc49a',
        detail: Colors.primary,
      };
    case 'complete':
      return {
        wall: '#faf5ed',
        roof: '#b8734e',
        accent: FayColors.glow,
        window: '#fef3c7',
        ground: Colors.primary,
        detail: FayColors.glow,
      };
  }
}

// ── Individual Landmarks ────────────────────────────────────────────

interface LandmarkProps {
  status: ModuleStatus;
  size?: number;
}

/** Module 1: Garden Gate — welcoming archway */
export function GardenGate({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Ground */}
      <Ellipse cx="40" cy="72" rx="36" ry="8" fill={c.ground} opacity={0.5} />
      {/* Left pillar */}
      <Rect x="14" y="24" width="10" height="48" rx="2" fill={c.wall} />
      {/* Right pillar */}
      <Rect x="56" y="24" width="10" height="48" rx="2" fill={c.wall} />
      {/* Arch */}
      <Path d="M14 28 Q40 4 66 28" stroke={c.roof} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Lantern */}
      <Circle cx="40" cy="18" r="5" fill={c.window} />
      <Line x1="40" y1="12" x2="40" y2="8" stroke={c.accent} strokeWidth="1.5" />
      {/* Path through gate */}
      <Path d="M32 72 Q40 58 48 72" fill={c.detail} opacity={0.3} />
      {/* Ivy dots */}
      {status !== 'locked' && (
        <>
          <Circle cx="12" cy="36" r="2.5" fill={c.ground} />
          <Circle cx="10" cy="44" r="2" fill={c.ground} />
          <Circle cx="68" cy="40" r="2.5" fill={c.ground} />
        </>
      )}
    </Svg>
  );
}

/** Module 2: Reflecting Pool — self-assessment */
export function ReflectingPool({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="70" rx="36" ry="8" fill={c.ground} opacity={0.4} />
      {/* Pool basin */}
      <Ellipse cx="40" cy="52" rx="28" ry="14" fill={c.wall} />
      <Ellipse cx="40" cy="50" rx="24" ry="11" fill={status === 'locked' ? c.window : '#a8d4e6'} />
      {/* Reflection shimmer */}
      {status !== 'locked' && (
        <>
          <Ellipse cx="34" cy="48" rx="6" ry="2" fill="#ffffff" opacity={0.4} />
          <Ellipse cx="46" cy="52" rx="4" ry="1.5" fill="#ffffff" opacity={0.3} />
        </>
      )}
      {/* Stepping stones */}
      <Circle cx="20" cy="38" r="4" fill={c.roof} />
      <Circle cx="32" cy="32" r="3.5" fill={c.roof} />
      <Circle cx="46" cy="30" r="3.5" fill={c.roof} />
      <Circle cx="58" cy="36" r="4" fill={c.roof} />
      {/* Reeds */}
      <Line x1="64" y1="46" x2="66" y2="28" stroke={c.detail} strokeWidth="1.5" />
      <Line x1="68" y1="48" x2="70" y2="32" stroke={c.detail} strokeWidth="1.5" />
      <Circle cx="66" cy="27" r="2" fill={c.detail} />
      <Circle cx="70" cy="31" r="2" fill={c.detail} />
    </Svg>
  );
}

/** Module 3: Herbalist Shelf — treatment overview */
export function HerbalistShelf({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="72" rx="34" ry="7" fill={c.ground} opacity={0.4} />
      {/* Table */}
      <Rect x="12" y="44" width="56" height="6" rx="2" fill={c.roof} />
      {/* Legs */}
      <Rect x="16" y="50" width="4" height="22" fill={c.roof} />
      <Rect x="60" y="50" width="4" height="22" fill={c.roof} />
      {/* Awning */}
      <Path d="M8 26 L40 14 L72 26 L72 30 L8 30 Z" fill={c.wall} />
      <Path d="M8 30 Q20 36 28 30 Q36 36 44 30 Q52 36 60 30 Q68 36 72 30" fill={c.roof} stroke={c.roof} strokeWidth="1" />
      {/* Jars */}
      <Rect x="18" y="32" width="10" height="12" rx="3" fill={status === 'locked' ? c.window : '#d4eacc'} />
      <Rect x="34" y="30" width="10" height="14" rx="3" fill={status === 'locked' ? c.window : '#e8d4c8'} />
      <Rect x="50" y="32" width="10" height="12" rx="3" fill={status === 'locked' ? c.window : '#c8d8ea'} />
      {/* Jar lids */}
      <Rect x="18" y="30" width="10" height="3" rx="1" fill={c.accent} />
      <Rect x="34" y="28" width="10" height="3" rx="1" fill={c.accent} />
      <Rect x="50" y="30" width="10" height="3" rx="1" fill={c.accent} />
    </Svg>
  );
}

/** Module 4: Lighthouse — memory & attention */
export function Lighthouse({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="74" rx="30" ry="6" fill={c.ground} opacity={0.4} />
      {/* Tower body */}
      <Path d="M30 72 L34 24 L46 24 L50 72 Z" fill={c.wall} />
      {/* Stripes */}
      <Rect x="33" y="36" width="14" height="4" fill={c.roof} />
      <Rect x="32" y="52" width="16" height="4" fill={c.roof} />
      {/* Lantern room */}
      <Rect x="32" y="18" width="16" height="8" rx="1" fill={c.roof} />
      {/* Windows */}
      <Rect x="34" y="20" width="4" height="4" rx="1" fill={c.window} />
      <Rect x="42" y="20" width="4" height="4" rx="1" fill={c.window} />
      {/* Dome */}
      <Path d="M32 18 Q40 8 48 18" fill={c.roof} />
      {/* Beacon light */}
      <Circle cx="40" cy="14" r="3" fill={status === 'active' ? FayColors.glow : c.accent} opacity={status === 'locked' ? 0.3 : 0.9} />
      {/* Light beam (active/complete only) */}
      {(status === 'active' || status === 'complete') && (
        <Path d="M43 14 L70 6 L68 16 Z" fill={FayColors.glow} opacity={0.2} />
      )}
      {/* Door */}
      <Path d="M36 72 L36 62 Q40 58 44 62 L44 72 Z" fill={c.roof} />
    </Svg>
  );
}

/** Module 5: Sundial Garden — time management */
export function SundialGarden({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="72" rx="34" ry="8" fill={c.ground} opacity={0.4} />
      {/* Paved circle */}
      <Circle cx="40" cy="50" r="24" fill={c.wall} opacity={0.6} />
      <Circle cx="40" cy="50" r="22" fill={c.wall} opacity={0.3} stroke={c.roof} strokeWidth="1" />
      {/* Sundial pedestal */}
      <Rect x="36" y="42" width="8" height="18" fill={c.roof} />
      {/* Sundial top */}
      <Ellipse cx="40" cy="42" rx="12" ry="4" fill={c.wall} stroke={c.accent} strokeWidth="1" />
      {/* Gnomon (shadow caster) */}
      <Polygon points="40,34 42,42 38,42" fill={c.accent} />
      {/* Shadow */}
      <Line x1="40" y1="42" x2="50" y2="38" stroke={c.detail} strokeWidth="1.5" opacity={0.4} />
      {/* Flower positions (clock-like) */}
      {status !== 'locked' && (
        <>
          <Circle cx="40" cy="28" r="3" fill="#e8c4d4" />
          <Circle cx="56" cy="34" r="2.5" fill="#d4e8c4" />
          <Circle cx="60" cy="50" r="3" fill="#c4d4e8" />
          <Circle cx="56" cy="64" r="2.5" fill="#e8d4c4" />
          <Circle cx="40" cy="70" r="3" fill="#d4c4e8" />
          <Circle cx="24" cy="64" r="2.5" fill="#c4e8d4" />
          <Circle cx="20" cy="50" r="3" fill="#e8e4c4" />
          <Circle cx="24" cy="34" r="2.5" fill="#e8c4c4" />
        </>
      )}
    </Svg>
  );
}

/** Module 6: Puzzle Bridge — problem solving */
export function PuzzleBridge({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Stream */}
      <Path d="M0 56 Q20 50 40 56 Q60 62 80 56 L80 72 L0 72 Z" fill={status === 'locked' ? c.window : '#a8d4e6'} opacity={0.6} />
      {/* Bridge arch */}
      <Path d="M10 56 Q40 24 70 56" stroke={c.roof} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Bridge deck */}
      <Path d="M10 56 Q40 28 70 56" stroke={c.wall} strokeWidth="3" fill="none" />
      {/* Railings */}
      <Line x1="20" y1="48" x2="20" y2="40" stroke={c.roof} strokeWidth="2" />
      <Line x1="34" y1="36" x2="34" y2="28" stroke={c.roof} strokeWidth="2" />
      <Line x1="46" y1="36" x2="46" y2="28" stroke={c.roof} strokeWidth="2" />
      <Line x1="60" y1="48" x2="60" y2="40" stroke={c.roof} strokeWidth="2" />
      {/* Puzzle piece pattern on arch */}
      {status !== 'locked' && (
        <>
          <Circle cx="28" cy="40" r="3" fill={c.detail} opacity={0.3} />
          <Circle cx="40" cy="32" r="3" fill={c.detail} opacity={0.3} />
          <Circle cx="52" cy="40" r="3" fill={c.detail} opacity={0.3} />
        </>
      )}
      {/* Banks */}
      <Ellipse cx="8" cy="60" rx="14" ry="6" fill={c.ground} />
      <Ellipse cx="72" cy="60" rx="14" ry="6" fill={c.ground} />
    </Svg>
  );
}

/** Module 7: Bamboo Gate — impulsivity / mindfulness */
export function BambooGate({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="72" rx="34" ry="7" fill={c.ground} opacity={0.4} />
      {/* Left pole */}
      <Rect x="18" y="20" width="5" height="52" rx="2.5" fill={status === 'locked' ? c.wall : '#8fbc6a'} />
      {/* Right pole */}
      <Rect x="57" y="20" width="5" height="52" rx="2.5" fill={status === 'locked' ? c.wall : '#8fbc6a'} />
      {/* Top crossbar */}
      <Rect x="14" y="18" width="52" height="5" rx="2.5" fill={c.roof} />
      {/* Second crossbar */}
      <Rect x="18" y="30" width="44" height="3" rx="1.5" fill={c.roof} />
      {/* Wind chime */}
      {status !== 'locked' && (
        <>
          <Line x1="40" y1="30" x2="40" y2="44" stroke={c.accent} strokeWidth="1" />
          <Rect x="36" y="44" width="8" height="3" rx="1" fill={c.accent} />
          <Line x1="37" y1="47" x2="37" y2="52" stroke={c.detail} strokeWidth="0.8" />
          <Line x1="40" y1="47" x2="40" y2="54" stroke={c.detail} strokeWidth="0.8" />
          <Line x1="43" y1="47" x2="43" y2="52" stroke={c.detail} strokeWidth="0.8" />
        </>
      )}
      {/* Sand circle at base */}
      <Ellipse cx="40" cy="66" rx="16" ry="5" fill={c.wall} opacity={0.4} />
    </Svg>
  );
}

/** Module 8: Gathering Bench — social relationships */
export function GatheringBench({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Tree canopy */}
      <Circle cx="40" cy="20" r="18" fill={status === 'locked' ? c.window : '#6aaa6a'} />
      <Circle cx="30" cy="26" r="12" fill={status === 'locked' ? c.wall : '#7dba7d'} />
      <Circle cx="50" cy="24" r="14" fill={status === 'locked' ? c.wall : '#5d9e5d'} />
      {/* Trunk */}
      <Rect x="37" y="34" width="6" height="24" fill={c.roof} />
      {/* Bench */}
      <Path d="M16 62 L64 62" stroke={c.wall} strokeWidth="4" strokeLinecap="round" />
      <Rect x="20" y="62" width="3" height="8" fill={c.roof} />
      <Rect x="57" y="62" width="3" height="8" fill={c.roof} />
      {/* Lanterns */}
      {status !== 'locked' && (
        <>
          <Circle cx="28" cy="30" r="3" fill={c.window} opacity={0.7} />
          <Circle cx="52" cy="28" r="3" fill={c.window} opacity={0.7} />
          <Line x1="28" y1="27" x2="30" y2="22" stroke={c.detail} strokeWidth="0.8" />
          <Line x1="52" y1="25" x2="50" y2="20" stroke={c.detail} strokeWidth="0.8" />
        </>
      )}
    </Svg>
  );
}

/** Module 9: Still Clearing — anxiety */
export function StillClearing({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Spiral stones */}
      <Circle cx="40" cy="50" r="26" fill={c.wall} opacity={0.3} />
      <Path
        d="M40 50 Q48 44 52 50 Q56 58 48 62 Q38 68 32 58 Q26 48 36 42 Q46 36 54 44"
        stroke={c.roof}
        strokeWidth="2"
        fill="none"
        opacity={0.6}
      />
      {/* Center lamp */}
      <Circle cx="40" cy="50" r="4" fill={c.window} />
      <Rect x="39" y="42" width="2" height="4" fill={c.accent} />
      {/* Flame */}
      {status !== 'locked' && (
        <Path d="M40 40 Q38 36 40 32 Q42 36 40 40" fill={c.accent} opacity={0.7} />
      )}
      {/* Smooth stones at edges */}
      <Ellipse cx="18" cy="58" rx="6" ry="4" fill={c.roof} opacity={0.4} />
      <Ellipse cx="62" cy="54" rx="5" ry="3" fill={c.roof} opacity={0.4} />
    </Svg>
  );
}

/** Module 10: Forge — frustration & anger */
export function Forge({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="72" rx="32" ry="7" fill={c.ground} opacity={0.4} />
      {/* Main structure */}
      <Rect x="18" y="36" width="44" height="36" rx="3" fill={c.wall} />
      {/* Chimney */}
      <Rect x="50" y="12" width="8" height="28" fill={c.roof} />
      {/* Forge opening */}
      <Path d="M24 72 L24 52 Q40 46 56 52 L56 72 Z" fill={status === 'locked' ? c.accent : '#3d2a1a'} />
      {/* Fire glow inside */}
      {status !== 'locked' && (
        <>
          <Ellipse cx="40" cy="64" rx="12" ry="6" fill="#e08a52" opacity={0.7} />
          <Ellipse cx="40" cy="62" rx="8" ry="4" fill={c.window} opacity={0.6} />
        </>
      )}
      {/* Smoke puffs (active/complete) */}
      {(status === 'active' || status === 'complete') && (
        <>
          <Circle cx="54" cy="8" r="4" fill={c.wall} opacity={0.3} />
          <Circle cx="56" cy="2" r="3" fill={c.wall} opacity={0.2} />
        </>
      )}
      {/* Anvil */}
      <Rect x="10" y="58" width="8" height="6" rx="1" fill={c.roof} />
      <Rect x="8" y="56" width="12" height="3" rx="1" fill={c.accent} />
    </Svg>
  );
}

/** Module 11: Rain Shelter / Greenhouse — low mood */
export function Greenhouse({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="72" rx="34" ry="7" fill={c.ground} opacity={0.4} />
      {/* Greenhouse frame */}
      <Rect x="14" y="32" width="52" height="40" rx="2" fill={c.wall} opacity={0.8} />
      {/* Glass panels */}
      <Rect x="18" y="36" width="20" height="16" rx="1" fill={status === 'locked' ? c.window : '#d4ead0'} opacity={0.6} />
      <Rect x="42" y="36" width="20" height="16" rx="1" fill={status === 'locked' ? c.window : '#d4ead0'} opacity={0.6} />
      <Rect x="18" y="56" width="20" height="12" rx="1" fill={status === 'locked' ? c.window : '#c8e4c4'} opacity={0.6} />
      <Rect x="42" y="56" width="20" height="12" rx="1" fill={status === 'locked' ? c.window : '#c8e4c4'} opacity={0.6} />
      {/* Roof */}
      <Path d="M12 32 L40 16 L68 32 Z" fill={c.wall} stroke={c.roof} strokeWidth="1.5" />
      {/* Flowers inside */}
      {status !== 'locked' && (
        <>
          <Circle cx="26" cy="60" r="3" fill="#e8a0b4" />
          <Circle cx="34" cy="62" r="2.5" fill="#e8d4a0" />
          <Circle cx="48" cy="60" r="3" fill="#a0b4e8" />
          <Circle cx="56" cy="62" r="2.5" fill="#b4e8a0" />
        </>
      )}
      {/* Door */}
      <Rect x="35" y="56" width="10" height="16" rx="1" fill={c.roof} />
    </Svg>
  );
}

/** Module 12: Moon Cottage — sleep */
export function MoonCottage({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="74" rx="32" ry="6" fill={c.ground} opacity={0.4} />
      {/* Cottage body */}
      <Rect x="20" y="42" width="40" height="30" rx="3" fill={c.wall} />
      {/* Roof */}
      <Path d="M16 44 L40 22 L64 44 Z" fill={c.roof} />
      {/* Round window */}
      <Circle cx="40" cy="36" r="5" fill={c.window} stroke={c.roof} strokeWidth="1" />
      <Line x1="40" y1="31" x2="40" y2="41" stroke={c.roof} strokeWidth="0.8" />
      <Line x1="35" y1="36" x2="45" y2="36" stroke={c.roof} strokeWidth="0.8" />
      {/* Door */}
      <Path d="M34 72 L34 58 Q40 54 46 58 L46 72 Z" fill={c.roof} />
      {/* Window glow */}
      <Rect x="24" y="50" width="8" height="8" rx="1" fill={c.window} />
      <Rect x="48" y="50" width="8" height="8" rx="1" fill={c.window} />
      {/* Moon weathervane */}
      <Line x1="40" y1="22" x2="40" y2="12" stroke={c.accent} strokeWidth="1.5" />
      <Path d="M38 8 Q36 12 38 16 Q44 14 42 10 Q40 6 38 8" fill={c.accent} />
      {/* Stars */}
      {status !== 'locked' && (
        <>
          <Circle cx="18" cy="14" r="1.5" fill={c.accent} opacity={0.6} />
          <Circle cx="62" cy="10" r="1.5" fill={c.accent} opacity={0.5} />
          <Circle cx="70" cy="20" r="1" fill={c.accent} opacity={0.4} />
          <Circle cx="12" cy="24" r="1" fill={c.accent} opacity={0.4} />
        </>
      )}
    </Svg>
  );
}

/** Module 13: Clear Spring — substance misuse */
export function ClearSpring({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Rock formation */}
      <Path d="M20 30 L10 70 L70 70 L60 30 Q40 20 20 30 Z" fill={c.roof} opacity={0.6} />
      {/* Waterfall */}
      <Rect x="34" y="28" width="12" height="30" rx="4" fill={status === 'locked' ? c.window : '#b8dcea'} opacity={0.7} />
      {/* Pool at base */}
      <Ellipse cx="40" cy="62" rx="22" ry="8" fill={status === 'locked' ? c.window : '#a8d4e6'} />
      {/* Water shimmer */}
      {status !== 'locked' && (
        <>
          <Ellipse cx="34" cy="60" rx="6" ry="2" fill="#ffffff" opacity={0.3} />
          <Ellipse cx="48" cy="64" rx="4" ry="1.5" fill="#ffffff" opacity={0.25} />
        </>
      )}
      {/* Splash lines */}
      {(status === 'active' || status === 'complete') && (
        <>
          <Line x1="36" y1="56" x2="30" y2="52" stroke="#ffffff" strokeWidth="1" opacity={0.4} />
          <Line x1="44" y1="56" x2="50" y2="52" stroke="#ffffff" strokeWidth="1" opacity={0.4} />
        </>
      )}
      {/* Greenery around */}
      <Circle cx="14" cy="54" r="5" fill={c.ground} opacity={0.6} />
      <Circle cx="66" cy="56" r="5" fill={c.ground} opacity={0.6} />
    </Svg>
  );
}

/** Module 14: Observatory — preparing for the future */
export function Observatory({ status, size = 80 }: LandmarkProps) {
  const c = getStatusColors(status);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx="40" cy="74" rx="30" ry="6" fill={c.ground} opacity={0.4} />
      {/* Tower base */}
      <Rect x="26" y="40" width="28" height="34" rx="2" fill={c.wall} />
      {/* Observatory dome */}
      <Path d="M24 42 Q40 12 56 42 Z" fill={c.roof} />
      {/* Dome slit */}
      <Path d="M38 18 L38 42 L42 42 L42 18" fill={status === 'locked' ? c.accent : '#3d4a5c'} />
      {/* Windows */}
      <Rect x="30" y="50" width="6" height="8" rx="1" fill={c.window} />
      <Rect x="44" y="50" width="6" height="8" rx="1" fill={c.window} />
      {/* Telescope */}
      {status !== 'locked' && (
        <Line x1="40" y1="28" x2="58" y2="16" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Door */}
      <Rect x="36" y="64" width="8" height="10" rx="1" fill={c.roof} />
      {/* Beacon light (complete) */}
      {status === 'complete' && (
        <Circle cx="58" cy="16" r="4" fill={FayColors.glow} opacity={0.6} />
      )}
      {/* Flag (complete) */}
      {status === 'complete' && (
        <>
          <Line x1="40" y1="16" x2="40" y2="4" stroke={c.accent} strokeWidth="1.5" />
          <Path d="M40 4 L52 8 L40 12 Z" fill={FayColors.glow} />
        </>
      )}
    </Svg>
  );
}

// ── Landmark Selector ───────────────────────────────────────────────

const LANDMARK_COMPONENTS: Record<number, React.FC<LandmarkProps>> = {
  1: GardenGate,
  2: ReflectingPool,
  3: HerbalistShelf,
  4: Lighthouse,
  5: SundialGarden,
  6: PuzzleBridge,
  7: BambooGate,
  8: GatheringBench,
  9: StillClearing,
  10: Forge,
  11: Greenhouse,
  12: MoonCottage,
  13: ClearSpring,
  14: Observatory,
};

export function getLandmarkComponent(chapterNumber: number): React.FC<LandmarkProps> {
  return LANDMARK_COMPONENTS[chapterNumber] ?? GardenGate;
}
