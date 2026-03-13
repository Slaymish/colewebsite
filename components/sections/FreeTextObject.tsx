import type { FreeTextObject, BlockContent } from "../../types";

interface FreeTextObjectProps {
  obj: FreeTextObject;
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

  switch (block.style) {
    case "h2":
      return (
        <h2
          key={block._key}
          className="text-2xl font-semibold tracking-tight"
        >
          {text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={block._key} className="text-xl font-medium">
          {text}
        </h3>
      );
    default:
      return (
        <p key={block._key} className="leading-relaxed">
          {text}
        </p>
      );
  }
}

const fontSizeMap: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export default function FreeTextObjectComponent({ obj }: FreeTextObjectProps) {
  if (!obj.content?.length) return null;

  const x = obj.xPercent ?? 10;
  const y = obj.yPercent ?? 10;
  const width = obj.widthPercent ?? 40;
  const zIndex = obj.zIndex ?? 10;
  const rotation = obj.rotation ?? 0;
  const opacity = obj.opacity ?? 1;
  const fontSize = fontSizeMap[obj.fontSize ?? "base"] ?? "text-base";
  const textAlign = obj.textAlign ?? "left";
  const color = obj.color ?? "#171717";

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        zIndex,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        opacity,
        color,
        textAlign,
      }}
      className={`${fontSize} space-y-2`}
    >
      {obj.content.map((block) => renderBlock(block))}
    </div>
  );
}
