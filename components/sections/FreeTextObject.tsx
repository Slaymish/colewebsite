import type { FreeTextObject } from "../../types";
import { renderBlock } from "../../lib/renderBlock";

interface FreeTextObjectProps {
  obj: FreeTextObject;
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
  const color = obj.color ?? "#000000";

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
      {obj.content.map((block) => renderBlock(block, { variant: "compact" }))}
    </div>
  );
}
