import { project } from './schemas/project'
import { siteSettings } from './schemas/siteSettings'
import {
  heroSection,
  textSection,
  imageSection,
  gallerySection,
  videoSection,
  splitSection,
  spacingSection,
  freeImageObject,
  freeVideoObject,
  freeTextObject,
} from './schemas/sections'

export const schemaTypes = [
  // Documents
  project,
  siteSettings,
  // Section object types (predefined layout)
  heroSection,
  textSection,
  imageSection,
  gallerySection,
  videoSection,
  splitSection,
  spacingSection,
  // Free object types (absolutely positioned)
  freeImageObject,
  freeVideoObject,
  freeTextObject,
]
