import { GlossyPearl, StudioWoodStage } from './studio-stage';

export function renderMilkTeaDrink(id: string) {
  switch (id) {
    case 'tra-sua-atiso':
      return (
        <StudioWoodStage
          wallTone="#29261D"
          glowTone="#5C4D34"
          woodTone="#3B3226"
          shadowCx={108}
          shadowRx={58}
        >
          {/* Handcrafted stoneware ceramic mug handle */}
          <path
            d="M148 68C174 68 180 108 148 118"
            stroke="#C8BA9B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M149 72C168 72 172 104 149 113"
            stroke="#EAE2D0"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Glazed stoneware ceramic mug body */}
          <path
            d="M58 52H154L144 149C143 158 135 164 125 164H87C77 164 69 158 68 149L58 52Z"
            fill="#DDD2BE"
          />
          {/* Ceramic vertical sheen + unglazed stoneware foot */}
          <path
            d="M66 56H84L89 148H74L66 56Z"
            fill="#F7F4EC"
            fillOpacity="0.34"
          />
          <path
            d="M68 134H144L142 150C141 158 134 164 125 164H87C78 164 71 158 70 150L68 134Z"
            fill="#A67C2E"
            fillOpacity="0.48"
          />
          {/* Subtle kiln speckles */}
          <circle cx="82" cy="94" r="1.3" fill="#6B6255" fillOpacity="0.55" />
          <circle cx="114" cy="112" r="1.4" fill="#6B6255" fillOpacity="0.5" />
          <circle cx="132" cy="86" r="1.2" fill="#6B6255" fillOpacity="0.5" />
          <circle cx="96" cy="126" r="1.3" fill="#6B6255" fillOpacity="0.45" />

          {/* Creamy artichoke milk tea rim + velvety foam */}
          <ellipse cx="106" cy="52" rx="48" ry="18" fill="#EEEADF" />
          <ellipse cx="106" cy="52" rx="43" ry="14" fill="#D5C8AA" />
          <ellipse cx="104" cy="53" rx="34" ry="10" fill="#E6DEC8" />

          {/* Mound of glistening honey-cooked tapioca pearls */}
          {[
            [90, 48],
            [104, 45],
            [118, 48],
            [83, 54],
            [97, 53],
            [111, 54],
            [124, 53],
            [92, 59],
            [106, 59],
            [117, 58],
          ].map(([cx, cy], idx) => (
            <GlossyPearl key={idx} cx={cx ?? 0} cy={cy ?? 0} r={5.3} />
          ))}

          {/* Layered green Đà Lạt artichoke bud on wood surface */}
          <g transform="translate(132, 108)">
            <ellipse
              cx="38"
              cy="53"
              rx="34"
              ry="11"
              fill="#1E1A14"
              fillOpacity="0.7"
            />
            <path
              d="M36 52L34 62H42L40 52Z"
              fill="#594C00"
            />
            <path d="M38 4L22 27H54L38 4Z" fill="#594C00" />
            <path d="M18 17L9 42L32 36L18 17Z" fill="#594C00" />
            <path d="M58 17L67 42L44 36L58 17Z" fill="#594C00" />
            <path d="M38 13L20 38H56L38 13Z" fill="#7A8B3B" />
            <path d="M12 31L7 54L32 48L12 31Z" fill="#7A8B3B" />
            <path d="M64 31L69 54L44 48L64 31Z" fill="#7A8B3B" />
            <path d="M26 24L18 49L38 44L26 24Z" fill="#8FA148" />
            <path d="M50 24L58 49L38 44L50 24Z" fill="#8FA148" />
            <path d="M38 25L23 52H53L38 25Z" fill="#9EB057" />
          </g>
        </StudioWoodStage>
      );

    case 'tra-sua-atiso-chuoi':
      return (
        <StudioWoodStage
          wallTone="#2B261D"
          glowTone="#6E5B33"
          woodTone="#3C3225"
          shadowCx={112}
          shadowRx={54}
        >
          {/* Bamboo craft straw */}
          <path
            d="M126 22L116 62"
            stroke="#A67C2E"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M125 22L115 62"
            stroke="#F4E3AD"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />

          {/* Rounded tulip footed glass */}
          <path
            d="M70 46H146C150 82 145 118 132 144L138 158H78L84 144C71 118 66 82 70 46Z"
            fill="#D9CBA9"
            stroke="#EEEADF"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          {/* Golden Laba banana cream upper swirl */}
          <path
            d="M71 48H145C148 72 146 94 141 108C124 114 94 102 74 108C70 92 69 70 71 48Z"
            fill="#F4E3AD"
          />
          {/* Soft banana puree ribbon */}
          <path
            d="M76 76C94 86 118 68 140 80"
            stroke="#E2BF68"
            strokeWidth="6"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          {/* Glass foot highlight */}
          <ellipse cx="108" cy="158" rx="30" ry="6" fill="#C8BA9B" fillOpacity="0.65" />
          <path
            d="M76 54C74 82 76 114 86 138"
            stroke="#F7F4EC"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.48"
          />

          {/* Tapioca pearls nestled at base of tulip glass */}
          {[
            [92, 138],
            [104, 140],
            [116, 138],
            [124, 132],
            [86, 131],
            [98, 130],
            [111, 130],
          ].map(([cx, cy], idx) => (
            <GlossyPearl key={idx} cx={cx ?? 0} cy={cy ?? 0} r={4.8} />
          ))}

          {/* Banana cream foam cap */}
          <ellipse cx="108" cy="46" rx="38" ry="10" fill="#F7F4EC" />
          <ellipse cx="108" cy="46" rx="33" ry="7" fill="#F4E3AD" />

          {/* Sliced Laba banana coins crowning the rim */}
          {[
            [92, 41, 11],
            [106, 39, 11.5],
          ].map(([cx, cy, r], idx) => (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="#F7F4EC"
                stroke="#D9B45B"
                strokeWidth="2"
              />
              <circle cx={cx} cy={cy} r={(r ?? 10) - 3.5} fill="#F4E3AD" />
              <circle cx={cx} cy={cy} r="1.6" fill="#8C6D32" />
            </g>
          ))}

          {/* Artichoke bract + Laba banana slices on dark wood */}
          <path
            d="M142 152C154 134 176 134 188 148C174 160 154 160 142 152Z"
            fill="#7A8B3B"
          />
          <path
            d="M148 148C158 139 172 140 180 148"
            stroke="#9EB057"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g>
            <ellipse
              cx="154"
              cy="158"
              rx="13"
              ry="8.5"
              fill="#F7F4EC"
              stroke="#C99E44"
              strokeWidth="2"
            />
            <ellipse cx="154" cy="158" rx="8.5" ry="5" fill="#F4E3AD" />
            <ellipse
              cx="172"
              cy="162"
              rx="12"
              ry="8"
              fill="#F7F4EC"
              stroke="#C99E44"
              strokeWidth="2"
            />
            <ellipse cx="172" cy="162" rx="7.5" ry="4.5" fill="#F4E3AD" />
          </g>
        </StudioWoodStage>
      );

    case 'tra-sua-gao-rang-khuc-bach':
      return (
        <StudioWoodStage
          wallTone="#28231B"
          glowTone="#6B5334"
          woodTone="#3A3024"
          shadowCx={112}
          shadowRx={52}
        >
          {/* Wide cylindrical café glass with crystal sham base */}
          <rect
            x="72"
            y="46"
            width="74"
            height="114"
            rx="12"
            fill="#C8BA9B"
            fillOpacity="0.32"
            stroke="#EEEADF"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          {/* Warm roasted-amber rice milk tea body */}
          <rect
            x="75"
            y="52"
            width="68"
            height="98"
            rx="8"
            fill="#B58954"
          />
          <rect
            x="75"
            y="52"
            width="68"
            height="54"
            rx="6"
            fill="#D4AE7A"
          />
          {/* Glass crystal base */}
          <rect
            x="75"
            y="148"
            width="68"
            height="10"
            rx="4"
            fill="#EEEADF"
            fillOpacity="0.35"
          />
          <rect
            x="80"
            y="58"
            width="7"
            height="84"
            rx="3.5"
            fill="#F7F4EC"
            fillOpacity="0.34"
          />

          {/* Silky milk foam rim */}
          <ellipse cx="109" cy="52" rx="34" ry="8" fill="#F7F4EC" />

          {/* Floating 3D ivory almond khúc bạch cubes inside & atop */}
          <g>
            <rect
              x="82"
              y="44"
              width="20"
              height="13"
              rx="3.5"
              fill="#F7F4EC"
              stroke="#DFD6C3"
              strokeWidth="1.2"
            />
            <rect
              x="105"
              y="42"
              width="21"
              height="14"
              rx="3.5"
              fill="#EEEADF"
              stroke="#D6CCB8"
              strokeWidth="1.2"
            />
            <rect
              x="88"
              y="66"
              width="19"
              height="13"
              rx="3.5"
              fill="#F7F4EC"
              fillOpacity="0.88"
            />
            <rect
              x="111"
              y="74"
              width="18"
              height="13"
              rx="3.5"
              fill="#F4E3AD"
              fillOpacity="0.86"
            />
            {/* Sliced toasted almonds on khúc bạch */}
            <ellipse
              cx="94"
              cy="48"
              rx="5.2"
              ry="2.3"
              fill="#F4E3AD"
              stroke="#9E6B2B"
              strokeWidth="1.2"
            />
            <ellipse
              cx="117"
              cy="47"
              rx="5.2"
              ry="2.3"
              fill="#F4E3AD"
              stroke="#9E6B2B"
              strokeWidth="1.2"
            />
          </g>

          {/* Arching golden roasted rice stalk ear & toasted almonds on tabletop */}
          <path
            d="M52 158C68 128 118 134 176 154"
            stroke="#C89D46"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {[
            [134, 141, -18],
            [144, 144, -12],
            [154, 147, -8],
            [164, 150, -4],
            [139, 149, 16],
            [150, 152, 18],
            [161, 155, 18],
          ].map(([gx, gy, rot], idx) => (
            <ellipse
              key={idx}
              cx={gx}
              cy={gy}
              rx="5.5"
              ry="2.6"
              transform={`rotate(${rot}, ${gx}, ${gy})`}
              fill="#F4E3AD"
              stroke="#A67C2E"
              strokeWidth="1"
            />
          ))}
          <ellipse
            cx="64"
            cy="158"
            rx="7"
            ry="3.4"
            fill="#F4E3AD"
            stroke="#9E6B2B"
            strokeWidth="1.4"
          />
          <ellipse
            cx="78"
            cy="163"
            rx="6.5"
            ry="3.2"
            fill="#EEEADF"
            stroke="#9E6B2B"
            strokeWidth="1.4"
          />
        </StudioWoodStage>
      );

    case 'tra-sua-tiramisu':
      return (
        <StudioWoodStage
          wallTone="#26211A"
          glowTone="#634B33"
          woodTone="#382E23"
          shadowCx={110}
          shadowRx={52}
        >
          {/* Espresso-soaked ladyfinger savoiardi biscuit tucked into cream */}
          <g transform="translate(132, 34) rotate(28)">
            <rect
              x="-8"
              y="-18"
              width="16"
              height="44"
              rx="8"
              fill="#E5BA7A"
              stroke="#B88642"
              strokeWidth="1.5"
            />
            {/* Espresso-dipped lower half */}
            <rect
              x="-8"
              y="6"
              width="16"
              height="20"
              rx="6"
              fill="#4A321F"
            />
            <circle cx="-2" cy="-8" r="1.2" fill="#F7F4EC" fillOpacity="0.8" />
            <circle cx="3" cy="-3" r="1.1" fill="#F7F4EC" fillOpacity="0.8" />
            <circle cx="-1" cy="1" r="1.2" fill="#F7F4EC" fillOpacity="0.75" />
          </g>

          {/* Flared dessert milk-tea glass */}
          <path
            d="M66 56H150L136 154C135 160 129 164 122 164H94C87 164 81 160 80 154L66 56Z"
            fill="#7D6349"
            stroke="#EEEADF"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
          {/* Rich espresso ribbon middle layer */}
          <path d="M68 68H148L144 96H72L68 68Z" fill="#463120" />
          {/* Creamy milk-tea swirling tendrils */}
          <path
            d="M74 96C88 108 106 88 122 104C130 112 138 100 142 106L135 152H81L74 96Z"
            fill="#B89B78"
          />

          {/* Thick piped mascarpone cream peaks */}
          <path
            d="M64 58C64 42 78 36 88 42C94 28 118 28 124 42C136 36 152 44 152 58C134 65 82 65 64 58Z"
            fill="#F7F4EC"
          />
          <path
            d="M70 56C76 45 88 44 96 48C104 38 116 38 124 48C132 45 142 48 146 56"
            fill="#F4E3AD"
            fillOpacity="0.7"
          />

          {/* Rich velvety cocoa powder dusting cap */}
          <path
            d="M68 49C76 38 88 40 94 43C102 31 116 31 124 43C132 40 142 42 148 50C128 46 90 46 68 49Z"
            fill="#543820"
          />
          {[80, 92, 104, 114, 126, 136, 88, 108, 120].map((cx, idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={idx < 6 ? 53 : 48}
              r="1.3"
              fill="#422B18"
            />
          ))}

          {/* Glass specular reflection + dusted cocoa garnish on wood */}
          <path
            d="M75 66L84 146"
            stroke="#F7F4EC"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />
          <ellipse
            cx="160"
            cy="156"
            rx="16"
            ry="5"
            fill="#543820"
            fillOpacity="0.75"
          />
          <rect
            x="148"
            y="148"
            width="26"
            height="9"
            rx="4.5"
            fill="#E5BA7A"
            stroke="#9E6F34"
            strokeWidth="1.2"
          />
        </StudioWoodStage>
      );

    case 'tra-sua-flan-chay-canh':
      return (
        <StudioWoodStage
          wallTone="#29231B"
          glowTone="#784E27"
          woodTone="#3B3023"
          shadowCx={110}
          shadowRx={52}
        >
          {/* Tapered bistro milk-tea glass */}
          <path
            d="M68 54H148L136 154C135 160 129 164 121 164H95C87 164 81 160 80 154L68 54Z"
            fill="#C78A4A"
            stroke="#EEEADF"
            strokeOpacity="0.42"
            strokeWidth="2"
          />
          {/* Deep Ceylon tea amber gradient zone */}
          <path
            d="M75 106H141L135 154H81L75 106Z"
            fill="#945B27"
          />

          {/* Burnt-caramel (cháy cạnh) wall ribbons clinging down inner glass */}
          <path
            d="M72 60C78 78 74 96 82 114C88 128 84 140 88 150M94 58C90 78 102 92 96 116M122 58C128 76 116 96 124 118C128 130 124 142 126 150M142 60C136 80 140 98 132 120"
            stroke="#592E12"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.82"
          />
          <path
            d="M78 66C84 82 82 98 88 112M114 62C110 80 118 94 112 114"
            stroke="#B85318"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />

          {/* Whipped cream bed supporting the flan */}
          <ellipse cx="108" cy="54" rx="40" ry="10" fill="#F7F4EC" />

          {/* Glossy golden 3D bánh flan custard pudding crowning the drink */}
          <path
            d="M84 32H132L138 53C124 59 92 59 78 53L84 32Z"
            fill="#F4DA8C"
          />
          <path
            d="M84 32H132L134 40C120 45 96 45 82 40L84 32Z"
            fill="#8F3811"
          />
          <ellipse cx="108" cy="32" rx="24" ry="7" fill="#B84B16" />
          {/* Caramel drip down flan side + glossy studio highlight */}
          <path
            d="M96 37V48M118 38V50"
            stroke="#8F3811"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <ellipse
            cx="101"
            cy="31"
            rx="9"
            ry="2.5"
            fill="#F7F4EC"
            fillOpacity="0.65"
          />

          {/* Glass specular strip + caramel spoon puddle on wood */}
          <path
            d="M76 66L84 144"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.36"
          />
          <ellipse
            cx="158"
            cy="157"
            rx="16"
            ry="5.5"
            fill="#9E4214"
            fillOpacity="0.85"
          />
          <ellipse
            cx="155"
            cy="156"
            rx="7"
            ry="2"
            fill="#F4E3AD"
            fillOpacity="0.45"
          />
        </StudioWoodStage>
      );

    case 'oolong-sen-gung':
    default:
      return (
        <StudioWoodStage
          wallTone="#27241C"
          glowTone="#6E5A2C"
          woodTone="#393024"
          shadowCx={108}
          shadowRx={50}
        >
          {/* Tall slender clear highball Oolong glass */}
          <path
            d="M76 36H138L131 156C130 161 125 165 119 165H95C89 165 84 161 83 156L76 36Z"
            fill="#DE9E36"
            stroke="#F7F4EC"
            strokeOpacity="0.46"
            strokeWidth="2"
          />
          <path
            d="M80 42H134L128 148H86L80 42Z"
            fill="#EDA43A"
          />
          <path
            d="M83 102H131L128 150H86L83 102Z"
            fill="#B8711E"
          />

          {/* Clear ice cubes catching golden Oolong light */}
          <rect
            x="86"
            y="64"
            width="20"
            height="18"
            rx="4"
            fill="#F7F4EC"
            fillOpacity="0.36"
          />
          <rect
            x="106"
            y="80"
            width="20"
            height="18"
            rx="4"
            fill="#F4E3AD"
            fillOpacity="0.34"
          />

          {/* Whole ivory lotus seeds floating at top and base */}
          {[
            [92, 46],
            [108, 44],
            [122, 47],
            [96, 138],
            [113, 140],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <ellipse cx={cx} cy={cy} rx="7.2" ry="5.8" fill="#F7F4EC" />
              <ellipse cx={cx} cy={cy} rx="5.5" ry="4.2" fill="#F4E3AD" />
              <circle cx={cx} cy={cy} r="1.4" fill="#7A8B3B" />
            </g>
          ))}

          {/* Tea meniscus + glass highlight */}
          <ellipse
            cx="107"
            cy="38"
            rx="31"
            ry="6.5"
            fill="#F7F4EC"
            fillOpacity="0.35"
          />
          <path
            d="M83 48L88 144"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.42"
          />

          {/* Fresh sliced ginger root coins & Oolong tea leaves on dark wood */}
          <path
            d="M50 152C60 140 74 142 80 152C68 158 56 158 50 152Z"
            fill="#594C00"
          />
          <path
            d="M136 154C148 142 166 142 174 152C162 160 146 160 136 154Z"
            fill="#7A8B3B"
          />
          <g>
            <ellipse
              cx="154"
              cy="158"
              rx="14"
              ry="9"
              fill="#F4DF96"
              stroke="#A67C2E"
              strokeWidth="2.2"
            />
            <ellipse
              cx="154"
              cy="158"
              rx="9"
              ry="5"
              stroke="#C99E44"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <ellipse
              cx="172"
              cy="162"
              rx="11"
              ry="7.5"
              fill="#F4E3AD"
              stroke="#A67C2E"
              strokeWidth="2"
            />
          </g>
        </StudioWoodStage>
      );
  }
}
