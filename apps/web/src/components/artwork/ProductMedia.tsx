'use client';
/* eslint-disable @next/next/no-img-element */

import { getProductPhoto } from '@omsua/shared';
import { useState } from 'react';
import {
  ProductIllustration,
  type ProductIllustrationProps,
} from './OmSuaArtwork';

export interface ProductMediaProps extends ProductIllustrationProps {
  priority?: boolean;
}

const DIMENSIONS_BY_VARIANT: Record<
  NonNullable<ProductIllustrationProps['variant']>,
  { width: number; height: number }
> = {
  spotlight: { width: 640, height: 480 },
  card: { width: 320, height: 380 },
  snack: { width: 480, height: 480 },
  topping: { width: 256, height: 256 },
};

export function ProductMedia({
  priority = false,
  productId,
  toppingId,
  id,
  categoryId,
  variant = 'card',
  className = 'h-full w-full',
  title,
  alt,
}: ProductMediaProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const targetId = productId ?? toppingId ?? id ?? '';
  const photo = getProductPhoto(targetId);

  if (!photo || failedSrc === photo.src) {
    return (
      <ProductIllustration
        productId={productId}
        toppingId={toppingId}
        id={id}
        categoryId={categoryId}
        variant={variant}
        className={className}
        title={title}
        alt={alt}
      />
    );
  }

  const accessibleLabel = title?.trim() || alt?.trim() || undefined;
  const dims = DIMENSIONS_BY_VARIANT[variant] ?? DIMENSIONS_BY_VARIANT.card;
  const isSpotlight = variant === 'spotlight';

  return (
    <img
      src={photo.src}
      width={dims.width}
      height={dims.height}
      alt={accessibleLabel ?? ''}
      aria-hidden={accessibleLabel ? undefined : 'true'}
      loading={isSpotlight || priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      onError={() => setFailedSrc(photo.src)}
      style={
        photo.objectPosition
          ? { objectPosition: photo.objectPosition }
          : undefined
      }
      className={`${className} bg-hero-espresso/12 object-cover`}
    />
  );
}
