'use client'

import type {
  Section,
  HeroSection,
  TextSection,
  ImageSection,
  GallerySection,
  VideoSection,
  SplitSection,
  FreeObject,
  FreeImageObject,
  FreeVideoObject,
  FreeTextObject,
} from '../../../../types'

type PropsPanelProps =
  | {
      section: Section
      freeObject?: undefined
      onChange: (patch: Partial<Section>) => void
      onClose: () => void
    }
  | {
      section?: undefined
      freeObject: FreeObject
      onChange: (patch: Partial<FreeObject>) => void
      onClose: () => void
    }

// Shared input components
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
    />
  )
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 accent-blue-500"
      />
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 text-right focus:border-neutral-400 focus:outline-none"
      />
    </div>
  )
}

function ToggleInput({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-neutral-200'}`}
        onClick={() => onChange(!value)}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  )
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-100" />
    </div>
  )
}

// === Shared free position controls ===

function FreePositionControls({
  obj,
  onChange,
}: {
  obj: FreeObject
  onChange: (patch: Partial<FreeObject>) => void
}) {
  return (
    <>
      <SectionDivider label="Position" />

      <Field label={`X Position: ${obj.xPercent ?? 10}%`}>
        <NumberInput
          value={obj.xPercent ?? 10}
          onChange={(v) => onChange({ xPercent: v })}
          min={-50}
          max={150}
        />
      </Field>

      <Field label={`Y Position: ${obj.yPercent ?? 10}%`}>
        <NumberInput
          value={obj.yPercent ?? 10}
          onChange={(v) => onChange({ yPercent: v })}
          min={-50}
          max={150}
        />
      </Field>

      <Field label={`Width: ${obj.widthPercent ?? 40}%`}>
        <NumberInput
          value={obj.widthPercent ?? 40}
          onChange={(v) => onChange({ widthPercent: v })}
          min={5}
          max={200}
        />
      </Field>

      <Field label={`Z-Index: ${obj.zIndex ?? 10}`}>
        <NumberInput
          value={obj.zIndex ?? 10}
          onChange={(v) => onChange({ zIndex: v })}
          min={0}
          max={50}
        />
      </Field>

      <Field label={`Rotation: ${obj.rotation ?? 0}\u00B0`}>
        <NumberInput
          value={obj.rotation ?? 0}
          onChange={(v) => onChange({ rotation: v })}
          min={-180}
          max={180}
        />
      </Field>

      <Field label={`Opacity: ${Math.round((obj.opacity ?? 1) * 100)}%`}>
        <NumberInput
          value={obj.opacity ?? 1}
          onChange={(v) => onChange({ opacity: v })}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>
    </>
  )
}

// === Per-type panels (sections) ===

function HeroPanel({
  section,
  onChange,
}: {
  section: HeroSection
  onChange: (patch: Partial<HeroSection>) => void
}) {
  return (
    <div className="space-y-4">
      <Field label="Heading">
        <TextInput
          value={section.heading ?? ''}
          onChange={(v) => onChange({ heading: v })}
          placeholder="Hero heading\u2026"
        />
      </Field>

      <Field label="Subheading">
        <TextInput
          value={section.subheading ?? ''}
          onChange={(v) => onChange({ subheading: v })}
          placeholder="Subheading\u2026"
        />
      </Field>

      <SectionDivider label="Layout" />

      <Field label="Minimum Height">
        <SelectInput
          value={section.minHeight ?? '60vh'}
          onChange={(v) => onChange({ minHeight: v as HeroSection['minHeight'] })}
          options={[
            { label: '40vh', value: '40vh' },
            { label: '60vh', value: '60vh' },
            { label: '80vh', value: '80vh' },
            { label: '100vh (full screen)', value: '100vh' },
          ]}
        />
      </Field>

      <Field label="Text Position">
        <SelectInput
          value={section.textPosition ?? 'bottom'}
          onChange={(v) => onChange({ textPosition: v as HeroSection['textPosition'] })}
          options={[
            { label: 'Top', value: 'top' },
            { label: 'Center', value: 'center' },
            { label: 'Bottom', value: 'bottom' },
          ]}
        />
      </Field>

      <Field label="Text Alignment">
        <SelectInput
          value={section.textAlign ?? 'left'}
          onChange={(v) => onChange({ textAlign: v as HeroSection['textAlign'] })}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ]}
        />
      </Field>

      <SectionDivider label="Overlay" />

      <Field label={`Overlay Opacity: ${Math.round((section.overlayOpacity ?? 0.3) * 100)}%`}>
        <NumberInput
          value={section.overlayOpacity ?? 0.3}
          onChange={(v) => onChange({ overlayOpacity: v })}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>
    </div>
  )
}

