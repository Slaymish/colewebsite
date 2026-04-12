import type { SpacingSection } from "../../types";

interface SpacingSectionProps {
  section: SpacingSection;
}

export default function SpacingSectionComponent({ section }: SpacingSectionProps) {
  const height = section.height ?? 80;
  return (
    <>
      <div className="md:hidden" style={{ height: Math.round(height * 0.5) }} aria-hidden="true" />
      <div className="hidden md:block" style={{ height }} aria-hidden="true" />
    </>
  );
}
