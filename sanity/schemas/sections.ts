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
    {
      name: 'minHeight',
      title: 'Minimum Height',
      type: 'string',
      initialValue: '60vh',
      options: {
        list: [
          { title: '40vh', value: '40vh' },
          { title: '60vh', value: '60vh' },
          { title: '80vh', value: '80vh' },
          { title: '100vh', value: '100vh' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'overlayOpacity',
      title: 'Overlay Opacity (0–1)',
      type: 'number',
      initialValue: 0.3,
      validation: (r) => r.min(0).max(1),
    },
    {
      name: 'textAlign',
      title: 'Text Alignment',
      type: 'string',
      initialValue: 'left',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'textPosition',
      title: 'Text Position',
      type: 'string',
      initialValue: 'bottom',
      options: {
        list: [
          { title: 'Top', value: 'top' },
          { title: 'Center', value: 'center' },
          { title: 'Bottom', value: 'bottom' },
        ],
        layout: 'radio',
      },
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
    {
      name: 'maxWidth',
      title: 'Max Width',
      type: 'string',
      initialValue: 'md',
      options: {
        list: [
          { title: 'Small', value: 'sm' },
          { title: 'Medium', value: 'md' },
          { title: 'Large', value: 'lg' },
          { title: 'Extra Large', value: 'xl' },
          { title: 'Full Width', value: 'full' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'textAlign',
      title: 'Text Alignment',
      type: 'string',
      initialValue: 'left',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'fontSize',
      title: 'Font Size',
      type: 'string',
      initialValue: 'base',
      options: {
        list: [
          { title: 'Small', value: 'sm' },
          { title: 'Normal', value: 'base' },
          { title: 'Large', value: 'lg' },
        ],
        layout: 'radio',
      },
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
    {
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      initialValue: '16/10',
      options: {
        list: [
          { title: '16:10', value: '16/10' },
          { title: '16:9', value: '16/9' },
          { title: '4:3', value: '4/3' },
          { title: '3:2', value: '3/2' },
          { title: '1:1 (Square)', value: '1/1' },
          { title: '21:9 (Ultrawide)', value: '21/9' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'objectFit',
      title: 'Image Fit',
      type: 'string',
      initialValue: 'cover',
      options: {
        list: [
          { title: 'Cover (fill frame)', value: 'cover' },
          { title: 'Contain (show all)', value: 'contain' },
          { title: 'Fill (stretch)', value: 'fill' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'borderRadius',
      title: 'Border Radius (px)',
      type: 'number',
      initialValue: 2,
      validation: (r) => r.min(0).max(48),
    },
    {
      name: 'grayscale',
      title: 'Grayscale',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'opacity',
      title: 'Opacity (0–1)',
      type: 'number',
      initialValue: 1,
      validation: (r) => r.min(0).max(1),
    },
    {
      name: 'positionMode',
      title: 'Position Mode',
      type: 'string',
      initialValue: 'flow',
      options: {
        list: [
          { title: 'Normal (flow layout)', value: 'flow' },
          { title: 'Free (drag anywhere)', value: 'free' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'sectionHeight',
      title: 'Canvas Height (px) — Free mode only',
      type: 'number',
      initialValue: 500,
      validation: (r) => r.min(100).max(2000),
    },
    {
      name: 'xPercent',
      title: 'X Position (%)',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'yPercent',
      title: 'Y Position (%)',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'widthPercent',
      title: 'Width (%)',
      type: 'number',
      initialValue: 100,
      validation: (r) => r.min(5).max(200),
    },
    {
      name: 'zIndex',
      title: 'Z-Index (layer order)',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'rotation',
      title: 'Rotation (°)',
      type: 'number',
      initialValue: 0,
      validation: (r) => r.min(-180).max(180),
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
    {
      name: 'gap',
      title: 'Gap (px)',
      type: 'number',
      initialValue: 12,
      validation: (r) => r.min(0).max(64),
    },
    {
      name: 'aspectRatio',
      title: 'Image Aspect Ratio',
      type: 'string',
      initialValue: '3/2',
      options: {
        list: [
          { title: '3:2', value: '3/2' },
          { title: '4:3', value: '4/3' },
          { title: '1:1 (Square)', value: '1/1' },
          { title: '16:9', value: '16/9' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'borderRadius',
      title: 'Border Radius (px)',
      type: 'number',
      initialValue: 2,
      validation: (r) => r.min(0).max(48),
    },
    {
      name: 'objectFit',
      title: 'Image Fit',
      type: 'string',
      initialValue: 'cover',
      options: {
        list: [
          { title: 'Cover', value: 'cover' },
          { title: 'Contain', value: 'contain' },
        ],
        layout: 'radio',
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
    {
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      initialValue: '16/9',
      options: {
        list: [
          { title: '16:9 (Widescreen)', value: '16/9' },
          { title: '4:3', value: '4/3' },
          { title: '1:1 (Square)', value: '1/1' },
          { title: '9:16 (Vertical)', value: '9/16' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'borderRadius',
      title: 'Border Radius (px)',
      type: 'number',
      initialValue: 2,
      validation: (r) => r.min(0).max(48),
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
    {
      name: 'imageAspectRatio',
      title: 'Image Aspect Ratio',
      type: 'string',
      initialValue: '4/3',
      options: {
        list: [
          { title: '4:3', value: '4/3' },
          { title: '1:1 (Square)', value: '1/1' },
          { title: '3:2', value: '3/2' },
          { title: '16:9', value: '16/9' },
          { title: '3:4 (Portrait)', value: '3/4' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'verticalAlign',
      title: 'Vertical Alignment',
      type: 'string',
      initialValue: 'center',
      options: {
        list: [
          { title: 'Top', value: 'start' },
          { title: 'Center', value: 'center' },
          { title: 'Bottom', value: 'end' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'gap',
      title: 'Column Gap (px)',
      type: 'number',
      initialValue: 24,
      validation: (r) => r.min(0).max(120),
    },
    {
      name: 'objectFit',
      title: 'Image Fit',
      type: 'string',
      initialValue: 'cover',
      options: {
        list: [
          { title: 'Cover', value: 'cover' },
          { title: 'Contain', value: 'contain' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'borderRadius',
      title: 'Image Border Radius (px)',
      type: 'number',
      initialValue: 2,
      validation: (r) => r.min(0).max(48),
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
