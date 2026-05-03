// Shims for packages listed in package.json but not yet installed in this
// dev environment. Remove when the packages are locally available.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module 'mermaid' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mermaid: any
  export default mermaid
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module 'panzoom' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type PanZoom = any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const panzoom: any
  export default panzoom
}

declare module '@payloadcms/storage-s3' {
  import type { Plugin } from 'payload'
  export function s3Storage(config: object): Plugin
}
