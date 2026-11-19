import { GlossyPearl, SandwichCookie, StudioWoodStage } from './studio-stage';

export function renderMilkBlendedDrink(id: string) {
  switch (id) {
    case 'sua-tuoi-kem-trung-nuong':
      return (
        <StudioWoodStage
          wallTone="#28231B"
          glowTone="#6E5730"
          woodTone="#3B3124"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Rounded Đà Lạt fresh milk glass */}
          <path
            d="M70 46H146C149 84 144 124 134 156C133 161 128 165 121 165H95C88 165 83 161 82 156C72 124 67 84 70 46Z"
            fill="#F7F4EC"
            stroke="#DFD6C4"
            strokeOpacity="0.65"
            strokeWidth="2"
          />
          {/* Subtle warm shadow side of fresh milk */}
          <path
            d="M112 76H145C144 108 139 136 133 155H108L112 76Z"
            fill="#EBE2CE"
          />

          {/* Thick custardy golden egg-cream cap (kem trứng) */}
          <path
            d="M70 46H146C147 58 147 70 145 80C126 86 92 76 71 81C69 70 69 58 70 46Z"
            fill="#F4DC8E"
          />
          <path
            d="M72 78C90 88 118 74 144 82"
            stroke="#D9A84E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Torched caramelized crème brûlée crust blisters */}
          <ellipse cx="108" cy="46" rx="38" ry="9.5" fill="#E6BA5A" />
          <ellipse cx="96" cy="45" rx="13" ry="4.5" fill="#B84F18" />
          <ellipse cx="120" cy="47" rx="12" ry="4" fill="#9E3F12" />
          <ellipse cx="106" cy="49" rx="9" ry="3.2" fill="#592810" />
          <ellipse cx="85" cy="47" rx="6" ry="2.4" fill="#D96B1E" />
          <ellipse
            cx="93"
            cy="43"
            rx="6"
            ry="1.8"
            fill="#F7F4EC"
            fillOpacity="0.55"
          />

          {/* Bed of honey-glazed pearls at bottom */}
          {[
            [88, 152],
            [100, 154],
            [112, 154],
            [124, 151],
            [93, 143],
            [106, 144],
            [119, 143],
          ].map(([cx, cy], idx) => (
            <GlossyPearl key={idx} cx={cx ?? 0} cy={cy ?? 0} r={5} />
          ))}

          <path
            d="M77 58C75 90 78 122 85 148"
            stroke="#EEEADF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Raw cane sugar crystals on wood surface */}
          <rect x="148" y="152" width="8" height="7" rx="1.8" fill="#C98A3A" />
          <rect x="159" y="156" width="7" height="6" rx="1.5" fill="#A66524" />
          <rect x="169" y="153" width="6" height="6" rx="1.5" fill="#E5B45B" />
        </StudioWoodStage>
      );

    case 'sua-tuoi-duong-den':
      return (
        <StudioWoodStage
          wallTone="#262019"
          glowTone="#734824"
          woodTone="#3A2F22"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Curvy boba milk glass */}
          <path
            d="M68 44H146L135 155C134 161 128 165 121 165H93C86 165 80 161 79 155L68 44Z"
            fill="#F7F4EC"
            stroke="#DFD6C4"
            strokeOpacity="0.6"
            strokeWidth="2"
          />

          {/* Warm simmering dark-molasses syrup base */}
          <path
            d="M76 126C94 118 118 122 138 126L135 155C134 161 128 165 121 165H93C86 165 80 161 79 155L76 126Z"
            fill="#5E2D13"
          />

          {/* Dramatic organic đường đen tiger-stripe molasses wall drips */}
          <path
            d="M72 64C84 74 78 92 92 98C104 104 96 120 106 128M142 60C128 72 134 90 120 98C108 105 118 118 112 128"
            stroke="#6B3315"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d="M75 88C88 96 84 112 96 118M138 86C126 96 130 112 120 120M96 62C102 76 112 72 118 84"
            stroke="#A85620"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.88"
          />

          {/* Glossy dark-molasses boba bed */}
          {[
            [86, 152],
            [98, 154],
            [110, 154],
            [122, 151],
            [84, 141],
            [96, 142],
            [108, 141],
            [120, 140],
            [92, 132],
            [106, 132],
            [116, 131],
          ].map(([cx, cy], idx) => (
            <GlossyPearl key={idx} cx={cx ?? 0} cy={cy ?? 0} r={5} />
          ))}

          {/* Frothy milk cap dusted with brown sugar */}
          <ellipse cx="107" cy="44" rx="39" ry="8.5" fill="#F7F4EC" />
          <ellipse cx="107" cy="44" rx="28" ry="5" fill="#F4E3AD" />
          <circle cx="98" cy="43" r="1.5" fill="#7A3E18" />
          <circle cx="108" cy="45" r="1.6" fill="#7A3E18" />
          <circle cx="116" cy="43" r="1.4" fill="#A85620" />

          {/* Rustic unrefined đường đen blocks on wood */}
          <polygon points="146,158 156,149 168,153 162,162" fill="#7A3E18" />
          <polygon points="164,161 173,153 183,157 177,164" fill="#9E5422" />
        </StudioWoodStage>
      );

    case 'matcha-latte':
      return (
        <StudioWoodStage
          wallTone="#25261D"
          glowTone="#586932"
          woodTone="#383125"
          shadowCx={108}
          shadowRx={50}
        >
          {/* Straight-sided Japanese café glass */}
          <rect
            x="74"
            y="40"
            width="68"
            height="124"
            rx="10"
            fill="#F7F4EC"
            stroke="#DFD6C4"
            strokeOpacity="0.6"
            strokeWidth="2"
          />

          {/* Layered ivory Đà Lạt milk bottom + marbled transition + vibrant Uji matcha top */}
          <path
            d="M75 94C90 102 104 88 120 98C129 103 136 96 141 99V46C141 43 138 41 135 41H81C78 41 75 43 75 46V94Z"
            fill="#7A8B3B"
          />
          <path
            d="M75 88C92 98 108 82 124 94C132 100 137 94 141 96V108C126 114 96 102 75 110V88Z"
            fill="#9EB256"
            fillOpacity="0.78"
          />

          {/* Ice cubes peeking across the matcha-milk boundary */}
          <rect
            x="84"
            y="64"
            width="20"
            height="18"
            rx="4"
            fill="#F7F4EC"
            fillOpacity="0.32"
          />
          <rect
            x="108"
            y="96"
            width="20"
            height="18"
            rx="4"
            fill="#EEEADF"
            fillOpacity="0.72"
          />

          {/* Whisked Uji matcha microfoam latte swirl */}
          <ellipse cx="108" cy="42" rx="33" ry="7.5" fill="#8FA347" />
          <path
            d="M90 42C98 38 118 38 124 43C116 46 98 46 90 42Z"
            fill="#F7F4EC"
            fillOpacity="0.78"
          />
          <rect
            x="80"
            y="50"
            width="6"
            height="102"
            rx="3"
            fill="#F7F4EC"
            fillOpacity="0.38"
          />

          {/* Small ceramic matcha scoop & vibrant Uji powder mound on dark wood */}
          <path
            d="M148 158C154 148 170 148 176 158Z"
            fill="#7A8B3B"
          />
          <path
            d="M168 152L192 145"
            stroke="#C8A974"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </StudioWoodStage>
      );

    case 'oreo-tra-da-xay':
      return (
        <StudioWoodStage
          wallTone="#27211B"
          glowTone="#6B4D36"
          woodTone="#3A2F24"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Tall flared frappe glass — roasted cocoa-tea ice blended (NO green!) */}
          <path
            d="M66 56H150L135 156C134 161 128 165 121 165H95C88 165 82 161 81 156L66 56Z"
            fill="#8E6B4E"
            stroke="#EEEADF"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          {/* Frosty roasted tea & cocoa slush swirls */}
          <path
            d="M69 68C90 82 118 64 147 78L142 110C118 98 92 114 74 102L69 68Z"
            fill="#6E4F37"
          />
          <path
            d="M76 112C98 124 118 108 140 120L135 155H81L76 112Z"
            fill="#543B29"
          />
          {/* Crushed dark wafer flecks suspended in tea slush */}
          {[
            [84, 78],
            [102, 86],
            [124, 76],
            [92, 108],
            [114, 102],
            [128, 114],
            [96, 134],
            [118, 138],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="2" fill="#29261D" />
          ))}

          {/* Tall sculpted whipped cream dome */}
          <path
            d="M64 58C68 38 84 34 94 38C100 24 116 24 122 38C134 34 148 40 152 58C130 64 86 64 64 58Z"
            fill="#F7F4EC"
          />
          <path
            d="M74 52C88 44 106 46 120 40M82 57C100 50 120 52 138 48"
            stroke="#DFD5C2"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Detailed dark sandwich Oreo wafer cookie with cream filling & crumbs */}
          <SandwichCookie cx={126} cy={31} rotate={24} scale={0.95} />
          {[
            [84, 44, 2.4],
            [94, 39, 2.0],
            [103, 46, 2.6],
            [90, 51, 1.8],
            [110, 49, 2.1],
          ].map(([cx, cy, r], idx) => (
            <circle key={idx} cx={cx} cy={cy} r={r} fill="#29261D" />
          ))}

          {/* Cookie half + cocoa wafer crumbs on dark wood */}
          <SandwichCookie cx={162} cy={155} rotate={-8} scale={0.78} />
          <circle cx="140" cy="159" r="2.3" fill="#29261D" />
          <circle cx="182" cy="161" r="2" fill="#29261D" />
        </StudioWoodStage>
      );

    case 'matcha-oreo-da-xay':
      return (
        <StudioWoodStage
          wallTone="#25261D"
          glowTone="#5A6B32"
          woodTone="#383024"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Flared ice-blended frappe cup with vibrant Uji matcha slush */}
          <path
            d="M68 56H148L134 156C133 161 128 165 121 165H95C88 165 83 161 82 156L68 56Z"
            fill="#7A8B3B"
            stroke="#EEEADF"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <path
            d="M71 72C94 62 118 82 145 70L140 108C116 118 92 98 75 110L71 72Z"
            fill="#93A64C"
          />
          <path
            d="M77 116C98 106 118 124 139 114L134 155H82L77 116Z"
            fill="#5C6B28"
          />
          {/* Suspended cookie crumble in matcha slush */}
          {[
            [86, 82],
            [106, 78],
            [126, 88],
            [94, 116],
            [118, 112],
            [104, 138],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="2.1" fill="#29261D" />
          ))}

          {/* Whipped cream peaks */}
          <path
            d="M66 58C70 40 84 36 96 40C104 25 116 25 124 40C136 36 146 42 150 58C130 64 86 64 66 58Z"
            fill="#F7F4EC"
          />
          {/* Sandwich Oreo cookie + matcha & cookie crumble */}
          <SandwichCookie cx={90} cy={32} rotate={-22} scale={0.92} />
          {[
            [110, 42, 2.4],
            [120, 47, 2.2],
            [130, 44, 1.9],
            [104, 50, 2.0],
          ].map(([cx, cy, r], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill={idx % 2 === 0 ? '#29261D' : '#594C00'}
            />
          ))}

          {/* Crushed Oreo & matcha leaf on tabletop */}
          <path
            d="M140 156C150 144 166 145 174 155C162 162 148 162 140 156Z"
            fill="#7A8B3B"
          />
          <circle cx="64" cy="157" r="3" fill="#29261D" />
          <circle cx="73" cy="161" r="2.2" fill="#29261D" />
        </StudioWoodStage>
      );

    case 'yogurt-dau-tam':
    default:
      return (
        <StudioWoodStage
          wallTone="#28211F"
          glowTone="#7A364B"
          woodTone="#3B2F26"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Curved yogurt parfait glass */}
          <path
            d="M70 46H146C150 82 144 122 134 155C133 161 128 165 121 165H95C88 165 83 161 82 155C72 122 66 82 70 46Z"
            fill="#F7F4EC"
            stroke="#DFD6C4"
            strokeOpacity="0.6"
            strokeWidth="2"
          />

          {/* Ruby-purple Đà Lạt mulberry compote swirls marbled through ivory yogurt */}
          <path
            d="M72 74C92 62 108 88 130 74C138 69 143 73 146 78L143 102C122 114 98 90 74 104L72 74Z"
            fill="#9A2B48"
          />
          <path
            d="M78 122C96 112 114 134 138 120L134 155C133 161 128 165 121 165H95C88 165 83 161 82 155L78 122Z"
            fill="#6E1831"
          />
          <path
            d="M76 92C94 104 118 86 140 98"
            stroke="#E07D77"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Creamy homemade yogurt crown + whole mulberries on top */}
          <path
            d="M68 48C78 34 98 32 108 38C118 32 138 34 148 48C128 55 88 55 68 48Z"
            fill="#F7F4EC"
          />
          {[
            [98, 39],
            [104, 36],
            [110, 39],
            [102, 43],
            [108, 43],
            [120, 42],
            [125, 40],
          ].map(([cx, cy], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="3.8"
              fill={idx % 2 === 0 ? '#4A1426' : '#8C2440'}
            />
          ))}

          {/* Whole mulberries + berry compote drop on dark wood */}
          <ellipse cx="154" cy="158" rx="14" ry="5" fill="#7A1D38" fillOpacity="0.85" />
          <circle cx="150" cy="154" r="4.2" fill="#4A1426" />
          <circle cx="157" cy="155" r="4" fill="#6E1831" />
          <path
            d="M162 153C168 145 178 146 182 153C174 158 166 157 162 153Z"
            fill="#7A8B3B"
          />
        </StudioWoodStage>
      );
  }
}
