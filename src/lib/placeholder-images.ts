export function getPlaceholderImage(businessType: string) {
  if (!businessType) {
    return '/placeholders/other-placeholder.svg'
  }

  const placeholders = {
    'SAAS': '/placeholders/saas-placeholder.svg',
    'ECOMMERCE': '/placeholders/ecommerce-placeholder.svg',
    'AMAZON': '/placeholders/amazon-placeholder.svg',
    'CONTENT': '/placeholders/content-placeholder.svg',
    'MOBILE_APP': '/placeholders/mobile-app-placeholder.svg',
    'MOBILEAPP': '/placeholders/mobile-app-placeholder.svg',
    'MOBILE-APP': '/placeholders/mobile-app-placeholder.svg',
    'OTHER': '/placeholders/other-placeholder.svg'
  }

  const normalizedType = businessType.toUpperCase().replace(/[\s_-]/g, '')

  // Try normalized type first
  if (placeholders[normalizedType as keyof typeof placeholders]) {
    return placeholders[normalizedType as keyof typeof placeholders]
  }

  // Try original uppercase
  if (placeholders[businessType.toUpperCase() as keyof typeof placeholders]) {
    return placeholders[businessType.toUpperCase() as keyof typeof placeholders]
  }

  return placeholders.OTHER
}