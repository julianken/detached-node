// Shim for Payload's CSS side-effect export. The upstream
// `@payloadcms/next/css` export ships only a stylesheet and has no
// `types` condition; TS 6.0 rejects such side-effect imports (TS2882).
declare module '@payloadcms/next/css';
