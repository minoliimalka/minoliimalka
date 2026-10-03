# Minoli Imalka — Architecture Portfolio

Standalone React 19 + TypeScript + Vite 8 + Tailwind CSS v4 project. Hosted as a static site through GitHub and Vercel.

## Development and checks

- Use Node.js 24.x and npm; package-lock.json is the only dependency lockfile.
- Check for an existing server before starting `npm run dev`. Default port: 8443.
- Run `npm run format` for TypeScript/React formatting.
- Run `npm run format:check` and `npm run build` before delivery. The build includes TypeScript checking.
- Vercel builds from source using vercel.json and publishes dist/. Do not commit generated output or node_modules/.

## Structure

- src/App.tsx: reader controls, navigation and image hotspots.
- src/PageTurn.tsx: paper animation and underside color.
- src/portfolio.ts: page descriptions, destinations and image loading.
- src/main.tsx: React entry point and global CSS import.
- src/index.css: Tailwind v4 import and global styling.
- public/portfolio/: WebP artwork, named page-01.webp through page-15.webp.
- index.html: metadata and HTML shell.
- vite.config.ts: React and Tailwind plugins, relative asset base.
- .mise.toml and package.json: Node.js version.
- .github/workflows/ci.yml: formatting and production-build checks.

## Code quality

Preserve existing artwork and aspect ratios. Preload and decode both images before page turns. Keep forward/backward navigation, reduced motion, keyboard controls and touch support working.

Keep CSS imports first. Use Tailwind utilities or global CSS in src/index.css; no Tailwind or PostCSS configuration file is needed.

Use double quotes for strings containing apostrophes or escape single quotes. Close JSX tags and balance braces. Export components as default exports.

Keep secrets, local references and temporary verification files out of Git. Do not add Git LFS rules for this artwork.

