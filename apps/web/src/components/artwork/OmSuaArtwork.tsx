import type { ProductCategoryId } from '@omsua/shared';
import { renderCoffeeDrink } from './drinks-coffee';
import { renderFruitTeaDrink } from './drinks-fruit-tea';
import { renderMilkBlendedDrink } from './drinks-milk-blended';
import { renderMilkTeaDrink } from './drinks-milk-tea';
import { renderSnackPlate, renderToppingBowl } from './snacks-and-toppings';

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
        strokeOpacity="0.24"
        strokeWidth="2"
      />
      <rect
        x="5.5"
        y="5.5"
        width="77"
        height="77"
        rx="14.5"
        stroke="#C8BA9B"
        strokeOpacity="0.45"
        strokeWidth="1"
      />

      {/* Circumflex hat + Đà Lạt artichoke leaf sprout */}
      <path
        d="M21 22.5L31.5 11.5L42 22.5"
        stroke="#29261D"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41.5 15.5C45.5 10.5 52.5 10.5 55 15C50.5 17.8 45 17.8 41.5 15.5Z"
        fill="#7A8B3B"
      />
      <path
        d="M43.5 15.2C46.8 13.8 50.2 13.8 53 14.8"
        stroke="#F4E3AD"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Stylized Ô + interlocking S monogram */}
      <path
        d="M31.5 25C24 25 19.5 30 19.5 36.5C19.5 43 25 46 31.5 47.5C38 49 41.5 52 41.5 57.5C41.5 63.5 36.2 67.5 29 67.5C23 67.5 19 64.2 18.5 59.5"
        stroke="#29261D"
        strokeWidth="4.1"
        strokeLinecap="round"
      />
      <circle
        cx="31.5"
        cy="36"
        r="5.5"
        stroke="#594C00"
        strokeWidth="2.8"
      />
      <circle cx="31.5" cy="36" r="1.8" fill="#7A8B3B" />

      {/* Editorial serif 'm' */}
      <path
        d="M46 43V31.5C46 31.5 48.5 29.5 51.5 29.5C54.5 29.5 56 31.5 56 34.5V43M56 34.5C56 31.5 58.8 29.5 62 29.5C65 29.5 67 31.5 67 35V43"
        stroke="#29261D"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 'sữa' editorial serif */}
      <text
        x="45"
        y="61"
        fill="#594C00"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--font-editorial), Georgia, serif"
      >
        sữa
      </text>

      {/* Ornamental dots + SINCE 2017 */}
      <circle cx="16" cy="75.5" r="1.1" fill="#A67C2E" />
      <circle cx="72" cy="75.5" r="1.1" fill="#A67C2E" />
      <text
        x="44"
        y="78"
        textAnchor="middle"
        fill="#6B6255"
        fontSize="7.4"
        fontWeight="700"
        letterSpacing="1.5"
        fontFamily="var(--font-sans), system-ui, sans-serif"
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
      <circle cx="60" cy="62" r="47" fill="#F4E3AD" fillOpacity="0.48" />

      {/* Outer artichoke crown bracts */}
      <path d="M60 10L46 29H74L60 10Z" fill="#594C00" />
      <path d="M38 19L30 40L52 34L38 19Z" fill="#594C00" />
      <path d="M82 19L90 40L68 34L82 19Z" fill="#594C00" />

      {/* Layered green Đà Lạt artichoke petals + veins */}
      <path
        d="M60 16L44 37H76L60 16Z"
        fill="#7A8B3B"
        stroke="#29261D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M31 31L25 54L46 46L31 31Z"
        fill="#7A8B3B"
        stroke="#29261D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M89 31L95 54L74 46L89 31Z"
        fill="#7A8B3B"
        stroke="#29261D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M45 24L36 46L58 41L45 24Z"
        fill="#8FA148"
        stroke="#29261D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M75 24L84 46L62 41L75 24Z"
        fill="#8FA148"
        stroke="#29261D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M60 22V34" stroke="#C7D48B" strokeWidth="1.4" strokeLinecap="round" />

      {/* Side hood petals hugging cheeks */}
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

      {/* Cozy Đà Lạt knit sweater body */}
      <path
        d="M34 105C34 89 45 81 60 81C75 81 86 89 86 105H34Z"
        fill="#C8BA9B"
        stroke="#29261D"
        strokeWidth="2.2"
      />
      <path
        d="M47 84C52 88 68 88 73 84"
        stroke="#594C00"
        strokeWidth="1.8"
        strokeLinecap="round"
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
        d="M39 56C41 43 50 38 60 38C70 38 79 43 81 56C75 50 68 48 60 48C52 48 45 50 39 56Z"
        fill="#3B2E22"
      />

      {/* Expressive warm eyes with catchlight sparkles, rosy blush & gentle smile */}
      <path
        d="M47.5 58.5C49.5 56.5 53.5 56.5 55.5 58.5"
        stroke="#29261D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M64.5 58.5C66.5 56.5 70.5 56.5 72.5 58.5"
        stroke="#29261D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="51.5" cy="61.5" r="2.7" fill="#29261D" />
      <circle cx="50.6" cy="60.6" r="1" fill="#F7F4EC" />
      <circle cx="68.5" cy="61.5" r="2.7" fill="#29261D" />
      <circle cx="67.6" cy="60.6" r="1" fill="#F7F4EC" />

      <ellipse
        cx="46.5"
        cy="66.8"
        rx="4.6"
        ry="2.6"
        fill="#E07D77"
        fillOpacity="0.72"
      />
      <ellipse
        cx="73.5"
        cy="66.8"
        rx="4.6"
        ry="2.6"
        fill="#E07D77"
        fillOpacity="0.72"
      />
      <path
        d="M56.8 67.5C58.4 70 61.6 70 63.2 67.5"
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
      <line x1="50" y1="88" x2="70" y2="88" stroke="#F7F4EC" strokeWidth="2.4" />
      <circle cx="56" cy="101" r="2" fill="#29261D" />
      <circle cx="60" cy="102" r="2" fill="#29261D" />
      <circle cx="64" cy="101" r="2" fill="#29261D" />
      <circle
        cx="49"
        cy="94"
        r="4"
        fill="#F5DFC6"
        stroke="#29261D"
        strokeWidth="1.8"
      />
      <circle
        cx="71"
        cy="94"
        r="4"
        fill="#F5DFC6"
        stroke="#29261D"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const MILK_TEA_IDS = new Set([
  'tra-sua-atiso',
  'tra-sua-atiso-chuoi',
  'tra-sua-gao-rang-khuc-bach',
  'tra-sua-tiramisu',
  'tra-sua-flan-chay-canh',
  'oolong-sen-gung',
]);

