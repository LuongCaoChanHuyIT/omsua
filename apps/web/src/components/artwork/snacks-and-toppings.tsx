import { GlossyPearl } from './studio-stage';

function KumquatHalf({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#7A8B3B" />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="#F4C84B" />
      <circle cx={cx} cy={cy} r={r * 0.56} fill="#E0761E" />
      <path
        d={`M${cx - r * 0.5} ${cy}H${cx + r * 0.5}M${cx} ${cy - r * 0.5}V${cy + r * 0.5}`}
        stroke="#F4E3AD"
        strokeWidth="1"
      />
    </g>
  );
}

export function renderSnackPlate(id: string) {
  return (
    <g>
      {/* Warm woven Đà Lạt linen studio tabletop */}
      <rect width="200" height="180" rx="22" fill="#EEEADF" />
      <path
        d="M16 28H184M16 90H184M16 152H184M34 14V166M166 14V166"
        stroke="#DFD7C5"
        strokeWidth="1"
        strokeOpacity="0.55"
      />

      {id === 'banh-trang-tron-top-mo' && (
        <g>
          <rect
            x="24"
            y="26"
            width="156"
            height="134"
            rx="20"
            fill="#B8AA8E"
            fillOpacity="0.5"
          />
          {/* Matte dark ceramic rectangular platter */}
          <rect
            x="20"
            y="20"
            width="156"
            height="134"
            rx="18"
            fill="#29261D"
            stroke="#5C5346"
            strokeWidth="2.5"
          />
          <rect
            x="27"
            y="27"
            width="142"
            height="120"
            rx="13"
            fill="#221F17"
            stroke="#3D372E"
            strokeWidth="1.2"
          />

          {/* Tossed chili-satế rice paper ribbons */}
          <ellipse cx="96" cy="88" rx="56" ry="42" fill="#C95A1B" fillOpacity="0.9" />
          <path
            d="M48 72C68 62 92 78 122 66M44 88C72 78 98 96 134 84M50 104C76 96 102 112 128 102M60 116C82 110 104 120 120 114"
            stroke="#F4C77B"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M54 78L118 74M52 96L124 92"
            stroke="#E58938"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Shredded green mango julienne at upper-right */}
          {[0, 1, 2, 3, 4].map((idx) => (
            <line
              key={idx}
              x1={114 + idx * 4}
              y1={44 + idx * 3}
              x2={148 + idx * 2}
              y2={68 + idx * 4}
              stroke={idx % 2 === 0 ? '#F4E3AD' : '#D5DC7E'}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          ))}

          {/* Fresh rau răm herb leaves at lower-right */}
          <path
            d="M106 118C118 108 136 110 146 120C134 128 118 128 106 118Z"
            fill="#7A8B3B"
          />
          <path
            d="M118 126C130 118 146 122 154 132C140 138 126 136 118 126Z"
            fill="#594C00"
          />

          {/* Crispy golden tóp mỡ pork rind cubes with blister highlights */}
          {[
            [74, 74],
            [92, 70],
            [84, 86],
            [102, 84],
            [72, 94],
            [94, 98],
          ].map(([x, y], idx) => (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width="13"
                height="11"
                rx="3"
                fill="#A86828"
                stroke="#6E3D12"
                strokeWidth="1.2"
              />
              <circle
                cx={(x ?? 0) + 4}
                cy={(y ?? 0) + 4}
                r="1.8"
                fill="#F4E3AD"
                fillOpacity="0.8"
              />
            </g>
          ))}

          {/* Roasted peanuts & halved kumquats */}
          <ellipse cx="136" cy="108" rx="4.5" ry="3" fill="#E5C18A" />
          <ellipse cx="144" cy="113" rx="4.5" ry="3" fill="#D4AA72" />
          <ellipse cx="132" cy="116" rx="4.5" ry="3" fill="#E5C18A" />
          <KumquatHalf cx={48} cy={116} r={9} />
          <KumquatHalf cx={148} cy={46} r={8} />
        </g>
      )}

      {id === 'com-chay-cha-bong' && (
        <g>
          <rect
            x="26"
            y="26"
            width="152"
            height="132"
            rx="18"
            fill="#B8AA8E"
            fillOpacity="0.5"
          />
          {/* Matte dark ceramic square-ish platter */}
          <rect
            x="22"
            y="21"
            width="152"
            height="132"
            rx="18"
            fill="#29261D"
            stroke="#5C5346"
            strokeWidth="2.5"
          />

          {/* Golden puffed cơm cháy crispy rice square */}
          <rect
            x="42"
            y="38"
            width="112"
            height="98"
            rx="12"
            fill="#B87624"
            stroke="#8C5414"
            strokeWidth="2"
          />
          <rect x="47" y="43" width="102" height="88" rx="9" fill="#DEAA4B" />

          {/* Puffed golden rice grain texture */}
          {[
            [56, 52],
            [70, 50],
            [126, 52],
            [138, 56],
            [54, 118],
            [68, 122],
            [128, 120],
            [140, 114],
          ].map(([cx, cy], idx) => (
            <ellipse
              key={idx}
              cx={cx}
              cy={cy}
              rx="4.5"
              ry="2.5"
              fill="#F4E3AD"
            />
          ))}

          {/* Fluffy wispy chà bông pork floss mound */}
          <ellipse cx="98" cy="87" rx="44" ry="33" fill="#E89D42" />
          <path
            d="M58 72C76 58 118 60 136 74M54 86C78 74 118 76 140 88M58 100C80 90 116 92 136 102M68 111C88 103 110 105 126 112"
            stroke="#D96B1E"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M64 78C84 68 112 70 130 80M62 94C84 84 112 86 132 95"
            stroke="#F4E3AD"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Scallion oil (mỡ hành) green rings & chili glaze */}
          {[
            [78, 76],
            [98, 82],
            [116, 74],
            [86, 96],
            [108, 94],
            [96, 68],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="4.2" fill="#7A8B3B" />
              <circle cx={cx} cy={cy} r="1.6" fill="#9EB256" />
            </g>
          ))}
          <circle cx="90" cy="86" r="2.6" fill="#C93B2B" />
          <circle cx="112" cy="86" r="2.4" fill="#C93B2B" />
        </g>
      )}

      {id === 'banh-trang-cuon-bo' && (
        <g>
          <rect
            x="26"
            y="26"
            width="152"
            height="132"
            rx="18"
            fill="#B8AA8E"
            fillOpacity="0.5"
          />
          <rect
            x="22"
            y="21"
            width="152"
            height="132"
            rx="18"
            fill="#29261D"
            stroke="#5C5346"
            strokeWidth="2.5"
          />

          {/* 5 rolled translucent cuốn bơ rice-paper cylinders */}
          {[46, 72, 98, 124, 150].map((cx, idx) => (
            <g key={idx}>
              <rect
                x={cx - 10}
                y="42"
                width="20"
                height="90"
                rx="9"
                fill="#D96B1E"
                stroke="#9E4612"
                strokeWidth="1.2"
              />
              <rect
                x={cx - 7}
                y="48"
                width="14"
                height="78"
                rx="6"
                fill="#F4CF82"
                fillOpacity="0.82"
              />
              {/* Visible herb & egg filling inside translucent roll */}
              <circle cx={cx} cy="64" r="3.5" fill="#7A8B3B" fillOpacity="0.75" />
              <circle cx={cx} cy="108" r="3.5" fill="#7A8B3B" fillOpacity="0.75" />
            </g>
          ))}

          {/* Rich Đà Lạt egg-butter mayo + tamarind sauce zigzag drizzle */}
          <path
            d="M34 68Q58 56 82 70T130 68T164 66M34 94Q58 82 82 96T130 94T164 92"
            stroke="#F7F4EC"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M36 80Q62 92 88 78T140 82T162 78"
            stroke="#F4DC7A"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Crispy shallots & micro-herbs */}
          {[58, 86, 112, 138].map((cx, idx) => (
            <circle key={idx} cx={cx} cy={82 + (idx % 2) * 8} r="3" fill="#7A8B3B" />
          ))}
        </g>
      )}

      {id === 'banh-trang-sot-tac' && (
        <g>
          <ellipse cx="103" cy="95" rx="70" ry="66" fill="#B8AA8E" fillOpacity="0.52" />
          {/* Hand-thrown round dark stoneware plate */}
          <circle
            cx="100"
            cy="90"
            r="68"
            fill="#29261D"
            stroke="#5C5346"
            strokeWidth="3"
          />
          <circle
            cx="100"
            cy="90"
            r="59"
            stroke="#3E372D"
            strokeWidth="1.4"
          />

          {/* Tangy chili-kumquat glazed rice paper nest */}
          <circle cx="100" cy="90" r="49" fill="#C95219" />
          <path
            d="M62 76C84 64 114 82 136 72M58 92C86 80 112 100 140 88M66 108C88 98 114 114 132 104"
            stroke="#F4C776"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Shredded dried beef strips, quail egg half, herbs & 3 kumquat halves */}
          <path
            d="M84 74L112 68M88 102L118 96"
            stroke="#592412"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <ellipse cx="102" cy="86" rx="10" ry="7.5" fill="#F7F4EC" />
          <circle cx="102" cy="86" r="4.5" fill="#D96B1E" />

          <path
            d="M64 98C72 90 84 92 88 100C78 106 68 104 64 98Z"
            fill="#7A8B3B"
          />
          <KumquatHalf cx={72} cy={62} r={8.5} />
          <KumquatHalf cx={128} cy={112} r={8.5} />
          <KumquatHalf cx={130} cy={68} r={7.5} />
        </g>
      )}

      {id === 'phoi-suong-toi-ot' && (
        <g>
          <ellipse cx="103" cy="95" rx="70" ry="66" fill="#B8AA8E" fillOpacity="0.52" />
          {/* Woven Đà Lạt bamboo tray (mẹt tre) */}
          <circle
            cx="100"
            cy="90"
            r="68"
            fill="#D4B886"
            stroke="#A67C2E"
            strokeWidth="6"
          />
          <circle
            cx="100"
            cy="90"
            r="68"
            stroke="#7D5A1E"
            strokeWidth="2"
            strokeDasharray="7 5"
          />

          {/* Fresh round green banana leaf liner with diagonal veins */}
          <circle cx="100" cy="90" r="56" fill="#6E8233" />
          <path
            d="M52 90H148M68 62L92 90M92 54L114 90M116 58L136 90M68 118L92 90M92 126L114 90M116 122L136 90"
            stroke="#8FA348"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Folded dew-softened rice paper stack */}
          <ellipse
            cx="94"
            cy="92"
            rx="42"
            ry="33"
            fill="#F7F4EC"
            fillOpacity="0.92"
          />
          <ellipse
            cx="98"
            cy="88"
            rx="36"
            ry="27"
            fill="#EEEADF"
            stroke="#DFD5C0"
            strokeWidth="1.5"
          />

          {/* Crispy golden fried garlic & chili salt crumble */}
          <ellipse cx="94" cy="88" rx="22" ry="15" fill="#E59A38" fillOpacity="0.9" />
          {[
            [84, 84],
            [94, 81],
            [104, 86],
            [88, 92],
            [99, 93],
            [92, 87],
          ].map(([cx, cy], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="3"
              fill={idx % 2 === 0 ? '#C93824' : '#F4E3AD'}
            />
          ))}

          {/* Ceramic pinch dish of muối tôm tỏi ớt + kumquat */}
          <circle cx="132" cy="112" r="14" fill="#F7F4EC" stroke="#C8BA9B" strokeWidth="2" />
          <circle cx="132" cy="112" r="10" fill="#D94E24" />
          <KumquatHalf cx={64} cy={116} r={7.5} />
        </g>
      )}

      {id === 'banh-cham-long-dao' && (
        <g>
          <ellipse cx="103" cy="95" rx="70" ry="66" fill="#B8AA8E" fillOpacity="0.52" />
          {/* Stoneware platter with warm taupe ceramic rim */}
          <circle
            cx="100"
            cy="90"
            r="68"
            fill="#332D24"
            stroke="#C8BA9B"
            strokeWidth="5"
          />

          {/* Fan of crisp folded rice-paper wedges on left */}
          <path
            d="M42 84L82 48L90 96Z"
            fill="#F7F4EC"
            fillOpacity="0.94"
            stroke="#DFD6C3"
            strokeWidth="1.2"
          />
          <path
            d="M44 106L86 72L92 120Z"
            fill="#EEEADF"
            fillOpacity="0.94"
            stroke="#D5CBB6"
            strokeWidth="1.2"
          />
          <path
            d="M54 124L92 94L96 136Z"
            fill="#F7F4EC"
            fillOpacity="0.9"
          />

          {/* Fresh green mango & rau răm herb bundle at top */}
          <ellipse cx="110" cy="54" rx="22" ry="11" fill="#7A8B3B" />
          <path
            d="M96 50L124 46M98 56L128 52"
            stroke="#DCE085"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Ceramic dipping bowl of glossy tamarind-sesame sauce */}
          <circle
            cx="132"
            cy="106"
            r="21"
            fill="#F7F4EC"
            stroke="#C8BA9B"
            strokeWidth="2.5"
          />
          <circle cx="132" cy="106" r="16" fill="#592812" />
          <circle cx="128" cy="102" r="1.4" fill="#F4E3AD" />
          <circle cx="135" cy="105" r="1.4" fill="#F4E3AD" />
          <circle cx="131" cy="110" r="1.4" fill="#F4E3AD" />

          {/* Two runny jammy lòng đào soft-boiled egg halves */}
          {[
            [98, 118],
            [134, 70],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <ellipse
                cx={cx}
                cy={cy}
                rx="13.5"
                ry="10"
                fill="#F7F4EC"
                stroke="#DFD6C3"
                strokeWidth="1.2"
              />
              <circle cx={cx} cy={cy} r="6.5" fill="#E57A1E" />
              <circle cx={cx} cy={cy} r="4.2" fill="#C94818" />
              <circle
                cx={(cx ?? 0) - 2}
                cy={(cy ?? 0) - 2}
                r="1.6"
                fill="#F4E3AD"
              />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

export function renderToppingBowl(id: string) {
  const isDarkRamekin = id === 'kem-trung';

  return (
    <g>
      {/* Warm woven linen backdrop */}
      <rect width="160" height="160" rx="22" fill="#EEEADF" />
      <path
        d="M14 36H146M14 124H146M36 14V146M124 14V146"
        stroke="#DFD7C5"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <ellipse
        cx="83"
        cy="95"
        rx="53"
        ry="46"
        fill="#B8AA8E"
        fillOpacity="0.48"
      />

      {/* Macro stoneware ceramic bowl */}
      <circle
        cx="80"
        cy="80"
        r="52"
        fill={isDarkRamekin ? '#29261D' : '#F7F4EC'}
        stroke={isDarkRamekin ? '#5C5245' : '#C8BA9B'}
        strokeWidth="5"
      />
      <circle cx="80" cy="80" r="43" fill="#362C22" />

      {id === 'tran-chau-den' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#4A2B16" />
          <path
            d="M52 64C66 52 94 52 108 64"
            stroke="#8C5226"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.55"
          />
          {[
            [64, 58],
            [80, 54],
            [96, 59],
            [54, 74],
            [70, 71],
            [86, 70],
            [102, 75],
            [58, 90],
            [74, 86],
            [90, 87],
            [104, 91],
            [68, 102],
            [84, 101],
            [97, 102],
          ].map(([cx, cy], idx) => (
            <GlossyPearl key={idx} cx={cx ?? 0} cy={cy ?? 0} r={8.2} />
          ))}
        </g>
      )}

      {id === 'tran-chau-trang' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#8C806E" />
          {[
            [64, 58],
            [81, 55],
            [97, 61],
            [56, 75],
            [73, 72],
            [89, 73],
            [104, 78],
            [61, 92],
            [78, 88],
            [94, 91],
            [72, 103],
            [88, 103],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r="8.2"
                fill="#F7F4EC"
                fillOpacity="0.92"
                stroke="#DDD4C3"
                strokeWidth="1.2"
              />
              <circle
                cx={(cx ?? 0) + 2}
                cy={(cy ?? 0) + 2}
                r="4.5"
                fill="#DDD4C3"
                fillOpacity="0.55"
              />
              <circle
                cx={(cx ?? 0) - 2.6}
                cy={(cy ?? 0) - 2.6}
                r="2.2"
                fill="#F4E3AD"
              />
            </g>
          ))}
        </g>
      )}

      {id === 'kem-trung' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#F4DC8C" />
          {/* Creamy custardy swirl */}
          <path
            d="M52 78C60 58 98 56 108 78C102 100 64 104 56 86C62 70 90 68 96 82C92 90 76 92 74 82"
            stroke="#D6A442"
            strokeWidth="4.8"
            strokeLinecap="round"
          />
          {/* Blowtorched caramelized amber spots */}
          <ellipse cx="70" cy="66" rx="8" ry="5" fill="#B84E18" fillOpacity="0.72" />
          <ellipse cx="94" cy="74" rx="7" ry="4.5" fill="#8C3712" fillOpacity="0.65" />
          <ellipse cx="78" cy="94" rx="9" ry="4.5" fill="#C96420" fillOpacity="0.6" />
          <ellipse cx="66" cy="64" rx="4" ry="1.8" fill="#F7F4EC" fillOpacity="0.65" />
        </g>
      )}

      {id === 'banh-flan' && (
        <g>
          {/* Translucent golden caramel syrup pool */}
          <circle cx="80" cy="80" r="42" fill="#9E4816" />
          <circle cx="80" cy="82" r="37" fill="#C96B24" fillOpacity="0.55" />

          {/* 3D silky custard flan body */}
          <path
            d="M54 66H106L112 94C98 106 62 106 48 94L54 66Z"
            fill="#F4DC8E"
          />
          <ellipse cx="80" cy="92" rx="32" ry="13" fill="#E6C167" />

          {/* Dark amber caramel mirror glaze top */}
          <ellipse cx="80" cy="68" rx="27" ry="13" fill="#7D2E0E" />
          <ellipse cx="80" cy="67" rx="23" ry="10" fill="#B84B16" />
          <path
            d="M66 74V88M95 73V86"
            stroke="#8C3510"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <ellipse
            cx="72"
            cy="63"
            rx="9"
            ry="3"
            fill="#F7F4EC"
            fillOpacity="0.68"
          />
        </g>
      )}

      {id === 'hat-sen' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#5C4831" />
          {[
            [63, 60],
            [82, 57],
            [99, 65],
            [56, 78],
            [74, 75],
            [92, 79],
            [104, 88],
            [63, 95],
            [80, 93],
            [93, 99],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <ellipse
                cx={cx}
                cy={cy}
                rx="9.5"
                ry="7.8"
                fill="#F7F4EC"
                stroke="#D9C48C"
                strokeWidth="1"
              />
              <ellipse cx={cx} cy={cy} rx="7.2" ry="5.6" fill="#F4E3AD" />
              {/* Characteristic lotus heart dimple */}
              <circle cx={cx} cy={cy} r="2" fill="#7A8B3B" />
            </g>
          ))}
        </g>
      )}

      {id === 'khuc-bach' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#595043" />
          {/* 3D beveled ivory & golden almond khúc bạch cubes */}
          {[
            [50, 56, '#F7F4EC'],
            [78, 52, '#EEEADF'],
            [54, 79, '#F4E3AD'],
            [82, 76, '#F7F4EC'],
            [68, 94, '#EEEADF'],
          ].map(([x, y, fill], idx) => (
            <rect
              key={idx}
              x={Number(x)}
              y={Number(y)}
              width="25"
              height="17"
              rx="4"
              fill={String(fill)}
              stroke="#D6CCB8"
              strokeWidth="1.2"
            />
          ))}
          {/* Toasted sliced almond flakes */}
          {[
            [66, 65, -15],
            [92, 62, 20],
            [70, 86, 12],
            [95, 85, -18],
            [82, 101, 8],
          ].map(([cx, cy, rot], idx) => (
            <ellipse
              key={idx}
              cx={cx}
              cy={cy}
              rx="6"
              ry="2.8"
              transform={`rotate(${rot}, ${cx}, ${cy})`}
              fill="#F4E3AD"
              stroke="#9E6826"
              strokeWidth="1.4"
            />
          ))}
        </g>
      )}

      {id === 'hat-dac-rim' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#4D341B" />
          {[
            [64, 60, -18],
            [84, 58, 15],
            [99, 71, -12],
            [58, 78, 14],
            [78, 76, -8],
            [95, 89, 20],
            [65, 95, -14],
            [82, 96, 10],
          ].map(([cx, cy, rot], idx) => (
            <g key={idx} transform={`rotate(${rot}, ${cx}, ${cy})`}>
              <ellipse
                cx={cx}
                cy={cy}
                rx="10.5"
                ry="7.2"
                fill={idx % 2 === 0 ? '#F4D57E' : '#E58A65'}
                fillOpacity="0.92"
              />
              <ellipse
                cx={(cx ?? 0) - 2.5}
                cy={(cy ?? 0) - 2}
                rx="4.2"
                ry="1.8"
                fill="#F7F4EC"
                fillOpacity="0.72"
              />
            </g>
          ))}
          {/* Passionfruit rim seeds */}
          <circle cx="73" cy="68" r="1.6" fill="#29261D" />
          <circle cx="89" cy="81" r="1.6" fill="#29261D" />
          <circle cx="72" cy="88" r="1.6" fill="#29261D" />
        </g>
      )}

      {id === 'thach-cu-nang' && (
        <g>
          <circle cx="80" cy="80" r="42" fill="#381A22" />
          {[
            [56, 56],
            [75, 53],
            [93, 60],
            [52, 75],
            [71, 72],
            [89, 76],
            [102, 86],
            [60, 92],
            [78, 90],
            [91, 97],
          ].map(([x, y], idx) => (
            <g key={idx}>
              {/* Outer translucent ruby jelly coat */}
              <rect
                x={(x ?? 0) - 7.5}
                y={(y ?? 0) - 7.5}
                width="15"
                height="15"
                rx="3.8"
                fill={idx % 2 === 0 ? '#D93B4E' : '#B82538'}
              />
              {/* Crisp ivory water-chestnut core inside */}
              <rect
                x={(x ?? 0) - 4}
                y={(y ?? 0) - 4}
                width="8"
                height="8"
                rx="2"
                fill="#F7F4EC"
                fillOpacity="0.68"
              />
              <circle
                cx={(x ?? 0) - 4}
                cy={(y ?? 0) - 4}
                r="1.4"
                fill="#F7F4EC"
              />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}
