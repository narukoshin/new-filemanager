# ÞERXWOLD File Manager — frontend

Vue 3, TypeScript, Vite, and Sass frontend for the ÞERXWOLD file manager.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Structure

- `src/components` contains the Vue view components.
- `src/backend/contracts.ts` defines the interface Vue expects from a backend.
- `src/backend/index.ts` is the single implementation switch. It currently
  selects the mock adapter; later it will select the Echo HTTP adapter.
- `src/mocks` contains every fixture and simulated backend behavior used by the
  frontend preview.
- `src/composables/fileManager.ts` composes the feature domains and handles
  the few commands that cross their boundaries.
- `src/composables/auth.ts`, `files.ts`, `uploads.ts`, `navigation.ts`,
  `users.ts`, `settings.ts`, `protectedFolders.ts`, and `notifications.ts` own
  their respective reactive state and behavior.
- `src/utils` contains pure file and presentation helpers with no Vue state.
- `src/types` contains the shared file-manager domain types.
- `src/assets/sass` contains indented Sass tokens, base rules, and component partials.