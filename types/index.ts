export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  alt?: string
  caption?: string
}

export interface SanitySlug {
  _type: 'slug'
  current: string
}

export interface BlockContent {
  _type: 'block'
  _key: string
  style: string
  children: { _key: string; _type: string; text: string; marks: string[] }[]
  markDefs: { _key: string; _type: string; href?: string }[]
}

// Section types

export interface HeroSection {
  _type: 'heroSection'
  _key: string
  heading?: string
  subheading?: string
  backgroundImage?: SanityImage
}

export interface TextSection {
  _type: 'textSection'
  _key: string
  content?: BlockContent[]
}

export interface ImageSection {
  _type: 'imageSection'
  _key: string
  image?: SanityImage
  caption?: string
  fullWidth?: boolean
}

export interface GallerySection {
  _type: 'gallerySection'
  _key: string
  images?: (SanityImage & { _key: string })[]
  columns?: 2 | 3
}

export interface VideoSection {
  _type: 'videoSection'
  _key: string
  vimeoUrl?: string
  caption?: string
  autoplay?: boolean
  loop?: boolean
  poster?: SanityImage
}

export interface SplitSection {
  _type: 'splitSection'
  _key: string
  image?: SanityImage
  imagePosition?: 'left' | 'right'
  content?: BlockContent[]
  caption?: string
}

export type Section =
  | HeroSection
  | TextSection
  | ImageSection
  | GallerySection
  | VideoSection
  | SplitSection

// Document types

export interface Project {
  _id: string
  _type: 'project'
  title: string
  slug: SanitySlug
  status: 'draft' | 'published'
  created_at?: string
  tags?: string[]
  meta_description?: string
  cover_image?: SanityImage
  og_image?: SanityImage
  sections?: Section[]
}

export interface ProjectSummary {
  _id: string
  title: string
  slug: SanitySlug
  status: 'draft' | 'published'
  created_at?: string
  tags?: string[]
  cover_image?: SanityImage
}

export interface SocialLink {
  _key: string
  platform: string
  label?: string
  url: string
}

export interface SiteSettings {
  _id: string
  name: string
  bio?: string
  logo?: SanityImage
  social_links?: SocialLink[]
  contact_email?: string
  copyright?: string
  cv?: {
    file?: { asset: { url: string } }
    url?: string
  }
}
