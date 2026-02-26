import type { CollectionConfig } from 'payload'
import { createSlugHook } from '@/lib/slug'
import { publishedOrAuthenticated } from '@/lib/access-control'

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
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
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
