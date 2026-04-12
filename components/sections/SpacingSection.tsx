import type { SpacingSection } from "../../types";

interface SpacingSectionProps {
  section: SpacingSection;
}

export default function SpacingSectionComponent({ section }: SpacingSectionProps) {
  return <div style={{ height: section.height ?? 80 }} aria-hidden="true" />;
}
