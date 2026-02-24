'use client'

import { useState, useEffect } from 'react'
import { getPlaceholderImage } from '@/lib/placeholder-images'

interface ListingImageProps {
  src: string
  alt: string
  className?: string
  businessType: string
}

export function ListingImage({ src, alt, className = "", businessType }: ListingImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageAlt, setImageAlt] = useState(alt)
  const [hasError, setHasError] = useState(false)

  // Reset error state when src changes
  useEffect(() => {
    setImageSrc(src)
    setImageAlt(alt)
    setHasError(false)
  }, [src, alt])

  const handleError = () => {
    // Only set placeholder once to prevent infinite error loops
    if (!hasError && !imageSrc.includes('/placeholders/')) {
      setHasError(true)
      setImageSrc(getPlaceholderImage(businessType))
      setImageAlt(`${businessType} Business Placeholder`)
    }
  }

  return (
    <img
      src={imageSrc}
      alt={imageAlt}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  )
}