/**
 * Project — one piece of work. The homepage shows the ones marked as selected.
 *
 * Field help is written to Cole in second person, because a description under
 * the field is the only guidance he gets while editing — anything written in
 * this repo he will never see.
 */
import type { MigrationFunction } from 'contentful-migration';
import { CONTENT_TYPE, LIMIT, SLUG_MESSAGE, SLUG_PATTERN } from '~/lib/content-model';

const definition: MigrationFunction = (migration) => {
  const project = migration.createContentType(CONTENT_TYPE.project, {
    name: 'Project',
    description: 'One piece of work. The selected ones appear on the homepage.',
  });

  project.createField('title', { name: 'Title', type: 'Symbol', required: true });
  project.changeFieldControl('title', 'builtin', 'singleLine', {
    helpText: 'The name of the project, as you would say it out loud.',
  });

  project.createField('slug', {
    name: 'Web address',
    type: 'Symbol',
    required: true,
    validations: [
      { unique: true },
      { regexp: { pattern: SLUG_PATTERN }, message: SLUG_MESSAGE },
    ],
  });
  project.changeFieldControl('slug', 'builtin', 'slugEditor', {
    helpText:
      'The end of this project’s web address: /project/your-slug-here. Lowercase ' +
      'words joined by hyphens. Changing it later breaks any link people already ' +
      'have, so settle it early.',
  });

  project.createField('body', {
    name: 'Description',
    type: 'Text',
    required: true,
    validations: [
      { size: { max: LIMIT.projectBody }, message: 'A few paragraphs at most.' },
    ],
  });
  project.changeFieldControl('body', 'builtin', 'multipleLine', {
    helpText:
      'What the project was, what you did on it, and who it was for. Leave a ' +
      'blank line between paragraphs and they stay separate on the page.',
  });

  project.createField('category', {
    name: 'Category',
    type: 'Symbol',
    validations: [{ size: { max: LIMIT.category } }],
  });
  project.changeFieldControl('category', 'builtin', 'singleLine', {
    helpText:
      'One word or two for the kind of work this is — Film, Photography, Design. ' +
      'It groups projects on the site, so reuse the same spelling each time.',
  });

  project.createField('tags', {
    name: 'Tags',
    type: 'Array',
    items: { type: 'Symbol', validations: [] },
  });
  project.changeFieldControl('tags', 'builtin', 'tagEditor', {
    helpText: 'Roles, clients, techniques — anything worth listing beside the project.',
  });

  project.createField('cover', {
    name: 'Cover image',
    type: 'Link',
    linkType: 'Asset',
    validations: [{ linkMimetypeGroup: ['image'] }],
  });
  project.changeFieldControl('cover', 'builtin', 'assetLinkEditor', {
    helpText:
      'The single image that represents this project in the list. Landscape ' +
      'works best. It is also the first image on the project’s own page.',
  });

  project.createField('gallery', {
    name: 'More images',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Asset',
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
  });
  project.changeFieldControl('gallery', 'builtin', 'assetGalleryEditor', {
    helpText: 'Everything else shown on the project’s page, in order.',
  });

  project.createField('shareImage', {
    name: 'Link preview image',
    type: 'Link',
    linkType: 'Asset',
    validations: [{ linkMimetypeGroup: ['image'] }],
  });
  project.changeFieldControl('shareImage', 'builtin', 'assetLinkEditor', {
    helpText:
      'The picture that appears when someone pastes this link into a message or ' +
      'a post. 1200×630 is the size that fits. Without it the cover image stands ' +
      'in and gets cropped to that shape.',
  });

  project.createField('metaDescription', {
    name: 'Search description',
    type: 'Symbol',
    validations: [{ size: { max: LIMIT.metaDescription } }],
  });
  project.changeFieldControl('metaDescription', 'builtin', 'singleLine', {
    helpText:
      'The sentence Google shows under the link. Around 150 characters. Leave it ' +
      'empty and the first paragraph of the description is used instead.',
  });

  project.createField('featured', {
    name: 'Show on homepage',
    type: 'Boolean',
  });
  project.changeFieldControl('featured', 'builtin', 'boolean', {
    helpText:
      'On means this project appears in the selected work on the homepage. With ' +
      'none switched on, the homepage shows everything.',
    trueLabel: 'Selected',
    falseLabel: 'Not selected',
  });

  project.createField('order', {
    name: 'Order',
    type: 'Integer',
    required: true,
    validations: [{ range: { min: 0 } }],
  });
  project.changeFieldControl('order', 'builtin', 'numberEditor', {
    helpText: 'Lower numbers come first, everywhere projects are listed. Start at 1.',
  });

  project.displayField('title');
};

export default definition;
