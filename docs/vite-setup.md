# Vite Setup

## Overview

This project uses Vite as its development server and build tool, providing fast development experience with Hot Module Replacement (HMR).

## Installation

Vite (v7.1.9) is installed as a dev dependency:

```bash
npm install -D vite
```

## Available Scripts

### Development

```bash
npm run dev
```

Starts Vite dev server with Hot Module Replacement (HMR) on port 8000.

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

Locally preview the production build before deploying.

## Configuration

The project includes a [vite.config.js](../vite.config.js) file with the following settings:

- **Port 8000** - Same port as the previous setup for consistency
- **Auto-open browser** - Automatically opens your default browser when starting the dev server
- **Hot Module Replacement (HMR)** - Instant updates without full page reload
- **Source maps** - Enabled for better debugging experience

## Benefits

- **Instant Hot Module Replacement** - Changes appear instantly without full page reload
- **Lightning fast startup** - Vite starts in milliseconds
- **Optimized builds** - Native ES modules in development, optimized bundles for production
- **Better error reporting** - Clear, helpful error messages in browser overlay
- **Source maps** - Easier debugging with accurate line numbers

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [Vite Configuration Reference](https://vitejs.dev/config/)
