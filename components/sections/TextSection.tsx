import type { TextSection, BlockContent } from "../../types";

interface TextSectionProps {
  section: TextSection;
}

/**
 * This is used to render a block of text.
 * @param block The block to render
 * @returns The rendered block
 */
function renderBlock(block: BlockContent) {
  const text = block.children.map((child) => {
    let content: React.ReactNode = child.text;
    if (child.marks.includes("strong"))
      content = <strong key={child._key}>{content}</strong>;
    if (child.marks.includes("em"))
      content = <em key={child._key}>{content}</em>;

    // Handle link annotations
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

/**
 * This is used to display a section of text.
 * @param param0
 * @returns
 */
export default function TextSectionComponent({ section }: TextSectionProps) {
  if (!section.content?.length) return null;

  return (
    <section className="px-8 py-10">
      <div className="prose prose-neutral mx-auto max-w-2xl space-y-4 text-base text-neutral-800">
        {section.content.map((block) => renderBlock(block))}
      </div>
    </section>
  );
}
