# Coles Website

## Purpose

Simple, fast portfolio site for Cole Anderson.  
Primary goal: present projects with a clean, flexible layout that is easy for Cole to update. SEO is a priority — aim to appear at or near the top for the query "Cole Anderson".

---

## Client preferences (confirmed)

- Content cadence: Weekly to monthly.
- Layout control: Medium structure. Base layout with optional layout modules.
- Projects must be linkable individually.
- Priorities: 1st simplicity and flexibility (equal), 2nd speed.
- SEO: High priority. Target name search ranking for "Cole Anderson".
- Ownership: Cole will update the site personally.
- Mobile: Secondary but important. Desktop-first design.
- Analytics: Yes (lightweight option acceptable).

## Routes

- `/` — Hero then project list (home).
- `/project/:slug` — Individual project page (deep linkable).
- `/admin`
  - `/admin/edit` — Project list, page shortcuts, and entry to the visual editor.
  - `/admin/edit/[slug]` — Visual project editor (sections, free objects, page settings, autosave, drag reorder).
  - `/admin/edit/home` — Homepage editor — choose Selected Work and drag to reorder.
  - `/admin/edit/about`, `/admin/edit/contact` — Scoped Site Settings editors.

Notes

- Home lists projects in a fixed left column. Clicking loads project into main area without full page reload. Also ensure `/project/:slug` works for direct linking and sharing.

## Data model

### Project (CMS)

- `slug` (string, unique)
- `title`
- `meta_description`
- `created_at`
- `status` (`draft` | `published`)
- `tags` (list)
- `cover_image` (URL + alt)
- `sections` (ordered list of content blocks referencing layout items and media)
- `og_image` (optional)

### Site settings

- `logo`
- `favicon`
- `copyright`
- `social_links`
- `contact_info`
- `cv` (file or link)

### Layout DB

- `layout_id` (string)
- `project_slug` (reference) or shared layout templates
- `items`: list of
  - `item_id`
  - `type` (`text`, `image`, `gallery`, `video`, `embed`, `module`)
  - `position` (x, y, width, height) — used where appropriate for desktop; prefer modular constraints for responsiveness
  - `properties` depending on type (font weight/size/colour, z-index, autoplay, loop, muted, caption)

Design principle

- Use a small set of base layouts plus optional modules per project. Do not rely on arbitrary pixel-perfect placement for responsive sizes. Save exact positioning only for desktop templates; store module variants for tablet and mobile fallbacks.

---

## Admin / Editor guidance

Keep the editor simple and robust for a non-technical user.

Minimum viable editor

- Section-based editor with:
  - Add / remove / reorder sections
  - Choose from pre-defined modules (hero, single image, gallery, text column, video)
  - Edit content fields (title, caption, alt text, link)
  - Toggle publish / draft
- Optional: lightweight visual placement for desktop-only tweaks. This is an advanced feature and should be gated behind "advanced" mode to avoid accidental breakage.

Avoid building a fully custom drag-and-drop system unless the client explicitly needs it. It multiplies development and support cost.

---

## Behaviour & interaction

- Deep linking: `/project/:slug` must render the project standalone and within the home layout.
- Back button: make project selection history-aware so the browser back button restores previous state.
- Scroll behaviour: clicking hero scrolling should animate to the next section. Provide a non-animated fallback if reduced motion is preferred.
- Loading: load project content asynchronously without full page reload. Provide accessible focus management and announce changes for screen readers.
- Mobile: use stacked module fallbacks. Desktop layout can be richer, but always provide a clean vertical read on small screens.

---

## Performance & assets

- Images: require CMS to accept at least two sizes and a srcset. Enforce recommended maxs on upload (e.g. 2–3 MB originals, auto-generate web optimised derivatives).
- Video: prefer hosted embeds (Vimeo/Cloud) or transcoded mp4 + poster. Autoplay only on desktop, muted, loop optional. No autoplay on mobile by default.
- Lazy load off-screen media.
- Use modern image formats (AVIF/WebP) where supported.
- Prioritise first contentful paint and keep main JS minimal.

Suggested limits (to tune):

