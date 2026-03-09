import type { Section } from '../types'
import HeroSectionComponent from './sections/HeroSection'
import TextSectionComponent from './sections/TextSection'
import ImageSectionComponent from './sections/ImageSection'
import GallerySectionComponent from './sections/GallerySection'
import VideoSectionComponent from './sections/VideoSection'
import SplitSectionComponent from './sections/SplitSection'

interface SectionRendererProps {
  sections: Section[]
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case 'heroSection':
            return <HeroSectionComponent key={section._key} section={section} />
          case 'textSection':
            return <TextSectionComponent key={section._key} section={section} />
          case 'imageSection':
            return <ImageSectionComponent key={section._key} section={section} />
          case 'gallerySection':
            return <GallerySectionComponent key={section._key} section={section} />
          case 'videoSection':
            return <VideoSectionComponent key={section._key} section={section} />
          case 'splitSection':
            return <SplitSectionComponent key={section._key} section={section} />
          default:
            return null
        }
      })}
    </>
  )
}
