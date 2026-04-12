import type { TextSection } from "../../types";
import { renderBlock } from "../../lib/renderBlock";

interface TextSectionProps {
  section: TextSection;
}

const maxWidthMap: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

const fontSizeMap: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const lineHeightMap: Record<string, string> = {
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

const letterSpacingMap: Record<string, string> = {
  tighter: "tracking-tighter",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
  wider: "tracking-wider",
};

export default function TextSectionComponent({ section }: TextSectionProps) {
  if (!section.content?.length) return null;

  const maxWidth = maxWidthMap[section.maxWidth ?? "md"] ?? "max-w-2xl";
  const fontSize = fontSizeMap[section.fontSize ?? "base"] ?? "text-base";
  const lineHeight = lineHeightMap[section.lineHeight ?? "relaxed"] ?? "leading-relaxed";
  const letterSpacing = letterSpacingMap[section.letterSpacing ?? "normal"] ?? "tracking-normal";
  const textAlign = section.textAlign ?? "left";

  return (
    <section className="px-5 py-6 md:px-8 md:py-10">
      <div
        className={`prose mx-auto ${maxWidth} space-y-4 ${fontSize} ${lineHeight} ${letterSpacing} text-black/80`}
        style={{ textAlign }}
      >
        {section.content.map((block) => renderBlock(block, { variant: "section" }))}
      </div>
    </section>
  );
}