function TextPanel({
  section,
  onChange,
}: {
  section: TextSection
  onChange: (patch: Partial<TextSection>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-400 bg-neutral-50 rounded p-2">
        Edit rich text content in{' '}
        <a href="/admin/cms" className="underline" target="_blank">
          Sanity Studio
        </a>
        .
      </p>

      <Field label="Max Width">
        <SelectInput
          value={section.maxWidth ?? 'md'}
          onChange={(v) => onChange({ maxWidth: v as TextSection['maxWidth'] })}
          options={[
            { label: 'Small (640px)', value: 'sm' },
            { label: 'Medium (768px)', value: 'md' },
            { label: 'Large (1024px)', value: 'lg' },
            { label: 'Extra Large (1280px)', value: 'xl' },
            { label: 'Full Width', value: 'full' },
          ]}
        />
      </Field>

      <Field label="Text Alignment">
        <SelectInput
          value={section.textAlign ?? 'left'}
          onChange={(v) => onChange({ textAlign: v as TextSection['textAlign'] })}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ]}
        />
      </Field>

      <Field label="Font Size">
        <SelectInput
          value={section.fontSize ?? 'base'}
          onChange={(v) => onChange({ fontSize: v as TextSection['fontSize'] })}
          options={[
            { label: 'Small', value: 'sm' },
            { label: 'Normal', value: 'base' },
            { label: 'Large', value: 'lg' },
          ]}
        />
      </Field>
    </div>
  )
}

function ImagePanel({
  section,
  onChange,
}: {
  section: ImageSection
  onChange: (patch: Partial<ImageSection>) => void
}) {
  const isFree = section.positionMode === 'free'

  return (
    <div className="space-y-4">
      <Field label="Caption">
        <TextInput
          value={section.caption ?? ''}
          onChange={(v) => onChange({ caption: v })}
          placeholder="Image caption\u2026"
        />
      </Field>

      <SectionDivider label="Display" />

      <ToggleInput
        value={section.fullWidth ?? false}
        onChange={(v) => onChange({ fullWidth: v })}
        label="Full width"
      />

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.aspectRatio ?? '16/10'}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: '16:10', value: '16/10' },
            { label: '16:9 (Widescreen)', value: '16/9' },
            { label: '4:3', value: '4/3' },
            { label: '3:2', value: '3/2' },
            { label: '1:1 (Square)', value: '1/1' },
            { label: '21:9 (Ultrawide)', value: '21/9' },
          ]}
        />
      </Field>

      <Field label="Image Fit">
        <SelectInput
          value={section.objectFit ?? 'cover'}
          onChange={(v) => onChange({ objectFit: v as ImageSection['objectFit'] })}
          options={[
            { label: 'Cover (fill frame)', value: 'cover' },
            { label: 'Contain (show all)', value: 'contain' },
            { label: 'Fill (stretch)', value: 'fill' },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      <SectionDivider label="Effects" />

      <ToggleInput
        value={section.grayscale ?? false}
        onChange={(v) => onChange({ grayscale: v })}
        label="Grayscale"
      />

      <Field label={`Opacity: ${Math.round((section.opacity ?? 1) * 100)}%`}>
        <NumberInput
          value={section.opacity ?? 1}
          onChange={(v) => onChange({ opacity: v })}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>

      <SectionDivider label="Position Mode" />

      <Field label="Mode">
        <SelectInput
          value={section.positionMode ?? 'flow'}
          onChange={(v) => onChange({ positionMode: v as ImageSection['positionMode'] })}
          options={[
            { label: 'Normal (flow layout)', value: 'flow' },
            { label: 'Free (drag anywhere)', value: 'free' },
          ]}
        />
      </Field>

      {isFree && (
        <>
          <Field label={`Canvas Height: ${section.sectionHeight ?? 500}px`}>
            <NumberInput
              value={section.sectionHeight ?? 500}
              onChange={(v) => onChange({ sectionHeight: v })}
              min={100}
              max={2000}
              step={50}
            />
          </Field>

          <SectionDivider label="Free Position" />

          <Field label={`X Position: ${section.xPercent ?? 0}%`}>
            <NumberInput
              value={section.xPercent ?? 0}
              onChange={(v) => onChange({ xPercent: v })}
              min={-50}
              max={150}
            />
          </Field>

          <Field label={`Y Position: ${section.yPercent ?? 0}%`}>
            <NumberInput
              value={section.yPercent ?? 0}
              onChange={(v) => onChange({ yPercent: v })}
              min={-50}
              max={150}
            />
          </Field>

          <Field label={`Width: ${section.widthPercent ?? 100}%`}>
            <NumberInput
              value={section.widthPercent ?? 100}
              onChange={(v) => onChange({ widthPercent: v })}
              min={5}
              max={200}
            />
          </Field>

          <Field label={`Z-Index: ${section.zIndex ?? 0}`}>
            <NumberInput
              value={section.zIndex ?? 0}
              onChange={(v) => onChange({ zIndex: v })}
              min={0}
              max={20}
            />
          </Field>

          <Field label={`Rotation: ${section.rotation ?? 0}\u00B0`}>
            <NumberInput
              value={section.rotation ?? 0}
              onChange={(v) => onChange({ rotation: v })}
              min={-180}
              max={180}
            />
          </Field>
        </>
      )}
    </div>
  )
}

