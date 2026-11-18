import type { ProductCategoryId } from '@omsua/shared';

export interface OmSuaLogoProps {
  className?: string;
}

export function OmSuaLogo({ className = 'h-11 w-11' }: OmSuaLogoProps) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo Ốm Sữa Since 2017"
    >
      <rect
        x="2"
        y="2"
        width="84"
        height="84"
        rx="18"
        fill="#F7F4EC"
        stroke="#594C00"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      {/* Circumflex hat + artichoke leaf sprout */}
      <path
        d="M22 22L32 12L42 22"
        stroke="#29261D"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 15C46 11 52 11 54 15C50 17 45 17 42 15Z"
        fill="#7A8B3B"
      />
      {/* Stylized Ô + interlocking S monogram */}
      <path
        d="M32 25C24.5 25 20 30 20 36.5C20 43 25.5 46 32 47.5C38.5 49 42 52 42 57.5C42 63.5 36.8 67.5 29.5 67.5C23.5 67.5 19.5 64.2 19 59.5"
        stroke="#29261D"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle
        cx="32"
        cy="36"
        r="5.5"
        stroke="#594C00"
        strokeWidth="2.8"
      />
      {/* Serif 'm' */}
      <path
        d="M46 43V31.5C46 31.5 48.5 29.5 51.5 29.5C54.5 29.5 56 31.5 56 34.5V43M56 34.5C56 31.5 58.8 29.5 62 29.5C65 29.5 67 31.5 67 35V43"
        stroke="#29261D"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 'sữa' script-serif */}
      <text
        x="45"
        y="61"
        fill="#594C00"
        fontSize="15"
        fontWeight="700"
        fontFamily="Georgia, serif"
      >
        sữa
      </text>
      {/* SINCE 2017 */}
      <text
        x="44"
        y="78"
        textAnchor="middle"
        fill="#6B6255"
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="1.6"
        fontFamily="system-ui, sans-serif"
      >
        SINCE 2017
      </text>
    </svg>
  );
}

export interface AtisoMascotProps {
  className?: string;
}

export function AtisoMascot({ className = 'h-20 w-20' }: AtisoMascotProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Linh vật Bé Búp Atiso Đà Lạt"
    >
      <rect width="120" height="120" rx="24" fill="#EEEADF" />
      <circle cx="60" cy="62" r="46" fill="#F4E3AD" fillOpacity="0.45" />

      {/* Back artichoke crown petals */}
      <path d="M60 12L47 30H73L60 12Z" fill="#594C00" />
      <path d="M39 20L32 40L52 34L39 20Z" fill="#594C00" />
      <path d="M81 20L88 40L68 34L81 20Z" fill="#594C00" />

      {/* Mid artichoke bracts */}
      <path d="M60 17L45 37H75L60 17Z" fill="#7A8B3B" />
      <path d="M32 32L26 54L46 46L32 32Z" fill="#7A8B3B" />
      <path d="M88 32L94 54L74 46L88 32Z" fill="#7A8B3B" />
      <path d="M46 25L37 46L58 41L46 25Z" fill="#8FA148" />
      <path d="M74 25L83 46L62 41L74 25Z" fill="#8FA148" />

      {/* Side hood petals wrapping cheeks */}
      <path
        d="M27 50C24 63 30 76 39 81L41 56L27 50Z"
        fill="#7A8B3B"
        stroke="#29261D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M93 50C96 63 90 76 81 81L79 56L93 50Z"
        fill="#7A8B3B"
        stroke="#29261D"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cozy sweater body */}
      <path
        d="M35 104C35 89 45 81 60 81C75 81 85 89 85 104H35Z"
        fill="#C8BA9B"
        stroke="#29261D"
        strokeWidth="2.2"
      />

      {/* Warm face + bangs */}
      <circle
        cx="60"
        cy="61"
        r="22"
        fill="#F5DFC6"
        stroke="#29261D"
        strokeWidth="2.2"
      />
      <path
        d="M39 56C41 44 50 39 60 39C70 39 79 44 81 56C75 51 68 49 60 49C52 49 45 51 39 56Z"
        fill="#3B2E22"
      />

      {/* Happy curved eyes, rosy cheeks & gentle smile */}
      <path
        d="M49 61C50.5 58.5 53.5 58.5 55 61"
        stroke="#29261D"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M65 61C66.5 58.5 69.5 58.5 71 61"
        stroke="#29261D"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse cx="47" cy="66.5" rx="4" ry="2.4" fill="#E07D77" fillOpacity="0.65" />
      <ellipse cx="73" cy="66.5" rx="4" ry="2.4" fill="#E07D77" fillOpacity="0.65" />
      <path
        d="M57 67.5C58.5 69.5 61.5 69.5 63 67.5"
        stroke="#29261D"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Boba milk tea cup held with both hands */}
      <line
        x1="60"
        y1="73"
        x2="60"
        y2="84"
        stroke="#594C00"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M50 84H70L68 106H52L50 84Z"
        fill="#F4E3AD"
        stroke="#29261D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="56" cy="101" r="2" fill="#29261D" />
      <circle cx="60" cy="102" r="2" fill="#29261D" />
      <circle cx="64" cy="101" r="2" fill="#29261D" />
      <circle cx="49" cy="94" r="4" fill="#F5DFC6" stroke="#29261D" strokeWidth="1.8" />
      <circle cx="71" cy="94" r="4" fill="#F5DFC6" stroke="#29261D" strokeWidth="1.8" />
    </svg>
  );
}

