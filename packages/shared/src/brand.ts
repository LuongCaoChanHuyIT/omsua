export const OMSUA_COLORS = {
  bgCanvasCream: '#EEEADF',
  bgSurfaceLight: '#F7F4EC',
  bgCardButter: '#F4E3AD',
  bgCardSage: '#C7CBBD',
  bgCardOliveGold: '#B6A152',
  bgCardTaupe: '#C8BA9B',
  bgHeroEspresso: '#29261D',
  brandOlivePrimary: '#594C00',
  textEspresso: '#29261D',
  textWarmMuted: '#6B6255',
  textSubheadOchre: '#A67C2E',
  accentTerracotta: '#D96B1E',
  accentCoralSketch: '#E07D77',
  accentArtichoke: '#7A8B3B',
} as const;

export type OmsuaColorKey = keyof typeof OMSUA_COLORS;
export type OmsuaColorHex = (typeof OMSUA_COLORS)[OmsuaColorKey];

export const OMSUA_BRAND = {
  name: 'Ốm Sữa',
  tagline: 'Trà sữa của người Đà Lạt • Since 2017',
  sinceYear: 2017,
  fonts: {
    display: 'Fraunces',
    editorial: 'Lora',
    ui: 'Be Vietnam Pro',
    quote: 'Dancing Script',
    snack: 'Shantell Sans',
  },
} as const;
