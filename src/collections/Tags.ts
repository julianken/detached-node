import type { CollectionConfig } from 'payload'
import { createSlugHook } from '@/lib/slug'
import { publicRead } from '@/lib/access-control'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: publicRead,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true, // Creates unique index automatically
      index: true, // Additional index for faster lookups
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [createSlugHook('name')],
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