- Hero images < 500 KB compressed derivative.
- Project images < 1 MB compressed derivative.
- Avoid heavy client-side bundles.

---

## SEO requirements (high priority)

- Each project must have unique `title` and `meta_description`.
- Proper canonical URLs.
- Open Graph and Twitter card metadata per project. Ensure `og:image` is set and sized for social previews.
- Sitemap.xml and robots.txt. Update sitemap on publish/unpublish.
- Structured data for person and projects (schema.org `Person` and `CreativeWork`). Include name "Cole Anderson" in relevant places.
- Fast load times and responsive layout to aid search ranking.
- Make sure page headings and semantic HTML are correct.
- Implement hreflang only if site will have other language versions.

Specific target

- Title formatting suggestion: `Cole Anderson — [Project Title]` on project pages. This helps the name ranking intent.

---

## Analytics and privacy

- Add lightweight analytics (Plausible or GA4). Respect privacy and consent where required.
- Track basic events: project views, external link clicks, form submissions.
- Consider server-side analytics for reliability and privacy.

---

## Accessibility (minimum)

- Mandatory alt text in CMS for all images.
- Captions/transcripts for videos where possible.
- Keyboard navigation for editor and public site.
- ARIA roles where applicable.
- Colour contrast checks for any custom text colours.

---

## Content workflow & editorial

- Authoring flow:
  1. Create project as `draft`.
  2. Populate sections and set alt text, captions, and OG image.
  3. Preview on desktop and mobile templates.
  4. Publish. Publishing updates sitemap and invalidates caches.
- Versioning: keep simple version history for undo. At minimum allow revert to previous published version.

---

## Hosting, backups and deployment

- Recommend static or hybrid host (Vercel, Netlify, similar) for speed and SEO if using React/Next. If server-rendered features are needed, use a host that supports SSR.
- Automatic builds on push to main. Preview deploys for pull requests.
- Backups: daily export of CMS and media to S3 or equivalent. Retain 30 days.
- Rollback: keep the last stable build available for rapid rollback.

---

## Roles & handover

- Owner: Cole (will maintain content). Provide login and short admin guide.
- Developer: responsible for platform, updates, backups, and major layout changes. Agree SLA for bug fixes after launch.
- Handover should include:
  - Admin credentials and a 1 page quickstart for content edits.
  - Screenshot checklist for publishing a project.
  - Export of the site settings and a backup.

---

## Launch checklist

- [ ] All published projects have `title`, `meta_description`, `og_image`, `alt` text.
- [ ] Sitemap.xml generated and submitted to Google Search Console.
- [ ] robots.txt configured.
- [ ] Analytics deployed and verified.
- [ ] Performance audit passed (Lighthouse: FCP and TTI acceptable).
- [ ] Accessibility quick audit passed.
- [ ] Backup schedule configured.
- [ ] DNS and hosting ownership confirmed.
- [ ] Admin quickstart document delivered to Cole.

---

## How you update content (short)

1. Log in to `/admin/edit`.
2. Create or open a project (or use the Home / About / Contact shortcuts).
3. Add sections using the editor modules. Fill alt and OG fields.
4. Save as draft (autosave runs in the background) and use Preview.
5. Publish. Confirm project page loads at `/project/:slug`. Check sitemap and analytics.

---

## Recommended tech choices (opinionated)

- Front end: Next.js or Remix for SEO and decent defaults. Static generation where possible.
- CMS: Headless (Sanity, Strapi, or a lightweight custom CMS) that supports structured content, media transforms, and role-based access.
- Image hosting: Cloudinary, Imgix or built-in Next.js Image optimisation.
- Analytics: Plausible if privacy-first, GA4 if more detail needed.

---

## Final notes

- Keep the editor simple. Medium structure plus modular options gives the best trade-off between control and maintenance.
- Do not overbuild a pixel-perfect drag-and-drop system unless the client insists. That feature will be the largest ongoing cost.
- We want Cole visible in search. Consistent name usage, titles, structured data, and fast pages are the practical levers.

If you want, I will convert this into a 1-page admin quickstart for Cole and a 1-page developer checklist for the first sprint.