export interface ProductIllustrationProps {
  productId?: string;
  toppingId?: string;
  id?: string;
  categoryId?: ProductCategoryId | 'topping';
  variant?: 'card' | 'spotlight' | 'topping' | 'snack';
  className?: string;
  alt?: string;
}

function renderToppingBowl(id: string) {
  return (
    <g>
      <rect width="160" height="160" rx="22" fill="#EEEADF" />
      <ellipse cx="82" cy="96" rx="52" ry="44" fill="#C8BA9B" fillOpacity="0.45" />
      <circle
        cx="80"
        cy="82"
        r="50"
        fill="#F7F4EC"
        stroke="#C8BA9B"
        strokeWidth="5"
      />
      <circle cx="80" cy="82" r="41" fill="#3A3125" />

      {id === 'tran-chau-den' && (
        <g>
          {[
            [64, 68],
            [80, 64],
            [96, 70],
            [58, 84],
            [74, 80],
            [90, 83],
            [103, 86],
            [66, 97],
            [82, 96],
            [95, 98],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="9.5" fill="#29261D" />
              <circle cx={(cx ?? 0) - 3} cy={(cy ?? 0) - 3} r="2.4" fill="#F7F4EC" fillOpacity="0.7" />
            </g>
          ))}
        </g>
      )}

      {id === 'tran-chau-trang' && (
        <g>
          <circle cx="80" cy="82" r="40" fill="#C8BA9B" />
          {[
            [64, 68],
            [80, 64],
            [96, 70],
            [59, 84],
            [75, 81],
            [91, 83],
            [68, 97],
            [84, 96],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="9" fill="#F7F4EC" stroke="#EEEADF" strokeWidth="1.5" />
              <circle cx={(cx ?? 0) - 2.5} cy={(cy ?? 0) - 2.5} r="2.2" fill="#F4E3AD" />
            </g>
          ))}
        </g>
      )}

      {id === 'kem-trung' && (
        <g>
          <circle cx="80" cy="82" r="39" fill="#F4E3AD" />
          <path
            d="M54 80C62 64 96 64 104 82C96 98 66 102 58 88C64 76 88 74 92 84"
            stroke="#A67C2E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="74" cy="74" r="5" fill="#D96B1E" fillOpacity="0.45" />
          <circle cx="90" cy="88" r="4" fill="#594C00" fillOpacity="0.35" />
        </g>
      )}

      {id === 'banh-flan' && (
        <g>
          <circle cx="80" cy="82" r="39" fill="#A67C2E" fillOpacity="0.55" />
          <ellipse cx="80" cy="86" rx="30" ry="22" fill="#F4E3AD" />
          <ellipse cx="80" cy="77" rx="25" ry="16" fill="#D96B1E" />
          <ellipse cx="73" cy="73" rx="8" ry="4" fill="#F7F4EC" fillOpacity="0.55" />
        </g>
      )}

      {id === 'hat-sen' && (
        <g>
          <circle cx="80" cy="82" r="39" fill="#6B6255" />
          {[
            [65, 69],
            [83, 66],
            [97, 75],
            [61, 86],
            [79, 83],
            [93, 91],
            [73, 98],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <ellipse cx={cx} cy={cy} rx="9" ry="7.5" fill="#F4E3AD" />
              <circle cx={cx} cy={cy} r="2" fill="#7A8B3B" />
            </g>
          ))}
        </g>
      )}

      {id === 'khuc-bach' && (
        <g>
          <circle cx="80" cy="82" r="39" fill="#7A8B3B" fillOpacity="0.45" />
          <rect x="54" y="62" width="22" height="16" rx="4" fill="#F7F4EC" />
          <rect x="80" y="60" width="22" height="16" rx="4" fill="#EEEADF" />
          <rect x="60" y="82" width="24" height="16" rx="4" fill="#F7F4EC" />
          <rect x="84" y="80" width="20" height="16" rx="4" fill="#F4E3AD" />
          <ellipse cx="76" cy="75" rx="5" ry="2.2" fill="#A67C2E" />
          <ellipse cx="90" cy="92" rx="5" ry="2.2" fill="#A67C2E" />
        </g>
      )}

      {id === 'hat-dac-rim' && (
        <g>
          <circle cx="80" cy="82" r="39" fill="#594C00" fillOpacity="0.65" />
          {[
            [65, 69],
            [84, 67],
            [96, 80],
            [62, 86],
            [79, 83],
            [88, 96],
            [70, 97],
          ].map(([cx, cy], idx) => (
            <ellipse
              key={idx}
              cx={cx}
              cy={cy}
              rx="10"
              ry="7"
              fill={idx % 2 === 0 ? '#F4E3AD' : '#E07D77'}
            />
          ))}
        </g>
      )}

      {id === 'thach-cu-nang' && (
        <g>
          <circle cx="80" cy="82" r="39" fill="#3A2328" />
          {[
            [58, 64],
            [78, 60],
            [94, 68],
            [56, 82],
            [74, 78],
            [91, 84],
            [68, 95],
            [86, 96],
          ].map(([x, y], idx) => (
            <rect
              key={idx}
              x={(x ?? 0) - 7}
              y={(y ?? 0) - 7}
              width="14"
              height="14"
              rx="3.5"
              fill={idx % 2 === 0 ? '#E07D77' : '#D96B1E'}
            />
          ))}
        </g>
      )}
    </g>
  );
}

