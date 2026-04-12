# Tech Debt

This document tracks known technical debt and architectural inconsistencies in the codebase. It is updated as issues are discovered or resolved.

---

## High Priority

### Free objects have no mobile fallback
**Files:** `components/FreeObjectRenderer.tsx`, `app/project/[slug]/page.tsx`  
**Issue:** Free objects (freeImageObject, freeVideoObject, freeTextObject) are absolutely positioned within a `position: relative` container that has `minHeight: 500px`. On mobile viewports, these objects can overlap or be clipped. There is no stacked/fallback rendering for small screens.  
**Suggested fix:** Add a mobile-only grid fallback in `FreeObjectRenderer` (ordered by `yPercent` then `xPercent`) and hide the absolute-positioned layer on small screens using `md:block hidden` on the free-object container.

---

## Medium Priority

### `renderBlock` function duplicated in 3 places
**Files:**  
- `components/sections/TextSection.tsx` (lines 7–68)  
- `components/sections/FreeTextObject.tsx` (lines 7–57)  
- `app/admin/edit/[slug]/EditableFreeObject.tsx` (lines 21–68)  

**Issue:** Each copy has slightly different styling (e.g. TextSection adds `mt-8` on h2, FreeTextObject does not). A future change to block rendering must be replicated in all three.  
**Suggested fix:** Extract to `lib/renderBlock.ts`, accept a `styleOptions` parameter for per-context variations.

### Vimeo helpers duplicated
**Files:**  
- `components/sections/VideoSection.tsx`  
- `components/sections/FreeVideoObject.tsx`  
- `app/admin/edit/[slug]/EditableFreeObject.tsx`  

**Issue:** `getVimeoId()` regex and URL parameter building are copy-pasted.  
**Suggested fix:** Move to `lib/vimeo.ts` and export `getVimeoId(url)` and `buildVimeoEmbedUrl(id, options)`.

### Asset `"_id" in asset` check scattered
**Files:** `components/Header.tsx`, `app/about/page.tsx`, `components/sections/VideoSection.tsx`, `app/admin/edit/[slug]/EditableFreeObject.tsx`, and others.  
**Issue:** Every place that resolves a Sanity image URL must check `"_id" in asset` to distinguish a fetched asset from a reference stub. Missing one check causes a runtime null error.  
**Suggested fix:** Add a `isResolvedAsset(asset)` helper in `lib/sanity.ts`.

### Vimeo oEmbed fetched on every client render
**Files:** `components/sections/VideoSection.tsx`, `components/sections/FreeVideoObject.tsx`  
**Issue:** Aspect ratio is fetched from Vimeo's oEmbed API on every page load via a `useEffect`. There is no caching layer. For static pages this fires once per visitor per page view.  
**Suggested fix:** Cache in `localStorage` (keyed by Vimeo URL), or prefetch aspect ratio server-side at build time and pass it as a prop.

---

## Low Priority

### Font size / style constant maps duplicated
**Files:** `components/sections/TextSection.tsx`, `components/sections/FreeTextObject.tsx`, `app/admin/edit/[slug]/EditableFreeObject.tsx`  
**Issue:** `fontSizeMap`, `maxWidthMap`, etc. are defined independently in each file.  
**Suggested fix:** Centralise in `lib/styleConstants.ts`.

### `sections.ts` is monolithic (900+ lines)
**File:** `sanity/schemas/sections.ts`  
**Issue:** All section and free object schemas live in one large file. Hard to navigate and prone to merge conflicts.  
**Suggested fix:** Split into one file per section type under `sanity/schemas/sections/`.

### SplitSection text content supports fewer styles than TextSection
**File:** `components/sections/SplitSection.tsx`  
**Issue:** `renderContent()` in SplitSection only handles h3 and normal paragraphs — no bold, italic, links, or blockquotes. TextSection and FreeTextObject support all marks.  
**Suggested fix:** Replace `renderContent` with the shared `renderBlock` helper once extracted.

### No shared borderRadius field definition in schemas
**File:** `sanity/schemas/sections.ts`  
**Issue:** `borderRadius` is defined identically (min 0, max 48) in 10+ schema objects.  
**Suggested fix:** Extract as a shared field definition: `const borderRadiusField = defineField({ name: 'borderRadius', ... })`.

### Editor input validation has no UI feedback
**File:** `app/admin/edit/[slug]/PropertiesPanel.tsx`  
**Issue:** `NumberInput` accepts `min`/`max` props but renders no error state or clamping when the value is out of range. Invalid values are saved silently.  
**Suggested fix:** Clamp on blur or show a red border when out of range.

### Admin save endpoint has no audit trail
**File:** `app/api/admin/save/route.ts`  
**Issue:** Saves are applied directly to Sanity with no logging of who saved, what changed, or when. Difficult to debug accidental overwrites.  
**Suggested fix:** Log `{ projectId, status, timestamp, fieldsChanged }` to a server log or Sanity document revision history.

### VideoSection autoplay vs. schema field inconsistency
**File:** `components/sections/VideoSection.tsx`  
**Issue:** The schema has an `autoplay` toggle but the component hardcodes `autoplay=1` in the Vimeo embed URL for desktop. The field value is not respected on the public page (only in the editor).  
**Suggested fix:** Wire `section.autoplay` to the embed URL parameter.

### `BackToTopButton` is always visible
**File:** `components/BackToTopButton.tsx`  
**Issue:** The button is always rendered regardless of scroll position. On short pages it floats over the footer unnecessarily.  
**Suggested fix:** Only show the button when `scrollY > window.innerHeight / 2`.

---

## Resolved

- *(Nothing resolved yet — add items here as debt is paid down)*
