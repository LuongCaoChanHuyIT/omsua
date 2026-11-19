import { StudioWoodStage } from './studio-stage';

export function renderFruitTeaDrink(id: string) {
  switch (id) {
    case 'quyt-nhai-cat-tuong':
      return (
        <StudioWoodStage
          wallTone="#29261D"
          glowTone="#7A4C22"
          woodTone="#3B3124"
          shadowCx={116}
          shadowRx={60}
        >
          {/* Whole ripe Đà Lạt mandarin on wood tabletop */}
          <ellipse cx="176" cy="154" rx="26" ry="8" fill="#1E1A14" fillOpacity="0.65" />
          <circle cx="176" cy="128" r="27" fill="#D96B1E" />
          <circle cx="168" cy="118" r="9.5" fill="#F4E3AD" fillOpacity="0.34" />
          <circle cx="184" cy="136" r="1.2" fill="#9E4212" fillOpacity="0.5" />
          <circle cx="179" cy="124" r="1.1" fill="#9E4212" fillOpacity="0.5" />
          <path
            d="M175 101C182 91 193 93 196 100C189 105 180 104 175 101Z"
            fill="#7A8B3B"
          />

          {/* Tall crystal iced tea glass */}
          <path
            d="M68 38H146L136 154C135 161 129 166 121 166H93C85 166 79 161 78 154L68 38Z"
            fill="#D96B1E"
            stroke="#F7F4EC"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <path d="M73 45H141L133 150H81L73 45Z" fill="#EB8D2E" />
          <path d="M78 108H136L133 150H81L78 108Z" fill="#C45819" />

          {/* Glowing crystal ice cubes */}
          <rect
            x="84"
            y="64"
            width="22"
            height="20"
            rx="5"
            fill="#F4E3AD"
            fillOpacity="0.52"
          />
          <rect
            x="108"
            y="78"
            width="22"
            height="20"
            rx="5"
            fill="#F4E3AD"
            fillOpacity="0.46"
          />
          <rect
            x="88"
            y="105"
            width="24"
            height="20"
            rx="5"
            fill="#F4E3AD"
            fillOpacity="0.38"
          />

          {/* Fresh mandarin segments crowning the glass */}
          <path
            d="M83 40C87 22 114 22 118 40Z"
            fill="#D96B1E"
            stroke="#F4E3AD"
            strokeWidth="2"
          />
          <path
            d="M104 42C110 25 135 26 137 42Z"
            fill="#EB8D2E"
            stroke="#F4E3AD"
            strokeWidth="2"
          />
          <ellipse
            cx="107"
            cy="38"
            rx="39"
            ry="7.5"
            fill="#F7F4EC"
            fillOpacity="0.34"
          />
          <path
            d="M76 50L83 144"
            stroke="#F7F4EC"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.42"
          />

          {/* Fragrant ivory jasmine blossoms at lower-left */}
          <path
            d="M44 150C52 142 62 143 66 150C58 154 49 154 44 150Z"
            fill="#594C00"
          />
          {[
            [54, 146],
            [73, 156],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={(cx ?? 0) - 6} cy={cy} r="5.2" fill="#F7F4EC" />
              <circle cx={(cx ?? 0) + 6} cy={cy} r="5.2" fill="#F7F4EC" />
              <circle cx={cx} cy={(cy ?? 0) - 6} r="5.2" fill="#F7F4EC" />
              <circle cx={cx} cy={(cy ?? 0) + 6} r="5.2" fill="#F7F4EC" />
              <circle cx={cx} cy={cy} r="3.4" fill="#F4E3AD" />
            </g>
          ))}
        </StudioWoodStage>
      );

    case 'tra-atiso-sen-chia':
      return (
        <StudioWoodStage
          wallTone="#26251C"
          glowTone="#5F6934"
          woodTone="#383124"
          shadowCx={110}
          shadowRx={52}
        >
          {/* Clear curved herbal mason-style glass */}
          <path
            d="M74 40H142C146 76 144 122 136 155C135 161 129 165 122 165H94C87 165 81 161 80 155C72 122 70 76 74 40Z"
            fill="#C7C67E"
            fillOpacity="0.88"
            stroke="#F7F4EC"
            strokeOpacity="0.48"
            strokeWidth="2"
          />
          <path
            d="M77 96H139C138 122 136 142 133 153H83C80 142 78 122 77 96Z"
            fill="#8D9942"
            fillOpacity="0.85"
          />

          {/* Translucent herbal ice cubes */}
          <rect
            x="84"
            y="58"
            width="21"
            height="19"
            rx="4.5"
            fill="#F7F4EC"
            fillOpacity="0.4"
          />
          <rect
            x="108"
            y="68"
            width="20"
            height="18"
            rx="4.5"
            fill="#F7F4EC"
            fillOpacity="0.35"
          />

          {/* Ivory lotus seeds floating near top & mid-glass */}
          {[
            [92, 46],
            [110, 44],
            [125, 48],
            [98, 92],
            [118, 98],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <ellipse cx={cx} cy={cy} rx="6.8" ry="5.4" fill="#F7F4EC" />
              <ellipse cx={cx} cy={cy} rx="5" ry="3.8" fill="#F4E3AD" />
              <circle cx={cx} cy={cy} r="1.3" fill="#7A8B3B" />
            </g>
          ))}

          {/* Suspended tiny chia seed speckles with delicate gel halos (NOT boba!) */}
          {[
            [85, 84],
            [93, 79],
            [104, 83],
            [116, 86],
            [128, 82],
            [84, 108],
            [95, 114],
            [107, 109],
            [119, 115],
            [129, 108],
            [88, 126],
            [99, 130],
            [112, 125],
            [124, 129],
            [92, 143],
            [105, 141],
            [116, 144],
            [126, 140],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r="2.6"
                fill="#F7F4EC"
                fillOpacity="0.38"
              />
              <ellipse cx={cx} cy={cy} rx="1.5" ry="1.1" fill="#29261D" />
            </g>
          ))}

          <ellipse
            cx="108"
            cy="40"
            rx="34"
            ry="7"
            fill="#F7F4EC"
            fillOpacity="0.34"
          />
          <path
            d="M80 50C78 82 80 116 85 145"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.44"
          />

          {/* Serrated Đà Lạt green artichoke leaf & lotus seeds on dark wood */}
          <path
            d="M138 156C148 138 168 134 188 144C178 158 158 164 138 156Z"
            fill="#7A8B3B"
          />
          <path
            d="M144 153L180 145"
            stroke="#F4E3AD"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <ellipse cx="64" cy="156" rx="7.5" ry="5.8" fill="#F4E3AD" />
          <circle cx="64" cy="156" r="1.4" fill="#7A8B3B" />
        </StudioWoodStage>
      );

    case 'tra-dau-tam-da-lat':
      return (
        <StudioWoodStage
          wallTone="#28211E"
          glowTone="#7D3248"
          woodTone="#3A2E26"
          shadowCx={110}
          shadowRx={52}
        >
          {/* Curved goblet-style iced fruit glass glowing ruby-purple */}
          <path
            d="M72 42H144C150 78 146 116 132 142L136 158H80L84 142C70 116 66 78 72 42Z"
            fill="#8F2442"
            stroke="#F7F4EC"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <path
            d="M74 88H142C142 112 138 128 130 142H86C78 128 74 112 74 88Z"
            fill="#4D1326"
          />

          {/* Jewel-tinted crystal ice cubes */}
          <rect
            x="84"
            y="56"
            width="20"
            height="18"
            rx="4.5"
            fill="#F7F4EC"
            fillOpacity="0.34"
          />
          <rect
            x="108"
            y="66"
            width="20"
            height="18"
            rx="4.5"
            fill="#E07D77"
            fillOpacity="0.42"
          />

          {/* Mulberry berry cluster crowning the rim */}
          {[
            [95, 39],
            [101, 36],
            [107, 39],
            [98, 43],
            [104, 43],
            [116, 40],
            [122, 38],
            [119, 44],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r="4.2"
                fill={idx % 2 === 0 ? '#3A1220' : '#6E1B35'}
              />
              <circle
                cx={(cx ?? 0) - 1.2}
                cy={(cy ?? 0) - 1.2}
                r="1.1"
                fill="#F7F4EC"
                fillOpacity="0.7"
              />
            </g>
          ))}
          <path d="M101 34L98 26M101 34L106 27" stroke="#7A8B3B" strokeWidth="2" strokeLinecap="round" />

          <ellipse
            cx="108"
            cy="42"
            rx="36"
            ry="7"
            fill="#E07D77"
            fillOpacity="0.32"
          />
          <path
            d="M78 52C75 82 78 112 86 134"
            stroke="#F7F4EC"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />

          {/* Serrated mulberry leaf & glossy berry cluster on dark wood */}
          <path
            d="M138 152L146 142L154 144L162 138L170 142L178 140L184 150L174 158L160 160L146 158Z"
            fill="#7A8B3B"
          />
          <path
            d="M144 151L176 146"
            stroke="#9EB057"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {[
            [148, 156],
            [154, 154],
            [160, 157],
            [152, 160],
            [158, 161],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="4" fill="#4A1426" />
          ))}
        </StudioWoodStage>
      );

    case 'tra-me-thot-not':
      return (
        <StudioWoodStage
          wallTone="#28221A"
          glowTone="#734A22"
          woodTone="#3A2F22"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Barrel-curved iced tamarind tea glass */}
          <path
            d="M74 42H140C147 78 147 118 136 156C135 161 129 165 122 165H92C85 165 79 161 78 156C67 118 67 78 74 42Z"
            fill="#B86E30"
            stroke="#F7F4EC"
            strokeOpacity="0.44"
            strokeWidth="2"
          />
          <path
            d="M72 98H142C141 122 139 142 135 155H79C75 142 73 122 72 98Z"
            fill="#693814"
          />

          {/* Ice blocks + translucent ivory palmyra (thốt nốt) slices inside */}
          <rect
            x="84"
            y="62"
            width="21"
            height="18"
            rx="4.5"
            fill="#F4E3AD"
            fillOpacity="0.38"
          />
          {[
            [92, 48, -12],
            [114, 47, 14],
            [112, 84, -8],
            [96, 114, 10],
          ].map(([cx, cy, rot], idx) => (
            <ellipse
              key={idx}
              cx={cx}
              cy={cy}
              rx="10"
              ry="5.2"
              transform={`rotate(${rot}, ${cx}, ${cy})`}
              fill="#F7F4EC"
              fillOpacity="0.86"
              stroke="#EEEADF"
              strokeWidth="1"
            />
          ))}

          <ellipse
            cx="107"
            cy="42"
            rx="33"
            ry="7"
            fill="#F4E3AD"
            fillOpacity="0.38"
          />
          <path
            d="M78 54C74 86 75 118 82 146"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.38"
          />

          {/* Curved matte-brown tamarind pod & translucent thốt nốt slices on dark wood */}
          <path
            d="M134 156C144 138 164 134 186 148C190 151 188 158 182 159C164 152 150 154 139 162C134 164 131 160 134 156Z"
            fill="#8A5630"
            stroke="#59351C"
            strokeWidth="1.8"
          />
          <circle cx="154" cy="148" r="4" fill="#472610" />
          <ellipse
            cx="62"
            cy="156"
            rx="11"
            ry="5.8"
            fill="#F7F4EC"
            fillOpacity="0.9"
          />
          <ellipse
            cx="76"
            cy="161"
            rx="10"
            ry="5.2"
            fill="#EEEADF"
            fillOpacity="0.88"
          />
        </StudioWoodStage>
      );

    case 'tra-so-ri-buoi-hong':
      return (
        <StudioWoodStage
          wallTone="#29221E"
          glowTone="#82423D"
          woodTone="#3B2F26"
          shadowCx={108}
          shadowRx={50}
        >
          {/* Tall slim crystal Collins glass glowing coral-pink */}
          <path
            d="M76 36H138L132 156C131 161 126 165 120 165H94C88 165 83 161 82 156L76 36Z"
            fill="#E37167"
            stroke="#F7F4EC"
            strokeOpacity="0.48"
            strokeWidth="2"
          />
          <path
            d="M80 94H134L131 154H83L80 94Z"
            fill="#C94B43"
          />

          {/* Ruby grapefruit half-wheel pressed against inner glass wall */}
          <path
            d="M84 68C104 68 118 84 118 104C118 122 104 136 86 136Z"
            fill="#F7F4EC"
            fillOpacity="0.85"
          />
          <path
            d="M86 73C101 73 112 86 112 104C112 119 101 131 87 131Z"
            fill="#D93F46"
          />
          <path
            d="M86 104H112M86 104L106 84M86 104L106 122"
            stroke="#F7F4EC"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Ice + glossy red acerola (sơ ri) fruit & mint on rim */}
          <rect
            x="104"
            y="50"
            width="20"
            height="18"
            rx="4"
            fill="#F7F4EC"
            fillOpacity="0.42"
          />
          <circle cx="95" cy="36" r="8.5" fill="#CF3530" />
          <circle cx="92" cy="33" r="2.2" fill="#F7F4EC" fillOpacity="0.75" />
          <path
            d="M95 28C97 21 104 19 108 22"
            stroke="#7A8B3B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M114 36C120 25 134 25 138 34C130 40 120 40 114 36Z"
            fill="#7A8B3B"
          />

          <path
            d="M82 46L86 146"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.42"
          />

          {/* Sơ ri cherries + ruby grapefruit segment on dark wood */}
          <circle cx="152" cy="154" r="9" fill="#D43A34" />
          <circle cx="149" cy="151" r="2.3" fill="#F7F4EC" fillOpacity="0.75" />
          <path
            d="M162 158C166 144 184 144 188 158Z"
            fill="#E05256"
            stroke="#F4E3AD"
            strokeWidth="2"
          />
        </StudioWoodStage>
      );

    case 'kombucha-chanh-vang':
    default:
      return (
        <StudioWoodStage
          wallTone="#27251C"
          glowTone="#73632B"
          woodTone="#3A3124"
          shadowCx={108}
          shadowRx={50}
        >
          {/* Upright aromatic rosemary/thyme herb sprig */}
          <path
            d="M118 18L108 82"
            stroke="#594C00"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {[22, 29, 36, 43].map((y, idx) => (
            <g key={idx}>
              <path
                d={`M${118 - idx * 1.4} ${y}L${110 - idx * 1.4} ${y - 4}`}
                stroke="#8FA148"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d={`M${118 - idx * 1.4} ${y}L${126 - idx * 1.4} ${y - 2}`}
                stroke="#7A8B3B"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Bright yellow lemon wheel perched on glass rim */}
          <circle
            cx="82"
            cy="40"
            r="16"
            fill="#F4DF6B"
            stroke="#E5B92E"
            strokeWidth="2.5"
          />
          <circle cx="82" cy="40" r="12" fill="#F7F4EC" />
          <circle cx="82" cy="40" r="9.5" fill="#E8C238" />
          <path
            d="M72 40H92M82 30V50M75 33L89 47M89 33L75 47"
            stroke="#F7F4EC"
            strokeWidth="1.3"
          />

          {/* Tapered craft pilsner/flute kombucha glass */}
          <path
            d="M74 42H140L128 156C127 161 122 165 116 165H98C92 165 87 161 86 156L74 42Z"
            fill="#ECCB5C"
            stroke="#F7F4EC"
            strokeOpacity="0.48"
            strokeWidth="2"
          />
          <path
            d="M80 100H134L128 155H86L80 100Z"
            fill="#C7962C"
          />

          {/* Fine rising effervescent kombucha fizz bubbles */}
          {[
            [94, 142, 1.4],
            [96, 128, 1.7],
            [93, 114, 1.5],
            [97, 98, 2.0],
            [95, 82, 1.8],
            [98, 66, 2.2],
            [112, 146, 1.3],
            [110, 132, 1.6],
            [114, 118, 1.9],
            [111, 102, 1.5],
            [115, 86, 2.1],
            [113, 70, 1.7],
            [122, 110, 1.4],
            [120, 92, 1.8],
            [123, 74, 1.6],
          ].map(([cx, cy, r], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="#F7F4EC"
              fillOpacity="0.78"
            />
          ))}

          {/* Effervescent kombucha foam collar */}
          <ellipse cx="107" cy="43" rx="33" ry="6.5" fill="#F7F4EC" fillOpacity="0.82" />
          <path
            d="M81 52L90 146"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.44"
          />

          {/* Fresh yellow lemon wedge & thyme sprig on wood */}
          <path
            d="M142 158C148 140 174 140 180 158Z"
            fill="#F4DF6B"
            stroke="#D9A726"
            strokeWidth="2.2"
          />
          <path
            d="M147 156C152 145 170 145 175 156Z"
            fill="#E8C238"
          />
        </StudioWoodStage>
      );
  }
}
