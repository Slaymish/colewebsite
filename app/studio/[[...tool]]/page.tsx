'use client'

/**
 * Sanity Studio embedded at /studio
 * Access restricted via Sanity's own authentication.
 * Configure your Sanity project CORS settings to allow this origin.
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
