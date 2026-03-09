import { defineType, defineArrayMember } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Site Owner Name',
      type: 'string',
      initialValue: 'Cole Anderson',
      validation: (r) => r.required(),
    },
    {
      name: 'bio',
      title: 'Bio / Tagline',
      type: 'text',
      rows: 3,
    },
    {
      name: 'logo',
      title: 'Logo',
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
      name: 'social_links',
      title: 'Social Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'GitHub', value: 'github' },
                  { title: 'Twitter / X', value: 'twitter' },
                  { title: 'Vimeo', value: 'vimeo' },
                  { title: 'Behance', value: 'behance' },
                  { title: 'Other', value: 'other' },
                ],
              },
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        }),
      ],
    },
    {
      name: 'contact_email',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'copyright',
      title: 'Copyright Text',
      type: 'string',
      initialValue: `© ${new Date().getFullYear()} Cole Anderson`,
    },
    {
      name: 'cv',
      title: 'CV / Resume',
      type: 'object',
      fields: [
        {
          name: 'file',
          title: 'CV File (PDF)',
          type: 'file',
        },
        {
          name: 'url',
          title: 'Or external URL',
          type: 'url',
        },
      ],
    },
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