function renderSnackPlate(id: string) {
  const isBamboo = id === 'phoi-suong-toi-ot';
  const isRound = id === 'banh-trang-sot-tac' || id === 'banh-cham-long-dao';

  return (
    <g>
      <rect width="200" height="180" rx="22" fill="#EEEADF" />
      <ellipse cx="102" cy="100" rx="76" ry="62" fill="#C8BA9B" fillOpacity="0.45" />

      {isBamboo ? (
        <g>
          <circle cx="100" cy="92" r="68" fill="#C8BA9B" stroke="#A67C2E" strokeWidth="6" />
          <circle cx="100" cy="92" r="56" fill="#7A8B3B" />
        </g>
      ) : isRound ? (
        <circle cx="100" cy="92" r="68" fill="#29261D" stroke="#6B6255" strokeWidth="3" />
      ) : (
        <rect
          x="24"
          y="26"
          width="152"
          height="132"
          rx="18"
          fill="#29261D"
          stroke="#6B6255"
          strokeWidth="3"
        />
      )}

      {id === 'banh-trang-tron-top-mo' && (
        <g>
          <ellipse cx="98" cy="92" rx="54" ry="42" fill="#D96B1E" fillOpacity="0.88" />
          <path d="M56 78L134 68M52 94L138 88M62 110L130 104" stroke="#F4E3AD" strokeWidth="6" strokeLinecap="round" />
          {/* Shredded mango + herbs + pork rinds + kumquats */}
          <path d="M112 58L142 74M118 66L146 82" stroke="#F4E3AD" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="122" cy="112" rx="18" ry="10" fill="#7A8B3B" />
          <rect x="74" y="76" width="14" height="12" rx="3" fill="#A67C2E" />
          <rect x="92" y="84" width="14" height="12" rx="3" fill="#A67C2E" />
          <circle cx="56" cy="112" r="9" fill="#7A8B3B" />
          <circle cx="56" cy="112" r="6" fill="#D96B1E" />
          <circle cx="140" cy="58" r="8" fill="#7A8B3B" />
          <circle cx="140" cy="58" r="5" fill="#D96B1E" />
        </g>
      )}

      {id === 'com-chay-cha-bong' && (
        <g>
          <rect x="46" y="46" width="108" height="92" rx="12" fill="#A67C2E" />
          <rect x="52" y="52" width="96" height="80" rx="10" fill="#F4E3AD" />
          <path
            d="M60 72C78 62 120 64 136 74M58 92C80 82 118 84 140 94M64 112C84 104 116 106 134 114"
            stroke="#D96B1E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="82" cy="82" r="4" fill="#7A8B3B" />
          <circle cx="104" cy="90" r="4" fill="#7A8B3B" />
          <circle cx="118" cy="76" r="4" fill="#7A8B3B" />
        </g>
      )}

      {id === 'banh-trang-cuon-bo' && (
        <g>
          {[48, 72, 96, 120, 140].map((x, idx) => (
            <g key={idx}>
              <rect x={x - 8} y="52" width="18" height="80" rx="8" fill="#D96B1E" />
              <rect x={x - 5} y="58" width="12" height="68" rx="5" fill="#F4E3AD" fillOpacity="0.82" />
            </g>
          ))}
          <path
            d="M42 78Q72 68 100 80T156 76M42 104Q72 94 100 106T156 102"
            stroke="#F7F4EC"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="76" cy="90" r="3.5" fill="#7A8B3B" />
          <circle cx="116" cy="92" r="3.5" fill="#7A8B3B" />
        </g>
      )}

      {id === 'banh-trang-sot-tac' && (
        <g>
          <circle cx="100" cy="92" r="50" fill="#D96B1E" fillOpacity="0.9" />
          <path d="M66 80L132 74M62 96L136 92M72 112L126 108" stroke="#F4E3AD" strokeWidth="5" strokeLinecap="round" />
          <circle cx="76" cy="68" r="8" fill="#7A8B3B" />
          <circle cx="76" cy="68" r="5" fill="#F4E3AD" />
          <circle cx="126" cy="112" r="8" fill="#7A8B3B" />
          <circle cx="126" cy="112" r="5" fill="#F4E3AD" />
          <circle cx="102" cy="90" r="6" fill="#594C00" />
        </g>
      )}

      {id === 'phoi-suong-toi-ot' && (
        <g>
          <ellipse cx="100" cy="92" rx="44" ry="36" fill="#F7F4EC" fillOpacity="0.9" />
          <ellipse cx="100" cy="92" rx="32" ry="24" fill="#F4E3AD" />
          <circle cx="92" cy="86" r="14" fill="#D96B1E" fillOpacity="0.85" />
          <circle cx="112" cy="96" r="11" fill="#A67C2E" fillOpacity="0.85" />
        </g>
      )}

      {id === 'banh-cham-long-dao' && (
        <g>
          {/* Rice paper wedges */}
          <path d="M48 92L86 58L92 104Z" fill="#F7F4EC" fillOpacity="0.9" />
          <path d="M54 114L90 82L96 128Z" fill="#EEEADF" fillOpacity="0.9" />
          {/* Herbs */}
          <ellipse cx="102" cy="62" rx="22" ry="12" fill="#7A8B3B" />
          {/* Tamarind dip bowl */}
          <circle cx="128" cy="106" r="20" fill="#F7F4EC" />
          <circle cx="128" cy="106" r="15" fill="#594C00" />
          {/* Soft-boiled egg halves */}
          <ellipse cx="96" cy="118" rx="12" ry="9" fill="#F7F4EC" />
          <circle cx="96" cy="118" r="5.5" fill="#D96B1E" />
          <ellipse cx="132" cy="74" rx="12" ry="9" fill="#F7F4EC" />
          <circle cx="132" cy="74" r="5.5" fill="#D96B1E" />
        </g>
      )}
    </g>
  );
}