const FRUIT_TEA_IDS = new Set([
  'quyt-nhai-cat-tuong',
  'tra-atiso-sen-chia',
  'tra-dau-tam-da-lat',
  'tra-me-thot-not',
  'tra-so-ri-buoi-hong',
  'kombucha-chanh-vang',
]);

const MILK_BLENDED_IDS = new Set([
  'sua-tuoi-kem-trung-nuong',
  'sua-tuoi-duong-den',
  'matcha-latte',
  'oreo-tra-da-xay',
  'matcha-oreo-da-xay',
  'yogurt-dau-tam',
]);

const COFFEE_IDS = new Set([
  'cold-brew-me',
  'ca-phe-muoi',
  'ca-phe-kem-tiramisu',
  'ca-phe-sua',
  'bac-xiu-da-lat',
  'ca-phe-den',
]);

function renderDrinkArtwork(
  targetId: string,
  categoryId?: ProductCategoryId | 'topping',
) {
  if (MILK_TEA_IDS.has(targetId)) {
    return renderMilkTeaDrink(targetId);
  }
  if (FRUIT_TEA_IDS.has(targetId)) {
    return renderFruitTeaDrink(targetId);
  }
  if (MILK_BLENDED_IDS.has(targetId)) {
    return renderMilkBlendedDrink(targetId);
  }
  if (COFFEE_IDS.has(targetId)) {
    return renderCoffeeDrink(targetId);
  }

  switch (categoryId) {
    case 'fruit-tea':
      return renderFruitTeaDrink('quyt-nhai-cat-tuong');
    case 'fresh-milk-blended':
      return renderMilkBlendedDrink('sua-tuoi-kem-trung-nuong');
    case 'coffee':
      return renderCoffeeDrink('ca-phe-sua');
    default:
      return renderMilkTeaDrink('tra-sua-atiso');
  }
}

export interface ProductIllustrationProps {
  productId?: string;
  toppingId?: string;
  id?: string;
  categoryId?: ProductCategoryId | 'topping';
  variant?: 'card' | 'spotlight' | 'topping' | 'snack';
  className?: string;
  title?: string;
  alt?: string;
}

export function ProductIllustration({
  productId,
  toppingId,
  id,
  categoryId,
  variant = 'card',
  className = 'h-full w-full',
  title,
  alt,
}: ProductIllustrationProps) {
  const targetId = productId ?? toppingId ?? id ?? '';
  const accessibleLabel = title?.trim() || alt?.trim() || undefined;
  const svgA11yProps = accessibleLabel
    ? ({ role: 'img', 'aria-label': accessibleLabel } as const)
    : ({ 'aria-hidden': 'true' } as const);

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
        preserveAspectRatio="xMidYMid slice"
        {...svgA11yProps}
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
        preserveAspectRatio="xMidYMid slice"
        {...svgA11yProps}
      >
        {renderSnackPlate(targetId)}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      {...svgA11yProps}
    >
      {renderDrinkArtwork(targetId, categoryId)}
    </svg>
  );
}
