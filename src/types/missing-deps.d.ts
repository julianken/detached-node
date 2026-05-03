// Shims for packages listed in package.json but not yet installed in this
// dev environment. Remove when the packages are locally available.

declare module 'mermaid' {
  const mermaid: any  // eslint-disable-line @typescript-eslint/no-explicit-any
  export default mermaid
}

declare module 'panzoom' {
  export type PanZoom = any  // eslint-disable-line @typescript-eslint/no-explicit-any
  const panzoom: any  // eslint-disable-line @typescript-eslint/no-explicit-any
  export default panzoom
}

declare module '@payloadcms/storage-s3' {
  import type { Plugin } from 'payload'
  export function s3Storage(config: object): Plugin
}
