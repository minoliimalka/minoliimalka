# Minoli Imalka — Architecture Portfolio

A React + TypeScript portfolio with curved paper transitions, scroll/swipe navigation, keyboard controls and an accessible page selector.

Production address: https://minoliimalka.vercel.app/

## Develop locally

Use **Node.js 24.x** and npm. The Node version is also declared in package.json and .mise.toml.

```sh
npm ci
npm run dev
```

Open http://localhost:8443/. The PORT environment variable can override the development port.

## GitHub → Vercel

1. Create an empty GitHub repository and push this project's source files, including package-lock.json, vercel.json and public/.
2. In Vercel, import that GitHub repository.
3. Use the repository root as the Root Directory. The committed vercel.json sets:
   - Framework: **Vite**
   - Install command: **npm ci**
   - Build command: **npm run build**
   - Output directory: **dist**
4. Use **Node.js 24.x**. No environment variables, database or server functions are required.
5. Deploy. Assign minoliimalka.vercel.app to the project if available, then verify the portfolio and contact links at that address.

Commit **source files and public artwork**, not dist/ or node_modules/. Vercel builds the site from GitHub. GitHub Actions also runs formatting and production-build checks on pushes and pull requests.

For the first push from this folder, create an empty GitHub repository without an initial README, then run the following. Replace YOUR_USERNAME and YOUR_REPOSITORY with your repository details:

```sh
git init -b main
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

The .gitignore excludes build output, dependencies, environment files, Vercel local state, editor files and local design references. Artwork is committed as ordinary Git files; Git LFS is not required. Keep package-lock.json committed for reproducible installations.

Official guides: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [GitHub integration](https://vercel.com/docs/git/vercel-for-github).

## Checks and other static hosts

```sh
npm run format:check
npm run build
npm run preview
```

The build checks TypeScript before generating dist/. Preview serves that output locally on port 8443; stop the development server first, or run `npm run preview -- --port 8444`.

For manual static hosting, upload only the contents of dist/. Relative asset URLs support domain roots and subdirectories; keep a trailing slash on subdirectory URLs. This app has one URL and does not need SPA rewrite rules.

`npm run format` formats TypeScript and React source. `npm run typecheck` runs TypeScript checks separately.

## Project structure

- `src/App.tsx`: reader navigation and interactive project/contact links.
- `src/PageTurn.tsx`: curved paper animation and sampled underside color.
- `src/portfolio.ts`: page descriptions, project destinations and image loading.
- `src/index.css`: responsive appearance.
- `src/main.tsx`: React entry point.
- `public/portfolio/`: 15 WebP pages with a 16:9 aspect ratio.
- `public/favicon.svg`, `robots.txt`, `sitemap.xml`: public site metadata.
- `index.html`: title, description and canonical URL.
- `vite.config.ts`, `tsconfig.json`: build and type-check settings.

Replace artwork using the same page-NN.webp filenames and 16:9 ratio. If the page count or order changes, update src/portfolio.ts and the corresponding interactive hotspots in src/App.tsx. Original pages are 2400 × 1350; the updated contact page is 1920 × 1080.

Both outgoing and destination images are decoded before a turn starts. Neighboring pages preload, reduced-motion preferences skip animation, and failed navigation keeps the current page available for retry.

If the public domain changes, update index.html, public/robots.txt, public/sitemap.xml, the contact link in src/App.tsx and the contact artwork.

