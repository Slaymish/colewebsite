/**
 * Site settings — one entry, read by every page.
 *
 * Configuration rather than copy: SEO defaults, contact details, and the links
 * that become `sameAs` in the Person structured data. Everything here is
 * optional, and empty means "use the built-in default" rather than "print
 * nothing" — src/lib/site.ts holds those defaults.
 */
import type { MigrationFunction } from 'contentful-migration';
import { CONTENT_TYPE, LIMIT } from '~/lib/content-model';

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
      'A few words — “Director and Photographer”. It goes in the page title and ' +
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

  settings.displayField('internalName');
};

export default definition;
