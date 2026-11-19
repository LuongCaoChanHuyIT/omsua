import type {
  IceLevel,
  OrderItemInput,
  ProductItem,
  ProductSizeCode,
  SpiceLevel,
  SugarLevel,
  ToppingItem,
} from './domain';

export interface CustomizerDraftState {
  productId: string;
  kind: 'drink' | 'snack';
  size: ProductSizeCode;
  sugarLevel: SugarLevel;
  iceLevel: IceLevel;
  toppingIds: string[];
  spiceLevel: SpiceLevel;
  quantity: number;
}

export type CustomizerDraftAction =
  | { type: 'SET_SIZE'; size: ProductSizeCode }
  | { type: 'SET_SUGAR'; sugarLevel: SugarLevel }
  | { type: 'SET_ICE'; iceLevel: IceLevel }
  | { type: 'TOGGLE_TOPPING'; toppingId: string }
  | { type: 'SET_SPICE'; spiceLevel: SpiceLevel }
  | { type: 'SET_QUANTITY'; quantity: number }
  | { type: 'STEP_QUANTITY'; delta: number };

function clampDraftQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(99, Math.max(1, Math.round(value)));
}

function sortUniqueIds(ids: readonly string[]): string[] {
  return Array.from(new Set(ids)).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

export function createCustomizerDraftState(
  product: ProductItem,
  options?: {
    initialSpiceLevel?: SpiceLevel;
    initialToppingIds?: readonly string[];
    availableToppings?: readonly ToppingItem[];
  },
): CustomizerDraftState {
  const defaultSize: ProductSizeCode =
    product.sizes[0]?.size ?? (product.kind === 'snack' ? 'STD' : 'M');

  let validInitialToppings: string[] = [];
  if (product.kind === 'drink' && options?.initialToppingIds?.length) {
    if (options.availableToppings) {
      const allowed = new Set(
        options.availableToppings
          .filter((topping) => topping.isAvailable)
          .map((topping) => topping.id),
      );
      validInitialToppings = sortUniqueIds(
        options.initialToppingIds.filter((id) => allowed.has(id)),
      );
    } else {
      validInitialToppings = sortUniqueIds(options.initialToppingIds);
    }
  }

  return {
    productId: product.id,
    kind: product.kind,
    size: defaultSize,
    sugarLevel: '70',
    iceLevel: '70',
    toppingIds: validInitialToppings,
    spiceLevel: options?.initialSpiceLevel ?? 'cay-vua',
    quantity: 1,
  };
}

export function reduceCustomizerDraftState(
  state: CustomizerDraftState,
  action: CustomizerDraftAction,
): CustomizerDraftState {
  switch (action.type) {
    case 'SET_SIZE':
      return state.size === action.size
        ? state
        : { ...state, size: action.size };
    case 'SET_SUGAR':
      return state.sugarLevel === action.sugarLevel
        ? state
        : { ...state, sugarLevel: action.sugarLevel };
    case 'SET_ICE':
      return state.iceLevel === action.iceLevel
        ? state
        : { ...state, iceLevel: action.iceLevel };
    case 'TOGGLE_TOPPING': {
      if (state.kind !== 'drink') {
        return state;
      }
      const exists = state.toppingIds.includes(action.toppingId);
      const nextToppings = exists
        ? state.toppingIds.filter((id) => id !== action.toppingId)
        : sortUniqueIds([...state.toppingIds, action.toppingId]);
      return { ...state, toppingIds: nextToppings };
    }
    case 'SET_SPICE':
      return state.spiceLevel === action.spiceLevel
        ? state
        : { ...state, spiceLevel: action.spiceLevel };
    case 'SET_QUANTITY': {
      const nextQty = clampDraftQuantity(action.quantity);
      return state.quantity === nextQty ? state : { ...state, quantity: nextQty };
    }
    case 'STEP_QUANTITY': {
      const nextQty = clampDraftQuantity(state.quantity + action.delta);
      return state.quantity === nextQty ? state : { ...state, quantity: nextQty };
    }
    default:
      return state;
  }
}

export function draftStateToOrderItemInput(
  state: CustomizerDraftState,
): OrderItemInput {
  const quantity = clampDraftQuantity(state.quantity);
  if (state.kind === 'snack') {
    return {
      productId: state.productId,
      quantity,
      size: state.size,
      spiceLevel: state.spiceLevel,
    };
  }

  return {
    productId: state.productId,
    quantity,
    size: state.size,
    sugarLevel: state.sugarLevel,
    iceLevel: state.iceLevel,
    toppingIds: sortUniqueIds(state.toppingIds),
  };
}
