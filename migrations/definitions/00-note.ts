/**
 * Note — one moment of process. A picture of the making, not the made thing.
 *
 * Its own type rather than fields on `project` so a note can be read on its own:
 * the index shows process between finished work, which fields buried inside a
 * project could never do.
 *
 * Numbered before `project` because project's `process` field validates that it
 * links to this type, and Contentful rejects a link validation naming a type
 * that does not exist yet.
 */
import type { MigrationFunction } from 'contentful-migration';
import { CONTENT_TYPE, LIMIT } from '~/lib/content-model';

const definition: MigrationFunction = (migration) => {
  const note = migration.createContentType(CONTENT_TYPE.note, {
    name: 'Process note',
    description:
      'A picture from partway through, with a line about it. Attach these to a ' +
      'project under “Process”.',
  });

  note.createField('image', {
    name: 'Image',
    type: 'Link',
    linkType: 'Asset',
    required: true,
    validations: [{ linkMimetypeGroup: ['image'] }],
  });
  note.changeFieldControl('image', 'builtin', 'assetLinkEditor', {
    helpText:
      'The picture. A workbench, an offcut, a test — it does not have to be tidy.',
  });

  // Required because it is the display field: a blank one leaves an untitled row
  // in every list Contentful shows, including the picker Cole attaches it from.
  note.createField('caption', {
    name: 'Caption',
    type: 'Symbol',
    required: true,
    validations: [{ size: { max: LIMIT.noteCaption } }],
  });
  note.changeFieldControl('caption', 'builtin', 'singleLine', {
    helpText:
      'A sentence about what is happening here. This is also how the note is ' +
      'labelled when you go looking for it, so make it recognisable.',
  });

  note.createField('date', { name: 'When', type: 'Date' });
  note.changeFieldControl('date', 'builtin', 'datePicker', {
    helpText: 'Optional. Fill it in and the notes on a project read in order.',
    format: 'dateonly',
  });

  note.displayField('caption');
};

export default definition;
