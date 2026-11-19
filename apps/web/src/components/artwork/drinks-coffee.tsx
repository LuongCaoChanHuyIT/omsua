import { RoastedCoffeeBean, StudioWoodStage } from './studio-stage';

export function renderCoffeeDrink(id: string) {
  switch (id) {
    case 'cold-brew-me':
      return (
        <StudioWoodStage
          wallTone="#262019"
          glowTone="#784420"
          woodTone="#3B2F22"
          shadowCx={108}
          shadowRx={54}
        >
          {/* Dehydrated caramelized citrus half-wheel perched on rim */}
          <circle
            cx="134"
            cy="52"
            r="16"
            fill="#C95A1E"
            stroke="#8C3812"
            strokeWidth="2.5"
          />
          <circle cx="134" cy="52" r="11.5" fill="#E37E2E" />
          <path
            d="M123 52H145M134 41V63M126 44L142 60M142 44L126 60"
            stroke="#F4E3AD"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />

          {/* Sleek heavy-sham rocks/apothecary glass */}
          <rect
            x="68"
            y="54"
            width="80"
            height="108"
            rx="10"
            fill="#29261D"
            fillOpacity="0.4"
            stroke="#EEEADF"
            strokeOpacity="0.52"
            strokeWidth="2.2"
          />
          {/* Rich dark mahogany-amber 18h cold brew */}
          <rect
            x="71"
            y="62"
            width="74"
            height="86"
            rx="6"
            fill="#5C2812"
          />
          <rect
            x="71"
            y="108"
            width="74"
            height="40"
            rx="4"
            fill="#2E180E"
          />
          {/* Thick crystal sham glass base */}
          <rect
            x="70"
            y="148"
            width="76"
            height="12"
            rx="4"
            fill="#EEEADF"
            fillOpacity="0.34"
          />

          {/* Single large artisanal crystal ice block refracting amber light */}
          <rect
            x="86"
            y="68"
            width="42"
            height="42"
            rx="6"
            fill="#C96A2B"
            fillOpacity="0.52"
            stroke="#F4E3AD"
            strokeOpacity="0.55"
            strokeWidth="1.8"
          />
          <path
            d="M92 74H118L102 98"
            stroke="#F7F4EC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.42"
          />

          <ellipse
            cx="108"
            cy="62"
            rx="37"
            ry="6"
            fill="#D98B48"
            fillOpacity="0.52"
          />

          {/* Curved matte-brown tamarind pod & roasted coffee beans on dark wood */}
          <path
            d="M140 157C150 143 168 140 186 151C189 154 187 160 181 160C165 154 153 156 144 163C140 165 137 161 140 157Z"
            fill="#87522D"
            stroke="#543118"
            strokeWidth="1.6"
          />
          <RoastedCoffeeBean cx={56} cy={156} rotate={-22} />
          <RoastedCoffeeBean cx={70} cy={163} rotate={18} scale={0.92} />
        </StudioWoodStage>
      );

    case 'ca-phe-muoi':
      return (
        <StudioWoodStage
          wallTone="#252019"
          glowTone="#695238"
          woodTone="#3A3023"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Short wide rocks glass on dark wood */}
          <path
            d="M66 60H150L142 154C141 160 135 164 128 164H88C81 164 75 160 74 154L66 60Z"
            fill="#2E1E14"
            stroke="#EEEADF"
            strokeOpacity="0.5"
            strokeWidth="2.2"
          />
          {/* Deep phin coffee base with sinking salted-cream tendrils */}
          <path
            d="M70 92H146L141 150H75L70 92Z"
            fill="#291B12"
          />
          <path
            d="M78 90C82 104 86 106 90 92M106 91C110 108 115 108 118 91M128 90C131 101 135 101 138 90"
            stroke="#D8CCB4"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeOpacity="0.72"
          />

          {/* Thick velvety ivory salted-cream cap */}
          <path
            d="M66 60H150L147 93C126 98 90 98 69 93L66 60Z"
            fill="#F7F4EC"
          />
          <path
            d="M68 80H148L147 93C126 98 90 98 69 93L68 80Z"
            fill="#E8DFCA"
          />
          <ellipse cx="108" cy="60" rx="42" ry="9" fill="#F7F4EC" />
          <ellipse cx="108" cy="60" rx="35" ry="6" fill="#EEEADF" />

          {/* Glistening flaky sea-salt crystals + light cocoa specks on cream */}
          {[
            [92, 58],
            [102, 56],
            [112, 60],
            [122, 58],
            [98, 62],
            [116, 56],
          ].map(([x, y], idx) => (
            <rect
              key={idx}
              x={x}
              y={y}
              width="3.4"
              height="3.4"
              rx="0.8"
              transform={`rotate(35, ${x}, ${y})`}
              fill="#C8BA9B"
              stroke="#F7F4EC"
              strokeWidth="0.8"
            />
          ))}

          {/* Glass sham highlight + coarse sea salt crystals & beans on wood */}
          <rect
            x="75"
            y="149"
            width="66"
            height="11"
            rx="4"
            fill="#EEEADF"
            fillOpacity="0.3"
          />
          <RoastedCoffeeBean cx={158} cy={156} rotate={-16} />
          <RoastedCoffeeBean cx={173} cy={161} rotate={24} scale={0.9} />
          <rect x="54" y="156" width="4" height="4" transform="rotate(20 54 156)" fill="#EEEADF" />
          <rect x="62" y="160" width="3.5" height="3.5" transform="rotate(40 62 160)" fill="#DDD2BE" />
        </StudioWoodStage>
      );

    case 'ca-phe-kem-tiramisu':
      return (
        <StudioWoodStage
          wallTone="#26211A"
          glowTone="#6E5233"
          woodTone="#392E22"
          shadowCx={108}
          shadowRx={52}
        >
          {/* Short rounded bodega café glass */}
          <path
            d="M68 58H148C151 92 146 126 136 154C135 160 129 164 122 164H94C87 164 81 160 80 154C70 126 65 92 68 58Z"
            fill="#332015"
            stroke="#EEEADF"
            strokeOpacity="0.48"
            strokeWidth="2.2"
          />
          {/* Ice hints in dark phin coffee base */}
          <rect
            x="84"
            y="104"
            width="20"
            height="18"
            rx="4"
            fill="#8C5832"
            fillOpacity="0.34"
          />
          <rect
            x="108"
            y="114"
            width="20"
            height="18"
            rx="4"
            fill="#8C5832"
            fillOpacity="0.28"
          />

          {/* Golden egg-tiramisu cream cap */}
          <path
            d="M68 58H148C149 72 148 84 146 94C124 100 92 100 70 94C68 84 67 72 68 58Z"
            fill="#F4DC92"
          />
          <path
            d="M70 84H146L145 94C124 100 92 100 71 94L70 84Z"
            fill="#D9B25F"
          />

          {/* Cocoa-dusted top with signature tiramisu crosshatch stencil grid */}
          <ellipse cx="108" cy="58" rx="40" ry="11" fill="#54361E" />
          <path
            d="M82 54L126 64M92 50L136 60M78 60L116 67M90 66L126 51M78 61L112 49M104 67L136 55"
            stroke="#F4DC92"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.78"
          />

          <path
            d="M76 68C74 96 77 124 85 148"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.34"
          />

          {/* Roasted beans + cocoa dusting on dark wood */}
          <RoastedCoffeeBean cx={156} cy={156} rotate={15} />
          <RoastedCoffeeBean cx={60} cy={158} rotate={-25} scale={0.92} />
        </StudioWoodStage>
      );

    case 'ca-phe-sua':
      return (
        <StudioWoodStage
          wallTone="#28221A"
          glowTone="#734E2B"
          woodTone="#3B3023"
          shadowCx={108}
          shadowRx={50}
        >
          {/* Classic stainless Vietnamese café spoon handle */}
          <path
            d="M128 24L114 72"
            stroke="#C8BA9B"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Classic faceted Vietnamese ly khía glass */}
          <path
            d="M72 42H144L133 156C132 161 127 165 120 165H96C89 165 84 161 83 156L72 42Z"
            fill="#7D4A24"
            stroke="#F7F4EC"
            strokeOpacity="0.5"
            strokeWidth="2.2"
          />
          {/* Rich condensed milk ribbon at bottom of ly khía */}
          <path
            d="M81 138H135L133 156C132 161 127 165 120 165H96C89 165 84 161 83 156L81 138Z"
            fill="#F7F4EC"
          />
          <path
            d="M79 124C96 132 118 120 136 128L135 140H81L79 124Z"
            fill="#C9965B"
          />

          {/* Cracked ice cubes in Cầu Đất milk coffee */}
          <rect
            x="84"
            y="58"
            width="20"
            height="18"
            rx="4"
            fill="#F4E3AD"
            fillOpacity="0.38"
          />
          <rect
            x="108"
            y="68"
            width="20"
            height="18"
            rx="4"
            fill="#F4E3AD"
            fillOpacity="0.32"
          />

          {/* Iconic vertical glass facets (khía) along lower body */}
          {[88, 98, 108, 118, 128].map((x, idx) => (
            <line
              key={idx}
              x1={x + (idx - 2) * 1.5}
              y1="92"
              x2={x}
              y2="160"
              stroke="#F7F4EC"
              strokeWidth="1.6"
              strokeOpacity="0.34"
            />
          ))}

          {/* Frothy café crema rim */}
          <ellipse cx="108" cy="44" rx="35" ry="7.5" fill="#D9B382" />
          <ellipse cx="108" cy="44" rx="26" ry="4.5" fill="#F4E3AD" />

          {/* Roasted Cầu Đất coffee beans on tabletop */}
          <RoastedCoffeeBean cx={152} cy={154} rotate={-18} />
          <RoastedCoffeeBean cx={168} cy={159} rotate={22} />
          <RoastedCoffeeBean cx={60} cy={157} rotate={12} scale={0.9} />
        </StudioWoodStage>
      );

    case 'bac-xiu-da-lat':
      return (
        <StudioWoodStage
          wallTone="#27221B"
          glowTone="#6E583A"
          woodTone="#3A3024"
          shadowCx={108}
          shadowRx={50}
        >
          {/* Tall slender 3-layer Đà Lạt Bạc Xỉu glass */}
          <path
            d="M76 36H140L132 156C131 161 126 165 120 165H96C90 165 85 161 84 156L76 36Z"
            fill="#EFE9DC"
            stroke="#F7F4EC"
            strokeOpacity="0.52"
            strokeWidth="2.2"
          />

          {/* Layer 1 (Bottom): Sweet ivory condensed milk */}
          <path
            d="M82 132H134L132 156C131 161 126 165 120 165H96C90 165 85 161 84 156L82 132Z"
            fill="#F4E3AD"
          />
          {/* Layer 2 (Middle): Warm steamed Đà Lạt fresh milk */}
          <path d="M79 78H137L134 132H82L79 78Z" fill="#F7F4EC" />
          {/* Marbled coffee-milk transition */}
          <path
            d="M78 72C94 80 116 68 138 76L137 86C116 78 96 90 79 82L78 72Z"
            fill="#B88858"
          />
          {/* Layer 3 (Top): Rich Cầu Đất espresso float + golden crema */}
          <path d="M76 38H140L138 75H78L76 38Z" fill="#4A2B18" />
          <ellipse cx="108" cy="38" rx="32" ry="7" fill="#C99860" />
          <ellipse cx="108" cy="38" rx="22" ry="4" fill="#F4E3AD" fillOpacity="0.78" />

          <path
            d="M83 48L89 148"
            stroke="#EEEADF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />

          {/* Cinnamon stick & roasted coffee bean on wood surface */}
          <path
            d="M144 158L182 148"
            stroke="#8C5227"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M145 157L181 147"
            stroke="#B5733E"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <RoastedCoffeeBean cx={60} cy={156} rotate={-14} />
        </StudioWoodStage>
      );

    case 'ca-phe-den':
    default:
      return (
        <StudioWoodStage
          wallTone="#251F18"
          glowTone="#6E4524"
          woodTone="#3A2E21"
          shadowCx={108}
          shadowRx={56}
        >
          {/* Short faceted Highland lowball glass of dark Cầu Đất coffee (ZERO green leaves!) */}
          <path
            d="M68 58H148L139 152C138 158 132 163 125 163H91C84 163 78 158 77 152L68 58Z"
            fill="#291B12"
            stroke="#EEEADF"
            strokeOpacity="0.52"
            strokeWidth="2.2"
          />
          {/* Glowing amber-mahogany coffee refraction around cracked ice */}
          <path
            d="M71 64H145L141 108H75L71 64Z"
            fill="#4D2914"
          />
          <rect
            x="82"
            y="68"
            width="23"
            height="20"
            rx="4.5"
            fill="#A65A26"
            fillOpacity="0.5"
            stroke="#F4E3AD"
            strokeOpacity="0.4"
            strokeWidth="1.4"
          />
          <rect
            x="108"
            y="76"
            width="22"
            height="20"
            rx="4.5"
            fill="#944D1E"
            fillOpacity="0.45"
            stroke="#F4E3AD"
            strokeOpacity="0.35"
            strokeWidth="1.4"
          />
          <rect
            x="92"
            y="98"
            width="24"
            height="19"
            rx="4.5"
            fill="#7D3E18"
            fillOpacity="0.4"
          />

          {/* Golden-tan phin crema ring at meniscus */}
          <ellipse cx="108" cy="60" rx="39" ry="7.5" fill="#B57B42" />
          <ellipse cx="108" cy="60" rx="31" ry="4.8" fill="#422413" />
          <circle cx="82" cy="60" r="1.6" fill="#F4E3AD" fillOpacity="0.75" />
          <circle cx="87" cy="62" r="1.2" fill="#F4E3AD" fillOpacity="0.7" />
          <circle cx="130" cy="61" r="1.5" fill="#F4E3AD" fillOpacity="0.7" />

          {/* Heavy crystal glass base */}
          <rect
            x="78"
            y="148"
            width="60"
            height="11"
            rx="4"
            fill="#EEEADF"
            fillOpacity="0.32"
          />
          <path
            d="M76 68L82 144"
            stroke="#F7F4EC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.36"
          />

          {/* Generous scatter of roasted Cầu Đất coffee beans across dark wood foreground */}
          <RoastedCoffeeBean cx={54} cy={149} rotate={-28} scale={0.95} />
          <RoastedCoffeeBean cx={66} cy={159} rotate={16} scale={1.02} />
          <RoastedCoffeeBean cx={82} cy={166} rotate={-8} scale={0.94} />
          <RoastedCoffeeBean cx={146} cy={154} rotate={24} scale={1.0} />
          <RoastedCoffeeBean cx={162} cy={148} rotate={-19} scale={0.92} />
          <RoastedCoffeeBean cx={166} cy={162} rotate={12} scale={1.04} />
          <RoastedCoffeeBean cx={184} cy={156} rotate={-32} scale={0.9} />
        </StudioWoodStage>
      );
  }
}
