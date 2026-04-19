export interface SanityImage {
  _type: "image";
  asset:
    | { _ref: string; _type: "reference" }
    | {
        _id: string;
        url: string;
        metadata?: { dimensions?: { width: number; height: number }; lqip?: string };
      };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  alt?: string;
  caption?: string;
}

export interface SanitySlug {
  _type: "slug";
  current: string;
}

export interface BlockContent {
  _type: "block";
  _key: string;
  style: string;
  children: { _key: string; _type: string; text: string; marks: string[] }[];
  markDefs: { _key: string; _type: string; href?: string }[];
}

// Section types

export interface HeroSection {
  _type: "heroSection";
  _key: string;
  sectionTitle?: string;
  heading?: string;
  subheading?: string;
  backgroundImage?: SanityImage;
  minHeight?: "40vh" | "60vh" | "80vh" | "100vh";
  overlayOpacity?: number;
  textAlign?: "left" | "center" | "right";
  textPosition?: "top" | "center" | "bottom";
}

export interface TextSection {
  _type: "textSection";
  _key: string;
  sectionTitle?: string;
  content?: BlockContent[];
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  textAlign?: "left" | "center" | "right";
  fontSize?: "sm" | "base" | "lg";
  lineHeight?: "tight" | "normal" | "relaxed" | "loose";
  letterSpacing?: "tighter" | "tight" | "normal" | "wide" | "wider";
}

export interface ImageSection {
  _type: "imageSection";
  _key: string;
  sectionTitle?: string;
  image?: SanityImage;
  caption?: string;
  fullWidth?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: number;
  grayscale?: boolean;
  opacity?: number;
  rotation?: number;
}

export interface SpacingSection {
  _type: "spacingSection";
  _key: string;
  height?: number;
}

export interface GallerySection {
  _type: "gallerySection";
  _key: string;
  sectionTitle?: string;
  images?: (SanityImage & { _key: string; aspectRatio?: string })[];
  columns?: 2 | 3;
  gap?: number;
  aspectRatio?: string;
  borderRadius?: number;
  objectFit?: "cover" | "contain";
}

export interface VideoSection {
  _type: "videoSection";
  _key: string;
  sectionTitle?: string;
  videoFile?: { asset: { url: string } };
  vimeoUrl?: string;
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
  poster?: SanityImage;
  aspectRatio?: string;
  borderRadius?: number;
}

export interface SplitSection {
  _type: "splitSection";
  _key: string;
  sectionTitle?: string;
  image?: SanityImage;
  imagePosition?: "left" | "right";
  content?: BlockContent[];
  caption?: string;
  imageAspectRatio?: string;
  verticalAlign?: "start" | "center" | "end";
  gap?: number;
  objectFit?: "cover" | "contain";
  borderRadius?: number;
}

export type Section =
  | HeroSection
  | TextSection
  | ImageSection
  | GallerySection
  | VideoSection
  | SplitSection
  | SpacingSection;

// Free object types (absolutely positioned)

export interface FreePositionFields {
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  zIndex?: number;
  rotation?: number;
  opacity?: number;
}

export interface FreeImageObject extends FreePositionFields {
  _type: "freeImageObject";
  _key: string;
  image?: SanityImage;
  borderRadius?: number;
  grayscale?: boolean;
}

export interface FreeVideoObject extends FreePositionFields {
  _type: "freeVideoObject";
  _key: string;
  videoFile?: { asset: { url: string } };
  vimeoUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  aspectRatio?: string;
  borderRadius?: number;
}

export interface FreeTextObject extends FreePositionFields {
  _type: "freeTextObject";
  _key: string;
  content?: BlockContent[];
  fontSize?: "sm" | "base" | "lg" | "xl";
  textAlign?: "left" | "center" | "right";
  color?: string;
}

export type FreeObject = FreeImageObject | FreeVideoObject | FreeTextObject;

// Document types

export interface Project {
  _id: string;
  _type: "project";
  title: string;
  slug: SanitySlug;
  status: "draft" | "published";
  created_at?: string;
  category?: string;
  tags?: string[];
  sidebarMode?: "auto" | "hidden";
  isSelectedOnHome?: boolean;
  homeOrder?: number;
  meta_description?: string;
  cover_image?: SanityImage;
  og_image?: SanityImage;
  sections?: Section[];
  freeObjects?: FreeObject[];
}

export interface ProjectSummary {
  _id: string;
  title: string;
  slug: SanitySlug;
  status: "draft" | "published";
  created_at?: string;
  category?: string;
  tags?: string[];
  sidebarMode?: "auto" | "hidden";
  isSelectedOnHome?: boolean;
  homeOrder?: number;
  cover_image?: SanityImage;
}

export interface SocialLink {
  _key: string;
  platform: string;
  label?: string;
  url: string;
}

export interface SiteSettings {
  _id: string;
  name: string;
  bio?: string;

  logo?: SanityImage;
  social_links?: SocialLink[];
  contact_email?: string;
  contact_phone?: string;
  copyright?: string;
  cv?: {
    file?: { asset: { url: string } };
    url?: string;
  };
}