function renderSignatureArtichokeMug() {
  return (
    <g>
      <rect width="240" height="190" rx="22" fill="#29261D" />
      <rect y="132" width="240" height="58" rx="12" fill="#3B3226" />
      {/* Mug handle */}
      <path
        d="M150 68C174 68 180 108 150 116"
        stroke="#C8BA9B"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Ceramic stoneware mug body */}
      <path
        d="M58 54H154L144 150C143 158 136 164 126 164H86C76 164 69 158 68 150L58 54Z"
        fill="#DDD2BE"
      />
      <path
        d="M68 134H144L142 150C141 158 134 164 126 164H86C78 164 71 158 70 150L68 134Z"
        fill="#A67C2E"
        fillOpacity="0.45"
      />
      {/* Creamy artichoke milk tea rim + foam */}
      <ellipse cx="106" cy="54" rx="48" ry="18" fill="#EEEADF" />
      <ellipse cx="106" cy="54" rx="43" ry="14" fill="#D7C8AC" />
      {/* Glistening dark tapioca pearls */}
      {[
        [90, 50],
        [104, 47],
        [118, 50],
        [84, 56],
        [98, 55],
        [112, 56],
        [124, 55],
        [105, 61],
      ].map(([cx, cy], idx) => (
        <g key={idx}>
          <circle cx={cx} cy={cy} r="5.4" fill="#29261D" />
          <circle cx={(cx ?? 0) - 1.5} cy={(cy ?? 0) - 1.5} r="1.4" fill="#F7F4EC" />
        </g>
      ))}
      {/* Layered green Đà Lạt artichoke bud beside mug */}
      <g transform="translate(132, 108)">
        <ellipse cx="38" cy="52" rx="34" ry="12" fill="#29261D" fillOpacity="0.65" />
        <path d="M38 6L22 28H54L38 6Z" fill="#594C00" />
        <path d="M18 18L10 42L32 36L18 18Z" fill="#594C00" />
        <path d="M58 18L66 42L44 36L58 18Z" fill="#594C00" />
        <path d="M38 14L20 38H56L38 14Z" fill="#7A8B3B" />
        <path d="M12 32L8 54L32 48L12 32Z" fill="#7A8B3B" />
        <path d="M64 32L68 54L44 48L64 32Z" fill="#7A8B3B" />
        <path d="M38 26L22 52H54L38 26Z" fill="#95A74E" />
      </g>
    </g>
  );
}

