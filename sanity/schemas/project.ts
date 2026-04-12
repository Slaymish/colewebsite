import { defineType, defineArrayMember } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (r) => r.required(),
    },
    {
      name: 'created_at',
      title: 'Date',
      type: 'date',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Group projects in the sidebar navigation (e.g. "Film", "Photography")',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    },
    {
      name: 'sidebarMode',
      title: 'Sidebar',
      type: 'string',
      initialValue: 'auto',
      description: '"Auto" shows the sidebar normally. "Hidden" collapses it — a small toggle lets visitors reopen it.',
      options: {
        list: [
          { title: 'Auto (show sidebar)', value: 'auto' },
          { title: 'Hidden (full-width layout)', value: 'hidden' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'meta_description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Used for SEO. Aim for 150–160 characters.',
      validation: (r) => r.max(160).warning('Keep under 160 characters for best SEO results'),
    },
    {
      name: 'cover_image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (r) => r.required().warning('Alt text is required'),
        },
      ],
    },
    {
      name: 'og_image',
      title: 'OG Image (Social Preview)',
      type: 'image',
      description: 'Optional. Falls back to cover image. Recommended: 1200×630px.',
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'sections',
      title: 'Predefined Sections',
      description: 'Structured layout sections that flow in order.',
      type: 'array',
      of: [
        defineArrayMember({ type: 'heroSection', title: 'Hero' }),
        defineArrayMember({ type: 'textSection', title: 'Text' }),
        defineArrayMember({ type: 'imageSection', title: 'Image' }),
        defineArrayMember({ type: 'gallerySection', title: 'Gallery' }),
        defineArrayMember({ type: 'videoSection', title: 'Video' }),
        defineArrayMember({ type: 'splitSection', title: 'Split (Image + Text)' }),
        defineArrayMember({ type: 'spacingSection', title: 'Spacing' }),
      ],
    },
    {
      name: 'freeObjects',
      title: 'Free Objects',
      description: 'Absolutely positioned elements that can be placed anywhere on the page.',
      type: 'array',
      of: [
        defineArrayMember({ type: 'freeImageObject', title: 'Free Image' }),
        defineArrayMember({ type: 'freeVideoObject', title: 'Free Video' }),
        defineArrayMember({ type: 'freeTextObject', title: 'Free Text' }),
      ],
    },
  ],
  orderings: [
    {
      title: 'Date, newest first',
      name: 'dateDesc',
      by: [{ field: 'created_at', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'cover_image',
    },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle === 'published' ? 'Published' : 'Draft',
      media,
    }),
  },
})