function GalleryPanel({
  section,
  onChange,
}: {
  section: GallerySection
  onChange: (patch: Partial<GallerySection>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-400 bg-neutral-50 rounded p-2">
        Manage gallery images in{' '}
        <a href="/admin/cms" className="underline" target="_blank">
          Sanity Studio
        </a>
        .
      </p>

      <Field label="Columns">
        <SelectInput
          value={String(section.columns ?? 2)}
          onChange={(v) => onChange({ columns: Number(v) as 2 | 3 })}
          options={[
            { label: '2 columns', value: '2' },
            { label: '3 columns', value: '3' },
          ]}
        />
      </Field>

      <Field label={`Gap: ${section.gap ?? 12}px`}>
        <NumberInput
          value={section.gap ?? 12}
          onChange={(v) => onChange({ gap: v })}
          min={0}
          max={64}
        />
      </Field>

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.aspectRatio ?? '3/2'}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: '3:2', value: '3/2' },
            { label: '4:3', value: '4/3' },
            { label: '1:1 (Square)', value: '1/1' },
            { label: '16:9', value: '16/9' },
          ]}
        />
      </Field>

      <Field label="Image Fit">
        <SelectInput
          value={section.objectFit ?? 'cover'}
          onChange={(v) => onChange({ objectFit: v as GallerySection['objectFit'] })}
          options={[
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>
    </div>
  )
}

function VideoPanel({
  section,
  onChange,
}: {
  section: VideoSection
  onChange: (patch: Partial<VideoSection>) => void
}) {
  return (
    <div className="space-y-4">
      <Field label="Vimeo URL">
        <TextInput
          value={section.vimeoUrl ?? ''}
          onChange={(v) => onChange({ vimeoUrl: v })}
          placeholder="https://vimeo.com/\u2026"
        />
      </Field>

      <Field label="Caption">
        <TextInput
          value={section.caption ?? ''}
          onChange={(v) => onChange({ caption: v })}
          placeholder="Video caption\u2026"
        />
      </Field>

      <SectionDivider label="Playback" />

      <ToggleInput
        value={section.loop ?? false}
        onChange={(v) => onChange({ loop: v })}
        label="Loop"
      />

      <ToggleInput
        value={section.autoplay ?? false}
        onChange={(v) => onChange({ autoplay: v })}
        label="Autoplay (muted)"
      />

      <SectionDivider label="Display" />

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.aspectRatio ?? '16/9'}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: '16:9 (Widescreen)', value: '16/9' },
            { label: '4:3', value: '4/3' },
            { label: '1:1 (Square)', value: '1/1' },
            { label: '9:16 (Vertical)', value: '9/16' },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>
    </div>
  )
}

