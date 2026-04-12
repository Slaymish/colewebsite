# Tech Debt

This document tracks known technical debt and architectural inconsistencies in the codebase. It is updated as issues are discovered or resolved.

---

## Medium Priority

### Asset `"_id" in asset` check scattered
**Files:** `components/Header.tsx`, `app/about/page.tsx`, `components/sections/VideoSection.tsx`, `app/admin/edit/[slug]/EditableFreeObject.tsx`, and others.  
**Issue:** Every place that resolves a Sanity image URL must check `"_id" in asset` to distinguish a fetched asset from a reference stub. Missing one check causes a runtime null error.  
**Suggested fix:** Use the `isResolvedAsset(asset)` helper in `lib/sanity.ts` consistently (helper already exists, not all call sites use it yet).

---

## Low Priority

### Font size / style constant maps duplicated
**Files:** `components/sections/TextSection.tsx`, `app/admin/edit/[slug]/PropertiesPanel.tsx`  
**Issue:** `fontSizeMap`, `maxWidthMap`, etc. are defined independently in each file.  
**Suggested fix:** Centralise in `lib/styleConstants.ts`.

### `sections.ts` is monolithic (900+ lines)
**File:** `sanity/schemas/sections.ts`  
**Issue:** All section and free object schemas live in one large file. Hard to navigate and prone to merge conflicts.  
**Suggested fix:** Split into one file per section type under `sanity/schemas/sections/`.

### No shared borderRadius field definition in schemas
**File:** `sanity/schemas/sections.ts`  
**Issue:** `borderRadius` is defined identically (min 0, max 48) in 10+ schema objects.  
**Suggested fix:** Extract as a shared field definition: `const borderRadiusField = defineField({ name: 'borderRadius', ... })`.

### Admin save endpoint has no audit trail
**File:** `app/api/admin/save/route.ts`  
**Issue:** Saves are applied directly to Sanity with no logging of who saved, what changed, or when. Difficult to debug accidental overwrites.  
**Suggested fix:** Log `{ projectId, status, timestamp, fieldsChanged }` to a server log or Sanity document revision history.

### `BackToTopButton` is always visible
**File:** `components/BackToTopButton.tsx`  
**Issue:** The button is always rendered regardless of scroll position. On short pages it floats over the footer unnecessarily.  
**Suggested fix:** Only show the button when `scrollY > window.innerHeight / 2`.

---

## Resolved

- **`renderBlock` function duplicated in 3 places** — Extracted to `lib/renderBlock.tsx` with `variant: "section" | "compact"` option. All call sites updated.
- **Vimeo helpers duplicated** — Moved to `lib/vimeo.ts` (`getVimeoId`, `buildVimeoEmbedUrl`). All call sites updated.
- **Vimeo oEmbed fetched on every client render** — Added memory + `localStorage` cache in `lib/vimeoOEmbed.ts`.
- **VideoSection autoplay vs. schema field inconsistency** — `section.autoplay` is now wired to the Vimeo embed URL via `buildVimeoEmbedUrl`.
- **SplitSection text content supports fewer styles than TextSection** — Replaced local `renderContent()` with shared `renderBlock` helper.
- **Editor NumberInput has no clamping** — Added `onBlur` handler that clamps to `min`/`max` in `PropertiesPanel.tsx`.
- **Free objects have no mobile fallback** — `FreeObjectRenderer` now renders a `md:hidden` stacked fallback (sorted by `yPercent`) and a `hidden md:block` absolute-positioned desktop layer. The project page `minHeight` is now `md:min-h-[500px]` (desktop-only).
