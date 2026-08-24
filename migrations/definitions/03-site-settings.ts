/**
 * Site settings — one entry, read by every page.
 *
 * Configuration rather than copy: SEO defaults, contact details, and the links
 * that become `sameAs` in the Person structured data. Everything here is
 * optional, and empty means "use the built-in default" rather than "print
 * nothing" — src/lib/site.ts holds those defaults.
 */
import type { MigrationFunction } from 'contentful-migration';
import { CONTENT_TYPE, HEX_MESSAGE, HEX_PATTERN, LIMIT } from '~/lib/content-model';

const definition: MigrationFunction = (migration) => {
  const settings = migration.createContentType(CONTENT_TYPE.siteSettings, {
    name: 'Site settings',
    description: 'Applies to the whole site. There should only ever be one of these.',
  });

  settings.createField('internalName', {
    name: 'Internal name',
    type: 'Symbol',
    required: true,
  });
  settings.changeFieldControl('internalName', 'builtin', 'singleLine', {
    helpText: 'Only so this entry has a name in the list. It never appears on the site.',
  });

  settings.createField('bio', {
    name: 'Short bio',
    type: 'Text',
    validations: [{ size: { max: LIMIT.bio } }],
  });
  settings.changeFieldControl('bio', 'builtin', 'multipleLine', {
    helpText: 'A line or two under your name on the homepage. One paragraph.',
  });

  settings.createField('metaDescription', {
    name: 'Search description',
    type: 'Symbol',
    validations: [{ size: { max: LIMIT.metaDescription } }],
  });
  settings.changeFieldControl('metaDescription', 'builtin', 'singleLine', {
    helpText:
      'The sentence Google shows under the site, and the one used on any page ' +
      'that has none of its own. Around 150 characters.',
  });

  settings.createField('shareImage', {
    name: 'Default link preview image',
    type: 'Link',
    linkType: 'Asset',
    validations: [{ linkMimetypeGroup: ['image'] }],
  });
  settings.changeFieldControl('shareImage', 'builtin', 'assetLinkEditor', {
    helpText:
      'Shown when someone pastes a link to the site into a message or a post, ' +
      'unless that page has its own. 1200×630.',
  });

  settings.createField('jobTitle', {
    name: 'What you do',
    type: 'Symbol',
    validations: [{ size: { max: LIMIT.jobTitle } }],
  });
  settings.changeFieldControl('jobTitle', 'builtin', 'singleLine', {
    helpText:
      'A few words — “Object maker and photographer”. It goes in the page title and ' +
      'in the data search engines read about you.',
  });

  settings.createField('profiles', {
    name: 'Links to you elsewhere',
    type: 'Array',
    items: { type: 'Symbol', validations: [] },
  });
  settings.changeFieldControl('profiles', 'builtin', 'tagEditor', {
    helpText:
      'Full web addresses, one per line — Instagram, Vimeo, LinkedIn. They appear ' +
      'in the footer and tell search engines these accounts are yours.',
  });

  settings.createField('contactEmail', { name: 'Contact email', type: 'Symbol' });
  settings.changeFieldControl('contactEmail', 'builtin', 'singleLine', {
    helpText: 'Shown in the footer and on the contact page.',
  });

  settings.createField('contactPhone', { name: 'Contact phone', type: 'Symbol' });
  settings.changeFieldControl('contactPhone', 'builtin', 'singleLine', {
    helpText: 'Optional. Leave it empty and the contact page simply omits it.',
  });

  settings.createField('cv', {
    name: 'CV',
    type: 'Link',
    linkType: 'Asset',
    validations: [{ linkMimetypeGroup: ['pdfdocument'] }],
  });
  settings.changeFieldControl('cv', 'builtin', 'assetLinkEditor', {
    helpText: 'A PDF. The contact page links to it when one is here.',
  });

  settings.createField('copyright', {
    name: 'Footer line',
    type: 'Symbol',
    validations: [{ size: { max: LIMIT.copyright } }],
  });
  settings.changeFieldControl('copyright', 'builtin', 'singleLine', {
    helpText:
      'The small print at the bottom. Leave it empty and it reads “© <year> Cole ' +
      'Anderson”, with the year kept current on its own.',
  });

  /*
   * The palette. Five slots, matching the colour table in docs/design/brief.md —
   * one neutral ground, ink, and two accents, the blue one with a darker variant.
   *
   * Symbol and not a colour picker: Contentful has no built-in one, and an app
   * would have to be installed into the space to get it. The regexp validation is
   * what stops a colour name or a bare `f2f0f0` reaching the build, and the same
   * pattern is checked again in contentful-map.ts, because Contentful never
   * revisits an entry published before a rule arrived.
   *
   * The muted grey, the hairlines and the placeholder boxes are deliberately not
   * here: they are mixed off ink and ground in src/styles/tokens.css, so changing
   * the ground moves all three with it.
   */
  interface Colour {
    id: string;
    name: string;
    helpText: string;
    /** True while no component reads the token, so a change shows nowhere. */
    unusedYet?: boolean;
  }

  const COLOURS: Colour[] = [
    {
      id: 'colourGround',
      name: 'Background',
      helpText:
        'The one colour everything sits on. Every other neutral on the site — the ' +
        'grey text, the thin lines, the empty picture boxes — is mixed from this ' +
        'and the text colour, so changing it moves all of them with it.',
    },
    {
      id: 'colourInk',
      name: 'Text',
      helpText:
        'The near-black body text sits in, and the other half of every mixed grey. ' +
        'Keep this and the background a strong light-and-dark pair: the skip link ' +
        'and the keyboard focus ring swap the two over, so two colours close ' +
        'together leave those unreadable.',
    },
    {
      id: 'colourAccent',
      name: 'Accent 1 — blue',
      helpText: 'The first of the two accents.',
      unusedYet: true,
    },
    {
      id: 'colourAccentDeep',
      name: 'Accent 1 — blue, darker',
      helpText: 'The deeper blue, for wherever it needs to press down.',
      unusedYet: true,
    },
    {
      id: 'colourAccentWarm',
      name: 'Accent 2 — rusty orange',
      helpText: 'The second of the two accents.',
      unusedYet: true,
    },
  ];

  /**
   * Said on the accents because the alternative is Cole setting one, seeing the
   * site unchanged, and reasonably deciding the field is broken. The brief fixes
   * that there are two accents; what either one does is the design round's call.
   */
  const NOT_USED_YET =
    'Nothing on the site uses either accent yet, so changing this will not show ' +
    'anywhere until the design gives them a job.';

  for (const colour of COLOURS) {
    settings.createField(colour.id, {
      name: colour.name,
      type: 'Symbol',
      validations: [{ regexp: { pattern: HEX_PATTERN }, message: HEX_MESSAGE }],
    });
    settings.changeFieldControl(colour.id, 'builtin', 'singleLine', {
      helpText: [
        colour.helpText,
        ...(colour.unusedYet ? [NOT_USED_YET] : []),
        'Leave it empty and the site keeps the colour it was built with.',
      ].join(' '),
    });
  }

  settings.displayField('internalName');
};

export default definition;
