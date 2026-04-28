import type { CollectionConfig } from 'payload'
import { generateLqipHook } from '@/lib/hooks/generate-lqip'
import { generatePreviewHook } from '@/lib/hooks/generate-preview'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    // Both hooks run during PR 1's two-step deploy window: the new ASCII
    // preview is the canonical render path going forward, but lqip is still
    // written so existing render fallbacks continue to function during the
    // window between PR 1 deploy and the post-deploy backfill run. Both
    // hooks fail-soft on bad inputs and never block the upload.
    // The lqip hook + field will be removed in PR 2.
    beforeChange: [generateLqipHook, generatePreviewHook],
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'lqip',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'Legacy AVIF data URL placeholder. Used as a fallback during the PR 1 → PR 2 deploy window. Will be removed once all docs have a populated preview.',
      },
    },
    {
      name: 'preview',
      type: 'group',
      admin: {
        description:
          'Auto-generated content-aware preview. Populated on upload (or by backfill).',
      },
      fields: [
        {
          name: 'color',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Dominant color (#rrggbb).',
          },
        },
        {
          name: 'ascii',
          type: 'text',
          admin: {
            readOnly: true,
            description: '24×12 luminance halftone (288 chars, row-major).',
          },
        },
      ],
    },
  ],
}
