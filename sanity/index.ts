import { project } from './schemas/project'
import { siteSettings } from './schemas/siteSettings'
import {
  heroSection,
  textSection,
  imageSection,
  gallerySection,
  videoSection,
  splitSection,
} from './schemas/sections'

export const schemaTypes = [
  // Documents
  project,
  siteSettings,
  // Section object types
  heroSection,
  textSection,
  imageSection,
  gallerySection,
  videoSection,
  splitSection,
]
