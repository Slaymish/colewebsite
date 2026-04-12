import type { TextSection, BlockContent } from "../../types";

interface TextSectionProps {
  section: TextSection;
}

function renderBlock(block: BlockContent) {
  const text = block.children.map((child) => {
    let content: React.ReactNode = child.text;
    if (child.marks.includes("strong"))
      content = <strong key={child._key}>{content}</strong>;
    if (child.marks.includes("em"))
      content = <em key={child._key}>{content}</em>;

    const linkMark = block.markDefs.find(
      (def) => child.marks.includes(def._key) && def._type === "link",
    );
    if (linkMark?.href) {
      content = (
        <a
          key={child._key}
          href={linkMark.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          {content}
        </a>
      );
    }
    return content;
  });

  const className = "leading-relaxed";

  switch (block.style) {
    case "h2":
      return (
        <h2
          key={block._key}
          className="mt-8 text-2xl font-semibold tracking-tight"
        >
          {text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={block._key} className="mt-6 text-xl font-medium">
          {text}
        </h3>
      );
    case "blockquote":
      return (
        <blockquote
          key={block._key}
          className="border-l-2 border-neutral-300 pl-4 italic text-neutral-600"
        >
          {text}
        </blockquote>
      );
    default:
      return (
        <p key={block._key} className={className}>
          {text}
        </p>
      );
  }
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
    <section className="px-8 py-10">
      <div
        className={`prose prose-neutral mx-auto ${maxWidth} space-y-4 ${fontSize} ${lineHeight} ${letterSpacing} text-neutral-800`}
        style={{ textAlign }}
      >
        {section.content.map((block) => renderBlock(block))}
      </div>
    </section>
  );
}
