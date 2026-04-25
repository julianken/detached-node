import type { CollectionConfig } from 'payload'
import { createSlugHook } from '@/lib/slug'
import { publishedOrAuthenticated } from '@/lib/access-control'
import { revalidateAfterChange, revalidateAfterDelete } from '@/lib/revalidate-post'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'type', 'status', 'publishedAt'],
  },
  access: {
    read: publishedOrAuthenticated,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      minLength: 5,
      maxLength: 200,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true, // Creates unique index automatically
      index: true, // Additional index for faster lookups
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [createSlugHook('title')],
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'essay',
      options: [
        { label: 'Essay', value: 'essay' },
        { label: 'Decoder', value: 'decoder' },
        { label: 'Index', value: 'index' },
        { label: 'Field Report', value: 'field-report' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      minLength: 50,
      maxLength: 500,
    },
    {
      name: 'featuredImageLight',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Light-mode hero image' },
    },
    {
      name: 'featuredImageDark',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: "Dark-mode hero image — match the light version's dimensions",
      },
    },
    {
      name: 'focalPoint',
      type: 'group',
      admin: {
        description: 'Crop anchor for hero image (0=left/top, 50=center, 100=right/bottom). Defaults to 50/50.',
      },
      fields: [
        {
          name: 'x',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 50,
          admin: {
            description: 'Horizontal focal point: 0=left, 50=center, 100=right',
          },
        },
        {
          name: 'y',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 50,
          admin: {
            description: 'Vertical focal point: 0=top, 50=center, 100=bottom',
          },
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'references',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'url', type: 'text' },
        { name: 'author', type: 'text' },
        { name: 'publication', type: 'text' },
        { name: 'date', type: 'date' },
      ],
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
      index: true, // Index for status filtering (published posts)
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
      index: true, // Index for sorting by publication date
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
      index: true, // Index for featured post queries
    },
    {
      name: 'theme',
      type: 'select',
      options: [
        { label: 'Isolation', value: 'isolation' },
        { label: 'Signal', value: 'signal' },
        { label: 'Architecture', value: 'architecture' },
      ],
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Cluster theme for pillar page grouping.',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      maxLength: 160,
      admin: {
        position: 'sidebar',
        description: 'Search-optimized title. Falls back to title if blank.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 320,
      admin: {
        position: 'sidebar',
        description: 'Meta description for search results. Falls back to summary if blank.',
      },
    },
  ],
}
