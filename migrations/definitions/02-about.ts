/**
 * About — one entry, read by the about page. Contact details live in site
 * settings rather than here, because the footer and the contact page need them
 * too and one of them would otherwise be reading the About entry for a phone
 * number.
 */
import type { MigrationFunction } from 'contentful-migration';
import { CONTENT_TYPE, LIMIT } from '~/lib/content-model';

const definition: MigrationFunction = (migration) => {
  const about = migration.createContentType(CONTENT_TYPE.about, {
    name: 'About',
    description: 'The about page. There should only ever be one of these.',
  });

  about.createField('internalName', {
    name: 'Internal name',
    type: 'Symbol',
    required: true,
  });
  about.changeFieldControl('internalName', 'builtin', 'singleLine', {
    helpText:
      'Only so this entry has a name in the list. It never appears on the site. ' +
      '“About” is fine.',
  });

  about.createField('body', {
    name: 'About you',
    type: 'Text',
    required: true,
    validations: [{ size: { max: LIMIT.aboutBody } }],
  });
  about.changeFieldControl('body', 'builtin', 'multipleLine', {
    helpText:
      'A few paragraphs — the work you take on, how you work, where you are. ' +
      'Leave a blank line between paragraphs and they stay separate on the page.',
  });

  about.createField('portrait', {
    name: 'Portrait',
    type: 'Link',
    linkType: 'Asset',
    validations: [{ linkMimetypeGroup: ['image'] }],
  });
  about.changeFieldControl('portrait', 'builtin', 'assetLinkEditor', {
    helpText: 'A picture of you, beside the text. Upright works best.',
  });

  about.createField('email', { name: 'Email shown here', type: 'Symbol' });
  about.changeFieldControl('email', 'builtin', 'singleLine', {
    helpText:
      'Optional. Leave it empty and the about page shows the contact email from ' +
      'site settings, which is the one to change if you only want to change it once.',
  });

  about.displayField('internalName');
};

export default definition;
