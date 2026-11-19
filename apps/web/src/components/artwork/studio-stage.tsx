import type { ReactNode } from 'react';

export interface StudioWoodStageProps {
  wallTone?: string;
  glowTone?: string;
  woodTone?: string;
  woodEdgeTone?: string;
  shadowCx?: number;
  shadowCy?: number;
  shadowRx?: number;
  shadowRy?: number;
  children: ReactNode;
}

/**
 * Cohesive Đà Lạt pinewood & warm espresso studio backdrop matching Figma Sheet 01.
 * Keeps top-left rich espresso so #7A8B3B "+ SIGNATURE" pills always maintain crisp contrast,
 * while giving dark drinks a warm studio rim-light halo behind the vessel.
 */
export function StudioWoodStage({
  wallTone = '#29261D',
  glowTone = '#594832',
  woodTone = '#3A3126',
  woodEdgeTone = '#524434',
  shadowCx = 116,
  shadowCy = 162,
  shadowRx = 54,
  shadowRy = 12,
  children,
}: StudioWoodStageProps) {
  return (
    <g>
      <rect width="240" height="190" rx="22" fill={wallTone} />
      {/* Warm directional studio bounce light behind the glass */}
      <ellipse
        cx="124"
        cy="92"
        rx="82"
        ry="66"
        fill={glowTone}
        fillOpacity="0.34"
      />
      <ellipse
        cx="118"
        cy="96"
        rx="52"
        ry="46"
        fill="#A67C2E"
        fillOpacity="0.14"
      />

      {/* Artisanal Đà Lạt dark pinewood tabletop */}
      <path
        d="M0 132H240V168C240 180.15 230.15 190 218 190H22C9.85 190 0 180.15 0 168V132Z"
        fill={woodTone}
      />
      <line
        x1="0"
        y1="132"
        x2="240"
        y2="132"
        stroke={woodEdgeTone}
        strokeWidth="1.6"
        strokeOpacity="0.7"
      />
      {/* Subtle wood grain lines */}
      <path
        d="M14 146C68 143 152 148 226 145M24 166C92 163 148 169 218 165M8 179C74 177 166 181 232 178"
        stroke="#221D16"
        strokeWidth="1.2"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />

      {/* Grounding tabletop contact shadow */}
      <ellipse
        cx={shadowCx}
        cy={shadowCy}
        rx={shadowRx}
        ry={shadowRy}
        fill="#1E1A14"
        fillOpacity="0.68"
      />

      {children}
    </g>
  );
}

export function GlossyPearl({
  cx,
  cy,
  r = 5.2,
  tone = '#29261D',
}: {
  cx: number;
  cy: number;
  r?: number;
  tone?: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tone} />
      <circle
        cx={cx + r * 0.22}
        cy={cy + r * 0.24}
        r={r * 0.55}
        fill="#6E4423"
        fillOpacity="0.45"
      />
      <circle
        cx={cx - r * 0.3}
        cy={cy - r * 0.3}
        r={r * 0.26}
        fill="#F7F4EC"
        fillOpacity="0.82"
      />
    </g>
  );
}

export function RoastedCoffeeBean({
  cx,
  cy,
  rotate = 0,
  scale = 1,
}: {
  cx: number;
  cy: number;
  rotate?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotate}) scale(${scale})`}>
      <ellipse cx="0" cy="1.2" rx="7.5" ry="5" fill="#1E1812" fillOpacity="0.6" />
      <ellipse cx="0" cy="0" rx="7.2" ry="4.7" fill="#462B1A" />
      <ellipse cx="-1.5" cy="-1.2" rx="4.2" ry="2.1" fill="#684229" fillOpacity="0.65" />
      <path
        d="M-5.2 0.4C-2 -1.6 2 1.6 5.2 -0.4"
        stroke="#22160E"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </g>
  );
}

export function SandwichCookie({
  cx,
  cy,
  rotate = -18,
  scale = 1,
}: {
  cx: number;
  cy: number;
  rotate?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotate}) scale(${scale})`}>
      {/* Back cocoa wafer */}
      <ellipse cx="0" cy="4.2" rx="15" ry="9.5" fill="#25201B" />
      {/* Ivory cream filling */}
      <ellipse cx="0" cy="1.6" rx="14.2" ry="8.8" fill="#F7F4EC" />
      {/* Front embossed cocoa wafer */}
      <ellipse
        cx="0"
        cy="-1.2"
        rx="15"
        ry="9.5"
        fill="#322B24"
        stroke="#4A4036"
        strokeWidth="1"
      />
      <ellipse
        cx="0"
        cy="-1.2"
        rx="11"
        ry="6.5"
        stroke="#221D18"
        strokeWidth="1.1"
        strokeDasharray="2.2 1.8"
      />
      <circle cx="0" cy="-1.2" r="2.6" fill="#221D18" />
    </g>
  );
}