function SplitPanel({
  section,
  onChange,
}: {
  section: SplitSection
  onChange: (patch: Partial<SplitSection>) => void
}) {
  return (
    <div className="space-y-4">
      <Field label="Caption">
        <TextInput
          value={section.caption ?? ''}
          onChange={(v) => onChange({ caption: v })}
          placeholder="Image caption\u2026"
        />
      </Field>

      <SectionDivider label="Layout" />

      <Field label="Image Position">
        <SelectInput
          value={section.imagePosition ?? 'left'}
          onChange={(v) => onChange({ imagePosition: v as SplitSection['imagePosition'] })}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ]}
        />
      </Field>

      <Field label="Vertical Alignment">
        <SelectInput
          value={section.verticalAlign ?? 'center'}
          onChange={(v) => onChange({ verticalAlign: v as SplitSection['verticalAlign'] })}
          options={[
            { label: 'Top', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'Bottom', value: 'end' },
          ]}
        />
      </Field>

      <Field label={`Column Gap: ${section.gap ?? 24}px`}>
        <NumberInput
          value={section.gap ?? 24}
          onChange={(v) => onChange({ gap: v })}
          min={0}
          max={120}
        />
      </Field>

      <SectionDivider label="Image" />

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.imageAspectRatio ?? '4/3'}
          onChange={(v) => onChange({ imageAspectRatio: v })}
          options={[
            { label: '4:3', value: '4/3' },
            { label: '1:1 (Square)', value: '1/1' },
            { label: '3:2', value: '3/2' },
            { label: '16:9', value: '16/9' },
            { label: '3:4 (Portrait)', value: '3/4' },
          ]}
        />
      </Field>

      <Field label="Image Fit">
        <SelectInput
          value={section.objectFit ?? 'cover'}
          onChange={(v) => onChange({ objectFit: v as SplitSection['objectFit'] })}
          options={[
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>
    </div>
  )
}

// === Free object panels ===

