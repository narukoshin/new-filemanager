# ÞERXWOLD File Manager — frontend

Vue 3, TypeScript, Vite, and Sass frontend for the ÞERXWOLD file manager.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Structure

- `src/components` contains the Vue view components.
- `src/composables/useFileManager.ts` coordinates the interactive browser
  lifecycle.
- `src/composables/fileManager` contains its DOM registry, file-domain helpers,
  and element factories—small modules are much less likely to become dramatic.
- `src/data` provides temporary in-memory data for the frontend prototype.
- `src/types` contains the shared file-manager domain types.
- `src/utils` contains small DOM and validation helpers.
- `src/assets/sass` contains indented Sass tokens, base rules, and component
  partials.

## Conventions

- TypeScript uses typed arrow functions where practical.
- Public helpers and lifecycle-heavy modules include concise JSDoc.
- JavaScript and TypeScript use four-space indentation, double quotes, and no
  semicolons.
- Shared visual values belong in `src/assets/sass/_config.sass`.

## Backend boundary

Authentication, file operations, user administration, and settings currently
use in-memory browser state. The `useFileManager` composable documents the
temporary boundary that will be replaced by the Go API.
