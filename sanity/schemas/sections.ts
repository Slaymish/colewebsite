import { defineType, defineArrayMember } from 'sanity'

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    {
      name: 'heading',
      title: 'Heading',
      type: 'string',
    },
    {
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    },
    {
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (r) => r.required().warning('Alt text is required for accessibility'),
        },
      ],
    },
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Hero Section', subtitle: 'Hero' }),
  },
})

export const textSection = defineType({
  name: 'textSection',
  title: 'Text Section',
  type: 'object',
  fields: [
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        }),
      ],
    },
  ],
  preview: {
    prepare: () => ({ title: 'Text Section', subtitle: 'Text' }),
  },
})

export const imageSection = defineType({
  name: 'imageSection',
  title: 'Image Section',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (r) => r.required().warning('Alt text is required for accessibility'),
        },
      ],
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'fullWidth',
      title: 'Full Width',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: { title: 'caption', media: 'image' },
    prepare: ({ title, media }) => ({ title: title || 'Image Section', subtitle: 'Image', media }),
  },
})

export const gallerySection = defineType({
  name: 'gallerySection',
  title: 'Gallery Section',
  type: 'object',
  fields: [
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (r) => r.required().warning('Alt text is required'),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        }),
      ],
      validation: (r) => r.min(2),
    },
    {
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 2,
      options: {
        list: [
          { title: '2 columns', value: 2 },
          { title: '3 columns', value: 3 },
        ],
      },
    },
  ],
  preview: {
    select: { count: 'images' },
    prepare: ({ count }) => ({
      title: 'Gallery Section',
      subtitle: `${Array.isArray(count) ? count.length : 0} images`,
    }),
  },
})

export const videoSection = defineType({
  name: 'videoSection',
  title: 'Video Section',
  type: 'object',
  fields: [
    {
      name: 'vimeoUrl',
      title: 'Vimeo URL',
      type: 'url',
      validation: (r) => r.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'autoplay',
      title: 'Autoplay (desktop only, always muted)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'loop',
      title: 'Loop',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'poster',
      title: 'Poster Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
  ],
  preview: {
    select: { title: 'caption', url: 'vimeoUrl' },
    prepare: ({ title, url }) => ({ title: title || 'Video Section', subtitle: url }),
  },
})

export const splitSection = defineType({
  name: 'splitSection',
  title: 'Split Layout (Image + Text)',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
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
      name: 'imagePosition',
      title: 'Image Position',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    },
    {
      name: 'content',
      title: 'Text Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
          },
        }),
      ],
    },
    {
      name: 'caption',
      title: 'Image Caption',
      type: 'string',
    },
  ],
  preview: {
    select: { media: 'image', pos: 'imagePosition' },
    prepare: ({ media, pos }) => ({
      title: 'Split Section',
      subtitle: `Image ${pos || 'left'}`,
      media,
    }),
  },
})