function renderMandarinJasmineGlass() {
  return (
    <g>
      <rect width="240" height="190" rx="22" fill="#29261D" />
      <rect y="136" width="240" height="54" rx="12" fill="#3B3124" />
      {/* Whole ripe mandarin on right */}
      <circle cx="176" cy="128" r="28" fill="#D96B1E" />
      <circle cx="168" cy="118" r="9" fill="#F4E3AD" fillOpacity="0.32" />
      <path d="M176 100C182 92 192 94 194 100C188 104 180 103 176 100Z" fill="#7A8B3B" />

      {/* Tall crystal iced tea glass */}
      <path
        d="M68 38H146L136 154C135 161 129 166 121 166H93C85 166 79 161 78 154L68 38Z"
        fill="#D96B1E"
      />
      <path
        d="M73 46H141L133 150H81L73 46Z"
        fill="#E58B2E"
      />
      {/* Glowing ice cubes */}
      <rect x="84" y="66" width="22" height="20" rx="5" fill="#F4E3AD" fillOpacity="0.5" />
      <rect x="108" y="80" width="22" height="20" rx="5" fill="#F4E3AD" fillOpacity="0.45" />
      <rect x="88" y="106" width="24" height="20" rx="5" fill="#F4E3AD" fillOpacity="0.38" />
      {/* Fresh mandarin segments crowning the glass */}
      <path d="M84 40C88 24 114 24 118 40Z" fill="#D96B1E" stroke="#F4E3AD" strokeWidth="2" />
      <path d="M104 42C110 26 134 28 136 42Z" fill="#E58B2E" stroke="#F4E3AD" strokeWidth="2" />
      <ellipse cx="107" cy="38" rx="39" ry="8" fill="#F7F4EC" fillOpacity="0.3" />

      {/* Cream jasmine blossoms at lower-left */}
      {[
        [52, 146],
        [72, 156],
      ].map(([cx, cy], idx) => (
        <g key={idx}>
          <circle cx={(cx ?? 0) - 6} cy={cy} r="5.5" fill="#F7F4EC" />
          <circle cx={(cx ?? 0) + 6} cy={cy} r="5.5" fill="#F7F4EC" />
          <circle cx={cx} cy={(cy ?? 0) - 6} r="5.5" fill="#F7F4EC" />
          <circle cx={cx} cy={(cy ?? 0) + 6} r="5.5" fill="#F7F4EC" />
          <circle cx={cx} cy={cy} r="3.5" fill="#F4E3AD" />
        </g>
      ))}
    </g>
  );
}

