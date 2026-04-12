import type { BlockContent } from "../types";

interface RenderBlockOptions {
  /**
   * "section" (default): heading margins + blockquote support — for TextSection.
   * "compact": no extra margins, blockquote falls back to normal paragraph — for free objects.
   */
  variant?: "section" | "compact";
}

export function renderBlock(
  block: BlockContent,
  options: RenderBlockOptions = {},
): React.ReactNode {
  const compact = options.variant === "compact";

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
          className={
            compact
              ? "text-2xl font-semibold tracking-tight"
              : "mt-8 text-2xl font-semibold tracking-tight"
          }
        >
          {text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={block._key}
          className={
            compact ? "text-xl font-medium" : "mt-6 text-xl font-medium"
          }
        >
          {text}
        </h3>
      );
    case "blockquote":
      if (compact) {
        return (
          <p key={block._key} className="leading-relaxed">
            {text}
          </p>
        );
      }
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
        <p key={block._key} className="leading-relaxed">
          {text}
        </p>
      );
  }
}