function FreeImagePanel({
  obj,
  onChange,
}: {
  obj: FreeImageObject
  onChange: (patch: Partial<FreeObject>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-400 bg-neutral-50 rounded p-2">
        Change image in{' '}
        <a href="/admin/cms" className="underline" target="_blank">
          Sanity Studio
        </a>
        .
      </p>

      <Field label={`Border Radius: ${obj.borderRadius ?? 0}px`}>
        <NumberInput
          value={obj.borderRadius ?? 0}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      <ToggleInput
        value={obj.grayscale ?? false}
        onChange={(v) => onChange({ grayscale: v })}
        label="Grayscale"
      />

      <FreePositionControls obj={obj} onChange={onChange} />
    </div>
  )
}

function FreeVideoPanel({
  obj,
  onChange,
}: {
  obj: FreeVideoObject
  onChange: (patch: Partial<FreeObject>) => void
}) {
  return (
    <div className="space-y-4">
      <Field label="Vimeo URL">
        <TextInput
          value={obj.vimeoUrl ?? ''}
          onChange={(v) => onChange({ vimeoUrl: v })}
          placeholder="https://vimeo.com/\u2026"
        />
      </Field>

      <SectionDivider label="Playback" />

      <ToggleInput
        value={obj.loop ?? false}
        onChange={(v) => onChange({ loop: v })}
        label="Loop"
      />

      <ToggleInput
        value={obj.autoplay ?? false}
        onChange={(v) => onChange({ autoplay: v })}
        label="Autoplay (muted)"
      />

      <SectionDivider label="Display" />

      <Field label="Aspect Ratio">
        <SelectInput
          value={obj.aspectRatio ?? '16/9'}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: '16:9', value: '16/9' },
            { label: '4:3', value: '4/3' },
            { label: '1:1', value: '1/1' },
            { label: '9:16 (Vertical)', value: '9/16' },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${obj.borderRadius ?? 0}px`}>
        <NumberInput
          value={obj.borderRadius ?? 0}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      <FreePositionControls obj={obj} onChange={onChange} />
    </div>
  )
}

function FreeTextPanel({
  obj,
  onChange,
}: {
  obj: FreeTextObject
  onChange: (patch: Partial<FreeObject>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-400 bg-neutral-50 rounded p-2">
        Edit text content in{' '}
        <a href="/admin/cms" className="underline" target="_blank">
          Sanity Studio
        </a>
        .
      </p>

      <Field label="Font Size">
        <SelectInput
          value={obj.fontSize ?? 'base'}
          onChange={(v) => onChange({ fontSize: v as FreeTextObject['fontSize'] })}
          options={[
            { label: 'Small', value: 'sm' },
            { label: 'Normal', value: 'base' },
            { label: 'Large', value: 'lg' },
            { label: 'XL', value: 'xl' },
          ]}
        />
      </Field>

      <Field label="Text Alignment">
        <SelectInput
          value={obj.textAlign ?? 'left'}
          onChange={(v) => onChange({ textAlign: v as FreeTextObject['textAlign'] })}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ]}
        />
      </Field>

      <Field label="Text Color">
        <TextInput
          value={obj.color ?? '#171717'}
          onChange={(v) => onChange({ color: v })}
          placeholder="#171717"
        />
      </Field>

      <FreePositionControls obj={obj} onChange={onChange} />
    </div>
  )
}

// === Main panel ===

export default function PropertiesPanel(props: PropsPanelProps) {
  const { onClose, onChange } = props

  const typeLabels: Record<string, string> = {
    heroSection: 'Hero',
    textSection: 'Text',
    imageSection: 'Image',
    gallerySection: 'Gallery',
    videoSection: 'Video',
    splitSection: 'Split',
    freeImageObject: 'Free Image',
    freeVideoObject: 'Free Video',
    freeTextObject: 'Free Text',
  }

  const itemType = props.section?._type ?? props.freeObject?._type ?? ''

  function renderPanel() {
    if (props.section) {
      const section = props.section
      const sectionOnChange = onChange as (patch: Partial<Section>) => void
      switch (section._type) {
        case 'heroSection':
          return <HeroPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
        case 'textSection':
          return <TextPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
        case 'imageSection':
          return <ImagePanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
        case 'gallerySection':
          return <GalleryPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
        case 'videoSection':
          return <VideoPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
        case 'splitSection':
          return <SplitPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
        default:
          return <p className="text-sm text-neutral-400">No properties available.</p>
      }
    }

    if (props.freeObject) {
      const obj = props.freeObject
      const freeOnChange = onChange as (patch: Partial<FreeObject>) => void
      switch (obj._type) {
        case 'freeImageObject':
          return <FreeImagePanel obj={obj} onChange={freeOnChange} />
        case 'freeVideoObject':
          return <FreeVideoPanel obj={obj} onChange={freeOnChange} />
        case 'freeTextObject':
          return <FreeTextPanel obj={obj} onChange={freeOnChange} />
        default:
          return <p className="text-sm text-neutral-400">No properties available.</p>
      }
    }

    return null
  }

  return (
    <div className="w-72 shrink-0 bg-white border-l border-neutral-200 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div>
          <span className="text-xs text-neutral-400 uppercase tracking-wide">Properties</span>
          <h3 className="text-sm font-semibold text-neutral-900">
            {typeLabels[itemType] ?? itemType}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 text-lg leading-none p-1"
          aria-label="Close properties"
        >
          x
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">{renderPanel()}</div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50">
        <p className="text-xs text-neutral-400">
          Changes preview instantly.{' '}
          <span className="font-medium">Save draft</span> or{' '}
          <span className="font-medium">publish</span> to apply.
        </p>
      </div>
    </div>
  )
}