interface CupPalette {
  backdrop: string;
  bodyTop: string;
  bodyBottom: string;
  foam: string;
  accent: string;
  hasPearls?: boolean;
  hasCreamDome?: boolean;
  hasOreo?: boolean;
  hasFlan?: boolean;
  hasStripe?: boolean;
  hasThreeLayers?: boolean;
  isDarkBackdrop?: boolean;
}

const DRINK_PALETTES: Record<string, CupPalette> = {
  'tra-sua-atiso-chuoi': {
    backdrop: '#EEEADF',
    bodyTop: '#F4E3AD',
    bodyBottom: '#C8BA9B',
    foam: '#F7F4EC',
    accent: '#7A8B3B',
    hasPearls: true,
  },
  'tra-sua-gao-rang-khuc-bach': {
    backdrop: '#EEEADF',
    bodyTop: '#D6B98C',
    bodyBottom: '#A67C2E',
    foam: '#F7F4EC',
    accent: '#F4E3AD',
  },
  'tra-sua-tiramisu': {
    backdrop: '#EEEADF',
    bodyTop: '#C8BA9B',
    bodyBottom: '#6B6255',
    foam: '#594C00',
    accent: '#F4E3AD',
    hasCreamDome: true,
  },
  'tra-sua-flan-chay-canh': {
    backdrop: '#EEEADF',
    bodyTop: '#C98A4B',
    bodyBottom: '#6B6255',
    foam: '#F4E3AD',
    accent: '#D96B1E',
    hasFlan: true,
  },
  'oolong-sen-gung': {
    backdrop: '#EEEADF',
    bodyTop: '#E5B45B',
    bodyBottom: '#A67C2E',
    foam: '#F4E3AD',
    accent: '#7A8B3B',
  },
  'tra-atiso-sen-chia': {
    backdrop: '#EEEADF',
    bodyTop: '#C7CBBD',
    bodyBottom: '#7A8B3B',
    foam: '#F4E3AD',
    accent: '#594C00',
    hasPearls: true,
  },
  'tra-dau-tam-da-lat': {
    backdrop: '#EEEADF',
    bodyTop: '#9A364C',
    bodyBottom: '#4A1D28',
    foam: '#E07D77',
    accent: '#7A8B3B',
  },
  'tra-me-thot-not': {
    backdrop: '#EEEADF',
    bodyTop: '#B87338',
    bodyBottom: '#594C00',
    foam: '#F4E3AD',
    accent: '#7A8B3B',
  },
  'tra-so-ri-buoi-hong': {
    backdrop: '#EEEADF',
    bodyTop: '#E07D77',
    bodyBottom: '#D96B1E',
    foam: '#F7F4EC',
    accent: '#7A8B3B',
  },
  'kombucha-chanh-vang': {
    backdrop: '#EEEADF',
    bodyTop: '#F4E3AD',
    bodyBottom: '#B6A152',
    foam: '#F7F4EC',
    accent: '#7A8B3B',
  },
  'sua-tuoi-kem-trung-nuong': {
    backdrop: '#EEEADF',
    bodyTop: '#F4E3AD',
    bodyBottom: '#F7F4EC',
    foam: '#A67C2E',
    accent: '#D96B1E',
    hasPearls: true,
    hasCreamDome: true,
  },
  'sua-tuoi-duong-den': {
    backdrop: '#3B3124',
    bodyTop: '#F7F4EC',
    bodyBottom: '#C8BA9B',
    foam: '#F4E3AD',
    accent: '#A67C2E',
    hasPearls: true,
    hasStripe: true,
    isDarkBackdrop: true,
  },
  'matcha-latte': {
    backdrop: '#EEEADF',
    bodyTop: '#7A8B3B',
    bodyBottom: '#F7F4EC',
    foam: '#95A74E',
    accent: '#594C00',
  },
  'oreo-tra-da-xay': {
    backdrop: '#EEEADF',
    bodyTop: '#7A8B3B',
    bodyBottom: '#C7CBBD',
    foam: '#F7F4EC',
    accent: '#29261D',
    hasCreamDome: true,
    hasOreo: true,
  },
  'matcha-oreo-da-xay': {
    backdrop: '#EEEADF',
    bodyTop: '#7A8B3B',
    bodyBottom: '#594C00',
    foam: '#F7F4EC',
    accent: '#29261D',
    hasCreamDome: true,
    hasOreo: true,
  },
  'yogurt-dau-tam': {
    backdrop: '#EEEADF',
    bodyTop: '#F7F4EC',
    bodyBottom: '#9A364C',
    foam: '#E07D77',
    accent: '#7A8B3B',
    hasStripe: true,
  },
  'cold-brew-me': {
    backdrop: '#EEEADF',
    bodyTop: '#8C4422',
    bodyBottom: '#29261D',
    foam: '#F4E3AD',
    accent: '#7A8B3B',
  },
  'ca-phe-muoi': {
    backdrop: '#3B3124',
    bodyTop: '#F7F4EC',
    bodyBottom: '#29261D',
    foam: '#F7F4EC',
    accent: '#C8BA9B',
    isDarkBackdrop: true,
  },
  'ca-phe-kem-tiramisu': {
    backdrop: '#EEEADF',
    bodyTop: '#F4E3AD',
    bodyBottom: '#29261D',
    foam: '#A67C2E',
    accent: '#594C00',
    hasCreamDome: true,
  },
  'ca-phe-sua': {
    backdrop: '#EEEADF',
    bodyTop: '#A67C2E',
    bodyBottom: '#3B2E22',
    foam: '#F7F4EC',
    accent: '#29261D',
  },
  'bac-xiu-da-lat': {
    backdrop: '#3B3124',
    bodyTop: '#F4E3AD',
    bodyBottom: '#F7F4EC',
    foam: '#A67C2E',
    accent: '#29261D',
    hasThreeLayers: true,
    isDarkBackdrop: true,
  },
  'ca-phe-den': {
    backdrop: '#3B3124',
    bodyTop: '#594C00',
    bodyBottom: '#29261D',
    foam: '#A67C2E',
    accent: '#C8BA9B',
    isDarkBackdrop: true,
  },
};

