export type SocialLinks = {
  instagram?: string
  facebook?: string
  tiktok?: string
  twitter?: string
  youtube?: string
  whatsappApi?: string
}

export type SiteConfig = {
  siteName: string
  brandTagline?: string
  email: string
  whatsapp: string
  phonePretty?: string
  social: SocialLinks
}

export const siteConfig: SiteConfig = {
  siteName: "🍀GANACOMIVAN💫",
  brandTagline: "La Mejor Experiencia en Rifas Online",
  email: "ganacomivan@gmail.com",
  whatsapp: "+584226889951",
  phonePretty: "+584226889951",
  social: {
    instagram: undefined,
    facebook: undefined,
    tiktok: undefined,
    twitter: undefined,
    youtube: undefined,
    whatsappApi: undefined
  }
}

export default siteConfig

