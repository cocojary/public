# VueJS Base Source

Default target: Vue application using Vite, TypeScript, and Pinia with modular frontend structure.

## 1. Default Stack

- Vue: 3
- Node.js: 22 LTS
- Build tool: Vite
- Language: TypeScript
- State management: Pinia
- Default styling: Tailwind CSS
- Test framework: Vitest
- Formatting: Prettier
- Linting: ESLint

If the user says only "VueJS", ask for Vue version, Node.js version, and CSS library first. If they do not answer, default to Vue 3 + Vite + TypeScript + Tailwind CSS on Node.js 22 LTS.

## 1.1 Environment Check

Before generating the scaffold:

- Check `node -v`
- Check `npm -v`
- If Node.js is missing, install the selected Node.js version first
- Re-run version checks after installation

The scaffold should not proceed if the Vue toolchain is unavailable.

## 1.2 Styling Variants

Support these VueJS styling variants:

- Plain CSS
- Tailwind CSS
- Vuetify

If the user does not specify a styling choice, default to Tailwind CSS because it is the most common and flexible starting point for modern Vue projects.

## 2. Standard Directory Structure

```text
project-name/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── views/
│   ├── stores/
│   ├── services/
│   ├── router/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   ├── App.vue
│   └── main.ts
├── tests/
│   └── unit/
│       └── app.spec.ts
├── .editorconfig
├── .gitignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 3. Naming Rules

- Vue components: `PascalCase.vue`
- View files: `PascalCaseView.vue`
- Composables: `useFeature.ts`
- Store files: `feature.store.ts` or `<feature>.store.ts`
- Service files: `feature.service.ts`
- Generic utility files: `kebab-case.ts`
- Type files: `feature.ts` or `<feature>.types.ts`
- Static asset folders: lowercase, short, descriptive

Do not create `helpers`, `common`, or `misc` folders unless there is a real need.

## 4. Required Files

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `.editorconfig`
- `.gitignore`
- `.prettierrc.json`
- `eslint.config.js`
- `src/main.ts`
- `src/App.vue`
- `src/styles/main.css`
- `src/stores/`
- `src/composables/`
- `src/services/`
- `src/types/`
- `src/utils/`
- `tests/unit/app.spec.ts`

Add `src/router/index.ts` and `src/views/HomeView.vue` when the base source includes routing.
Add Pinia setup in `src/main.ts` for the default scaffold.

Variant-specific required files:

- Plain CSS:
  - keep `src/styles/main.css`
- Tailwind CSS:
  - `src/styles/main.css` must include Tailwind imports
  - include Tailwind dependency and Vite-compatible setup
- Vuetify:
  - `src/plugins/vuetify.ts`
  - `src/styles/main.css`
  - `src/App.vue` should mount a minimal `v-app` layout

## 5. Default Format Rules

Configure these defaults:

- Prettier for formatting
- ESLint for Vue + TypeScript linting
- Pinia installed and wired in `main.ts`
- npm scripts for `dev`, `build`, `lint`, `format`, and `test`

Styling-specific scaffold rules:

- Plain CSS:
  - keep styling in `src/styles/main.css` first
  - avoid adding extra CSS tooling
- Tailwind CSS:
  - configure Tailwind in the Vue/Vite-compatible way for the chosen toolchain
  - use utility classes for layout and spacing
  - keep shared overrides in `src/styles/main.css`
- Vuetify:
  - install and configure Vuetify with the Vue app bootstrap
  - keep theme/plugin setup under `src/plugins/`
  - prefer Vuetify components before custom CSS for app shell layout

Expected developer commands:

- `npm run dev`
- `npm run lint`
- `npm run format`
- `npm run test`

## 6. VueJS Base Source Expectations

- Keep `src/main.ts` as the application entry point.
- Use Composition API and TypeScript by default.
- Keep `App.vue` minimal and layout-neutral.
- Add router scaffolding for the default professional scaffold.
- Include Pinia by default for global state management.
- Put reusable UI in `components/`, route screens in `views/`, logic hooks in `composables/`, API access in `services/`, shared types in `types/`, and helpers in `utils/`.
- Align the generated Vue version with the version confirmed during clarification.
- Align the generated toolchain with the Node.js version confirmed during clarification.
- Align the generated styling setup with the chosen CSS library.
- Do not mix Tailwind CSS and Vuetify unless the user explicitly asks for both.