function renderStudioDrinkCup(id: string) {
  const palette: CupPalette = DRINK_PALETTES[id] ?? {
    backdrop: '#EEEADF',
    bodyTop: '#F4E3AD',
    bodyBottom: '#A67C2E',
    foam: '#F7F4EC',
    accent: '#7A8B3B',
  };

  return (
    <g>
      <rect width="200" height="190" rx="22" fill={palette.backdrop} />
      <ellipse
        cx="100"
        cy="160"
        rx="54"
        ry="12"
        fill={palette.isDarkBackdrop ? '#29261D' : '#C8BA9B'}
        fillOpacity="0.6"
      />

      {/* Tall café glass */}
      <path
        d="M58 46H142L130 154C129 160 123 164 116 164H84C77 164 71 160 70 154L58 46Z"
        fill={palette.bodyBottom}
        stroke="#C8BA9B"
        strokeOpacity="0.55"
        strokeWidth="2.5"
      />
      <path
        d="M60 48H140L135 102H65L60 48Z"
        fill={palette.bodyTop}
      />

      {palette.hasThreeLayers && (
        <path d="M64 82H136L133 118H67L64 82Z" fill="#6B4423" />
      )}

      {palette.hasStripe && (
        <path
          d="M66 74C82 88 94 68 112 86C122 96 128 82 134 90M70 112C86 124 104 102 128 118"
          stroke={palette.accent}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}

      {/* Rim / Cream dome / Flan */}
      {palette.hasCreamDome ? (
        <path
          d="M58 48C64 24 136 24 142 48Z"
          fill={palette.foam}
        />
      ) : (
        <ellipse cx="100" cy="46" rx="42" ry="9" fill={palette.foam} />
      )}

      {palette.hasFlan && (
        <g>
          <ellipse cx="100" cy="42" rx="26" ry="12" fill="#F4E3AD" />
          <ellipse cx="100" cy="36" rx="22" ry="8" fill="#D96B1E" />
        </g>
      )}

      {palette.hasOreo && (
        <g>
          <circle cx="116" cy="30" r="12" fill="#29261D" />
          <circle cx="84" cy="38" r="3" fill="#29261D" />
          <circle cx="96" cy="34" r="2.5" fill="#29261D" />
          <circle cx="104" cy="40" r="3" fill="#29261D" />
        </g>
      )}

      {palette.hasPearls && (
        <g>
          {[78, 90, 102, 114, 84, 98, 110].map((cx, idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={idx < 4 ? 152 : 143}
              r="4.8"
              fill="#29261D"
            />
          ))}
        </g>
      )}

      {/* Botanical leaf garnish */}
      <path
        d="M132 146C144 138 156 142 158 152C148 156 136 154 132 146Z"
        fill={palette.accent}
      />
    </g>
  );
}

export function ProductIllustration({
  productId,
  toppingId,
  id,
  categoryId,
  variant = 'card',
  className = 'h-full w-full',
  alt,
}: ProductIllustrationProps) {
  const targetId = productId ?? toppingId ?? id ?? '';
  const isTopping =
    variant === 'topping' || categoryId === 'topping' || Boolean(toppingId);
  const isSnack =
    variant === 'snack' ||
    categoryId === 'snack' ||
    targetId.startsWith('banh-') ||
    targetId === 'com-chay-cha-bong' ||
    targetId === 'phoi-suong-toi-ot';

  if (isTopping) {
    return (
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={alt ?? `Topping ${targetId}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {renderToppingBowl(targetId)}
      </svg>
    );
  }

  if (isSnack) {
    return (
      <svg
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={alt ?? `Món ăn vặt ${targetId}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {renderSnackPlate(targetId)}
      </svg>
    );
  }

  if (targetId === 'tra-sua-atiso') {
    return (
      <svg
        viewBox="0 0 240 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={alt ?? 'Trà Sữa Atiso Đà Lạt'}
        preserveAspectRatio="xMidYMid slice"
      >
        {renderSignatureArtichokeMug()}
      </svg>
    );
  }

  if (targetId === 'quyt-nhai-cat-tuong') {
    return (
      <svg
        viewBox="0 0 240 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={alt ?? 'Trà Quýt Nhài Cát Tường'}
        preserveAspectRatio="xMidYMid slice"
      >
        {renderMandarinJasmineGlass()}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={alt ?? `Thức uống ${targetId}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {renderStudioDrinkCup(targetId)}
    </svg>
  );
}
