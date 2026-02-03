import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true, // Enables authentication
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
