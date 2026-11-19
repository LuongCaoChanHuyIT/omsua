'use client';
/* eslint-disable @next/next/no-img-element */

import { getProductPhoto } from '@omsua/shared';
import { useState } from 'react';
import {
  ProductIllustration,
  type ProductIllustrationProps,
} from './OmSuaArtwork';

export interface ProductMediaProps extends ProductIllustrationProps {
  preferIllustration?: boolean;
}

export function ProductMedia({
  preferIllustration = false,
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
  const photo = preferIllustration ? null : getProductPhoto(targetId);

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

  return (
    <img
      src={photo.src}
      alt={accessibleLabel ?? ''}
      aria-hidden={accessibleLabel ? undefined : 'true'}
      loading="lazy"
      decoding="async"
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
