import type { Section } from "../types";
import GallerySectionComponent from "./sections/GallerySection";
import HeroSectionComponent from "./sections/HeroSection";
import ImageSectionComponent from "./sections/ImageSection";
import SpacingSectionComponent from "./sections/SpacingSection";
import SplitSectionComponent from "./sections/SplitSection";
import TextSectionComponent from "./sections/TextSection";
import VideoSectionComponent from "./sections/VideoSection";

interface SectionRendererProps {
  sections: Section[];
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <div className="flex flex-col gap-6 md:gap-9">
      {sections.map((section) => {
        switch (section._type) {
          case "heroSection":
            return <HeroSectionComponent key={section._key} section={section} />;
          case "textSection":
            return <TextSectionComponent key={section._key} section={section} />;
          case "imageSection":
            return <ImageSectionComponent key={section._key} section={section} />;
          case "gallerySection":
            return <GallerySectionComponent key={section._key} section={section} />;
          case "videoSection":
            return <VideoSectionComponent key={section._key} section={section} />;
          case "splitSection":
            return <SplitSectionComponent key={section._key} section={section} />;
          case "spacingSection":
            return <SpacingSectionComponent key={section._key} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
